// ============================================================
// GramSahay — Gemini AI Client
// ============================================================
// Handles all AI interactions: issue classification, severity
// assessment, authority routing, complaint drafting, community
// insights generation.
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIClassificationResult, IssueCategory, IssueSeverity, AICommunityInsight, CommunityIssue } from '@/types/community';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured. Set VITE_GEMINI_API_KEY in .env');
    }
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI;
}

// ── Issue Classification Agent ────────────────────────────────

const CLASSIFICATION_PROMPT = `You are an AI agent for a community issue reporting platform in India called GramSahay.
Your job is to analyze a reported community issue and return a JSON classification.

Given the issue title and description, you MUST return a valid JSON object with these fields:
{
  "category": one of ["roads", "water", "electricity", "sanitation", "safety", "environment", "public_services", "noise", "encroachment", "other"],
  "severity": one of ["low", "medium", "high", "critical"],
  "summary": "A concise 1-2 sentence summary of the issue",
  "suggestions": ["3-5 actionable suggestions for resolving this issue"],
  "authority": "The specific Indian government body/department responsible (e.g., 'Municipal Corporation - Public Works Department', 'Gram Panchayat', 'Jal Board', 'State Electricity Board')",
  "complaintDraft": "A formal complaint letter draft in English (2-3 paragraphs) addressed to the appropriate authority, including the issue details and requesting resolution",
  "confidence": a number between 0 and 1 indicating classification confidence
}

Rules:
- Be specific to Indian government structure (Gram Panchayat, Nagar Palika, Municipal Corporation, PWD, Jal Nigam, etc.)
- For severity: low = minor inconvenience, medium = affects daily life, high = health/safety risk, critical = immediate danger
- Suggestions should be practical and actionable for both citizens and authorities
- The complaint draft should be professional, include relevant details, and reference applicable government schemes if relevant
- ONLY return the JSON object, no other text`;

export async function classifyIssue(
  title: string,
  description: string,
  location?: string
): Promise<AIClassificationResult> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const userMessage = `Issue Title: ${title}
Issue Description: ${description}
${location ? `Location: ${location}` : ''}`;

    const result = await model.generateContent([
      { text: CLASSIFICATION_PROMPT },
      { text: userMessage },
    ]);

    const responseText = result.response.text();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as AIClassificationResult;

    // Validate required fields
    const validCategories: IssueCategory[] = ['roads', 'water', 'electricity', 'sanitation', 'safety', 'environment', 'public_services', 'noise', 'encroachment', 'other'];
    const validSeverities: IssueSeverity[] = ['low', 'medium', 'high', 'critical'];

    if (!validCategories.includes(parsed.category)) parsed.category = 'other';
    if (!validSeverities.includes(parsed.severity)) parsed.severity = 'medium';
    if (!Array.isArray(parsed.suggestions)) parsed.suggestions = [];
    if (typeof parsed.confidence !== 'number') parsed.confidence = 0.7;

    return parsed;
  } catch (error) {
    console.error('AI Classification failed:', error);
    // Return sensible defaults on failure
    return {
      category: 'other',
      severity: 'medium',
      summary: description.slice(0, 150),
      suggestions: [
        'Contact your local Gram Panchayat or Municipal office',
        'Document the issue with photos and location details',
        'Rally community support by sharing with neighbors',
      ],
      authority: 'Local Municipal Authority',
      complaintDraft: `Subject: Community Issue Report\n\nDear Sir/Madam,\n\nI wish to bring to your attention the following issue: ${title}.\n\n${description}\n\nI request your prompt attention and resolution of this matter.\n\nThank you.`,
      confidence: 0,
    };
  }
}

// ── Community Insights Agent ──────────────────────────────────

const INSIGHTS_PROMPT = `You are a data analyst AI for GramSahay, a community issue platform in India.
Analyze the following community issues data and generate insights.

Return a JSON array of 3-5 insight objects:
[
  {
    "type": "trend" | "alert" | "recommendation",
    "title": "Short insight title",
    "description": "Detailed 2-3 sentence description of the insight",
    "category": "the most relevant issue category or 'overall'"
  }
]

Focus on:
- Patterns in issue categories (which are most common?)
- Status distribution (are issues being resolved?)
- Severity trends (are critical issues piling up?)
- Actionable recommendations for the community
- Areas that need urgent attention

ONLY return the JSON array, no other text.`;

export async function generateCommunityInsights(
  issues: CommunityIssue[]
): Promise<AICommunityInsight[]> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Prepare a summary of issues for the AI
    const issueSummary = issues.slice(0, 50).map(i => ({
      category: i.category,
      severity: i.severity,
      status: i.status,
      upvotes: i.upvotes,
      ward: i.ward,
      daysSinceReport: Math.floor((Date.now() - new Date(i.createdAt).getTime()) / 86400000),
    }));

    const result = await model.generateContent([
      { text: INSIGHTS_PROMPT },
      { text: `Issues data (${issues.length} total, showing top 50):\n${JSON.stringify(issueSummary, null, 2)}` },
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Failed to extract insights JSON');

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      type: 'trend' | 'alert' | 'recommendation';
      title: string;
      description: string;
      category: string;
    }>;

    return parsed.map((p, idx) => ({
      id: `insight-${Date.now()}-${idx}`,
      type: p.type,
      title: p.title,
      description: p.description,
      category: p.category as IssueCategory | 'overall',
      generatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Insights generation failed:', error);
    return [
      {
        id: 'default-1',
        type: 'recommendation',
        title: 'Stay Active in Your Community',
        description: 'Report issues you see, upvote important ones, and help track resolutions. Together, your community can drive real change.',
        category: 'overall',
        generatedAt: new Date().toISOString(),
      },
    ];
  }
}

// ── Voice Issue Processing ────────────────────────────────────

const VOICE_PROMPT = `You are a helpful AI assistant for GramSahay, a community issue reporting platform in India.
A user has described a community issue using their voice. The transcription may be in Hindi, English, or a mix.

From the transcription, extract:
{
  "title": "A clear, concise title for the issue in English (max 10 words)",
  "description": "A detailed description of the issue in English (2-3 sentences)",
  "category": one of ["roads", "water", "electricity", "sanitation", "safety", "environment", "public_services", "noise", "encroachment", "other"],
  "severity": one of ["low", "medium", "high", "critical"]
}

ONLY return the JSON object, no other text.`;

export async function processVoiceReport(
  transcription: string
): Promise<{ title: string; description: string; category: IssueCategory; severity: IssueSeverity }> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      { text: VOICE_PROMPT },
      { text: `Voice transcription: "${transcription}"` },
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to extract JSON from voice processing');

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Voice processing failed:', error);
    return {
      title: 'Voice Report',
      description: transcription,
      category: 'other',
      severity: 'medium',
    };
  }
}

// ── Chat Assistant ────────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `You are GramSahay AI Assistant — a helpful, empathetic community support agent for an Indian community issue reporting platform.

You help citizens:
1. Report and track community issues (roads, water, electricity, sanitation, safety, etc.)
2. Understand government processes and whom to contact
3. Find relevant government schemes (PM Awas Yojana, Swachh Bharat, MGNREGA, etc.)
4. Get practical advice for common community problems
5. Navigate the platform's features

Rules:
- Be warm, helpful, and encouraging
- Give practical, actionable advice specific to India
- Reference specific government departments when relevant
- Support Hindi, English, and mixed language queries
- Keep responses concise (2-4 paragraphs max)
- Encourage community participation and collective action`;

export async function chatWithAssistant(
  message: string,
  history: Array<{ role: 'user' | 'model'; text: string }>
): Promise<string> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: CHAT_SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role as 'user' | 'model',
        parts: [{ text: h.text }],
      })),
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error('Chat failed:', error);
    return 'I apologize, I am having trouble connecting right now. Please try again in a moment. In the meantime, you can report issues directly using the Report Issue page.';
  }
}
