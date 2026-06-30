// ============================================================
// GramSahay — Report Issue Page
// ============================================================

import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Camera, Mic, MicOff, Send, Loader2, ArrowLeft,
  Sparkles, ChevronRight, X, ImagePlus, AlertTriangle,
  Construction, Droplets, Zap, Trash2, ShieldAlert,
  TreePine, Building2, Volume2, Fence, MoreHorizontal,
  CheckCircle2, Shield,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { createIssue, uploadIssueImage } from '@/lib/firestore';
import { classifyIssue, processVoiceReport } from '@/lib/gemini';
import { CATEGORIES, SEVERITIES } from '@/types/community';
import type { IssueCategory, IssueSeverity, AIClassificationResult, GeoPoint } from '@/types/community';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  roads: Construction, water: Droplets, electricity: Zap,
  sanitation: Trash2, safety: ShieldAlert, environment: TreePine,
  public_services: Building2, noise: Volume2, encroachment: Fence,
  other: MoreHorizontal,
};

// Custom Marker Icon generator
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function LocationPicker({ setLocation }: { setLocation: (loc: GeoPoint) => void }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

type Step = 'describe' | 'location' | 'media' | 'ai_review' | 'submitting' | 'done';

export default function ReportIssue() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Form state
  const [step, setStep] = useState<Step>('describe');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory | ''>('');
  const [severity, setSeverity] = useState<IssueSeverity | ''>('');
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // AI state
  const [aiResult, setAiResult] = useState<AIClassificationResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // ── Voice Recording ──────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());

        // Use Web Speech API for transcription (free, no API needed)
        const recognition = new (window as any).webkitSpeechRecognition?.() ||
                           new (window as any).SpeechRecognition?.();

        if (recognition) {
          recognition.lang = 'hi-IN'; // Hindi default
          recognition.continuous = false;
          recognition.interimResults = false;

          recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            setVoiceText(transcript);

            // Process with Gemini
            try {
              const result = await processVoiceReport(transcript);
              setTitle(result.title);
              setDescription(result.description);
              setCategory(result.category);
              setSeverity(result.severity);
            } catch (e) {
              setDescription(transcript);
            }
          };

          recognition.start();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error('Microphone access denied:', e);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // ── Use browser speech recognition directly ──────

  const startVoiceInput = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    setIsRecording(true);

    recognition.onresult = async (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setVoiceText(transcript);
    };

    recognition.onend = async () => {
      setIsRecording(false);
      if (voiceText) {
        try {
          const result = await processVoiceReport(voiceText);
          setTitle(result.title);
          setDescription(result.description);
          setCategory(result.category);
          setSeverity(result.severity);
        } catch (e) {
          setDescription(voiceText);
        }
      }
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.start();
  }, [voiceText]);

  // ── Image handling ───────────────────────────────

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 4) {
      alert('Maximum 4 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ── Get user location ───────────────────────────

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        // Reverse geocode
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}`,
            { headers: { 'User-Agent': 'GramSahay/1.0' } }
          );
          const data = await res.json();
          setAddress(data.display_name || '');
        } catch {
          setAddress(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
        }
      },
      () => {
        // Default to center of India
        setLocation({ lat: 22.5937, lng: 78.9629 });
      }
    );
  };

  // ── AI Classification ───────────────────────────

  const runAIClassification = async () => {
    if (!title && !description) return;
    setAiLoading(true);
    try {
      const result = await classifyIssue(title, description, address);
      setAiResult(result);
      // Auto-fill category and severity if user hasn't set them
      if (!category) setCategory(result.category);
      if (!severity) setSeverity(result.severity);
    } catch (e) {
      console.error('AI classification error:', e);
    }
    setAiLoading(false);
  };

  // ── Submit ──────────────────────────────────────

  const handleSubmit = async () => {
    if (!user || !profile) return;
    setStep('submitting');

    try {
      // Upload images
      const tempId = `temp-${Date.now()}`;
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        try {
          const url = await uploadIssueImage(images[i], tempId, i);
          imageUrls.push(url);
        } catch (e) {
          console.warn('Image upload failed:', e);
        }
      }

      // Create issue
      const issueId = await createIssue({
        reporterId: user.uid,
        reporterName: profile.name || user.email || 'Anonymous',
        reporterAvatar: profile.profileImage || '',
        title,
        description,
        category: (category || aiResult?.category || 'other') as IssueCategory,
        severity: (severity || aiResult?.severity || 'medium') as IssueSeverity,
        status: 'reported',
        location: location || { lat: 22.5937, lng: 78.9629 },
        address,
        ward,
        images: imageUrls,
        aiCategory: aiResult?.category || null,
        aiSeverity: aiResult?.severity || null,
        aiSummary: aiResult?.summary || '',
        aiSuggestions: aiResult?.suggestions || [],
        aiAuthority: aiResult?.authority || '',
        aiComplaintDraft: aiResult?.complaintDraft || '',
        acknowledgedAt: null,
        resolvedAt: null,
      });

      setStep('done');
      setTimeout(() => navigate(`/issues/${issueId}`), 2000);
    } catch (e) {
      console.error('Submit failed:', e);
      setStep('ai_review');
    }
  };

  // ── Navigation between steps ────────────────────

  const nextStep = () => {
    switch (step) {
      case 'describe':
        if (!location) getCurrentLocation();
        setStep('location');
        break;
      case 'location':
        setStep('media');
        break;
      case 'media':
        runAIClassification();
        setStep('ai_review');
        break;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'describe': return title.trim().length > 3 || description.trim().length > 10;
      case 'location': return location !== null;
      case 'media': return true;
      case 'ai_review': return true;
      default: return false;
    }
  };

  // ── Render ──────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#06060a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#06060a]/80 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-lg font-semibold">Report Issue</h1>
          <div className="w-20" />
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            animate={{
              width: step === 'describe' ? '25%' :
                     step === 'location' ? '50%' :
                     step === 'media' ? '75%' : '100%',
            }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* ── Step 1: Describe ──────────────────────── */}
          {step === 'describe' && (
            <motion.div
              key="describe"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">Describe the Issue</h2>
                <p className="text-white/40">Tell us what's wrong. You can type or use voice.</p>
              </div>

              {/* Voice input button */}
              <button
                onClick={isRecording ? stopRecording : startVoiceInput}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed transition-all ${
                  isRecording
                    ? 'border-red-500/50 bg-red-500/10 text-red-400'
                    : 'border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-white/60'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-6 h-6 animate-pulse" />
                    <span>Listening... Click to stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6" />
                    <span>Tap to speak in Hindi, English, or Kannada</span>
                  </>
                )}
              </button>

              {voiceText && (
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-sm text-indigo-300 mb-1">Voice transcription:</p>
                  <p className="text-white/80">{voiceText}</p>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm text-white/50 mb-2">Issue Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Broken water pipeline on Main Road"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-white/50 mb-2">Description *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail. What's the problem? How long has it been going on? Who is affected?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                />
              </div>

              {/* Category (optional at this stage) */}
              <div>
                <label className="block text-sm text-white/50 mb-3">Category (AI will suggest if you skip)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => {
                    const Icon = CATEGORY_ICONS[cat.key] || MoreHorizontal;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => setCategory(cat.key === category ? '' : cat.key)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border transition-all ${
                          category === cat.key
                            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                            : 'bg-white/[0.03] border-white/[0.06] text-white/50 hover:border-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Location ──────────────────────── */}
          {step === 'location' && (
            <motion.div
              key="location"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">Pin the Location</h2>
                <p className="text-white/40">Mark where the issue is located.</p>
              </div>

              <button
                onClick={getCurrentLocation}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition-all"
              >
                <MapPin className="w-5 h-5" />
                Use My Current Location
              </button>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-white/10 h-[300px] relative z-0">
                <MapContainer
                  center={location ? [location.lat, location.lng] : [22.5937, 78.9629]}
                  zoom={location ? 15 : 5}
                  className="w-full h-full bg-[#0a0a0f]"
                  zoomControl={true}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationPicker setLocation={setLocation} />
                  {location && (
                    <Marker
                      position={[location.lat, location.lng]}
                      icon={createCustomIcon('#6366f1')}
                    />
                  )}
                </MapContainer>
              </div>

              {address && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-white/60">{address}</p>
                </div>
              )}

              {/* Ward */}
              <div>
                <label className="block text-sm text-white/50 mb-2">Ward / Area (optional)</label>
                <input
                  type="text"
                  value={ward}
                  onChange={e => setWard(e.target.value)}
                  placeholder="e.g., Ward 12, Sector 5"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Media ────────────────────────── */}
          {step === 'media' && (
            <motion.div
              key="media"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">Add Photos</h2>
                <p className="text-white/40">Photos help authorities understand the issue better.</p>
              </div>

              {/* Image upload */}
              <div className="grid grid-cols-2 gap-4">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
                    <img src={preview} alt={`Issue photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {images.length < 4 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                    <ImagePlus className="w-8 h-8 text-white/30" />
                    <span className="text-sm text-white/30">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageAdd}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <p className="text-xs text-white/20 text-center">Up to 4 photos. You can skip this step.</p>

              {/* Severity (manual override) */}
              <div>
                <label className="block text-sm text-white/50 mb-3">How urgent is this?</label>
                <div className="grid grid-cols-2 gap-3">
                  {SEVERITIES.map(s => (
                    <button
                      key={s.key}
                      onClick={() => setSeverity(s.key === severity ? '' : s.key)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                        severity === s.key
                          ? `${s.bgColor} ${s.color} border`
                          : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:border-white/10'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: AI Review ────────────────────── */}
          {step === 'ai_review' && (
            <motion.div
              key="ai_review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">AI Analysis</h2>
                <p className="text-white/40">Our AI has analyzed your report. Review before submitting.</p>
              </div>

              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white/60">Gemini AI is analyzing your report...</p>
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Classifying issue • Assessing severity • Finding authority
                  </div>
                </div>
              ) : aiResult ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-medium text-indigo-300">AI Summary</span>
                      <span className="ml-auto text-xs text-white/30">{Math.round(aiResult.confidence * 100)}% confidence</span>
                    </div>
                    <p className="text-white/80 text-sm">{aiResult.summary}</p>
                  </div>

                  {/* Category & Severity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-xs text-white/30 mb-1">Category</p>
                      <p className="text-sm font-medium text-white/90">
                        {CATEGORIES.find(c => c.key === (category || aiResult.category))?.label || 'Other'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-xs text-white/30 mb-1">Severity</p>
                      <p className={`text-sm font-medium ${SEVERITIES.find(s => s.key === (severity || aiResult.severity))?.color || 'text-white/90'}`}>
                        {SEVERITIES.find(s => s.key === (severity || aiResult.severity))?.label || 'Medium'}
                      </p>
                    </div>
                  </div>

                  {/* Authority */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-xs text-white/30 mb-1">Responsible Authority</p>
                    <p className="text-sm text-white/80">{aiResult.authority}</p>
                  </div>

                  {/* Suggestions */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-xs text-white/30 mb-2">AI Suggestions</p>
                    <ul className="space-y-2">
                      {aiResult.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Complaint Draft */}
                  {aiResult.complaintDraft && (
                    <details className="group">
                      <summary className="flex items-center gap-2 text-sm text-indigo-400 cursor-pointer hover:text-indigo-300 transition-colors">
                        <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                        View AI-generated formal complaint draft
                      </summary>
                      <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-white/50 whitespace-pre-line">
                        {aiResult.complaintDraft}
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-white/60">AI analysis could not be completed.</p>
                  <p className="text-white/30 text-sm">You can still submit your report.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Submitting ───────────────────────────── */}
          {step === 'submitting' && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="text-white/60 text-lg">Submitting your report...</p>
            </motion.div>
          )}

          {/* ── Done ─────────────────────────────────── */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold">Issue Reported!</h2>
              <p className="text-white/50">Thank you for being a Community Hero. You earned 10 points!</p>
              <p className="text-white/30 text-sm">Redirecting to issue details...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom actions ────────────────────────── */}
        {!['submitting', 'done'].includes(step) && (
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
            <button
              onClick={() => {
                if (step === 'describe') navigate(-1);
                else if (step === 'location') setStep('describe');
                else if (step === 'media') setStep('location');
                else if (step === 'ai_review') setStep('media');
              }}
              className="text-white/40 hover:text-white transition-colors"
            >
              Back
            </button>

            {step === 'ai_review' ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 rounded-full font-medium hover:from-indigo-400 hover:to-purple-500 transition-all hover:shadow-lg hover:shadow-indigo-500/25"
              >
                <Send className="w-4 h-4" />
                Submit Report
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 rounded-full font-medium hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
