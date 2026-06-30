// ============================================================
// GramSahay — Community Types
// ============================================================

export type IssueCategory =
  | 'roads'
  | 'water'
  | 'electricity'
  | 'sanitation'
  | 'safety'
  | 'environment'
  | 'public_services'
  | 'noise'
  | 'encroachment'
  | 'other';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus =
  | 'reported'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type UserRole = 'citizen' | 'volunteer' | 'official';

export type BadgeType =
  | 'first_report'
  | 'problem_solver'
  | 'community_guardian'
  | 'voice_of_people'
  | 'top_reporter'
  | 'helper'
  | 'streak_7'
  | 'streak_30';

// ── Firestore document shapes ─────────────────────────────────

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface CommunityUser {
  uid: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  ward: string;
  role: UserRole;
  points: number;
  badges: BadgeType[];
  issuesReported: number;
  issuesResolved: number;
  issuesSupported: number;
  profileImage: string;
  createdAt: string; // ISO
  updatedAt: string;
}

export interface CommunityIssue {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterAvatar: string;

  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;

  location: GeoPoint;
  address: string;
  ward: string;

  images: string[]; // Storage URLs
  voiceNote?: string; // Storage URL

  // AI-generated fields
  aiCategory: IssueCategory | null;
  aiSeverity: IssueSeverity | null;
  aiSummary: string;
  aiSuggestions: string[];
  aiAuthority: string;
  aiComplaintDraft: string;

  upvotes: number;
  commentCount: number;

  createdAt: string;
  updatedAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
}

export interface IssueComment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: UserRole;
  content: string;
  createdAt: string;
}

export interface IssueVote {
  id: string;
  issueId: string;
  userId: string;
  createdAt: string;
}

// ── AI Agent types ────────────────────────────────────────────

export interface AIClassificationResult {
  category: IssueCategory;
  severity: IssueSeverity;
  summary: string;
  suggestions: string[];
  authority: string;
  complaintDraft: string;
  confidence: number;
}

export interface AICommunityInsight {
  id: string;
  type: 'trend' | 'alert' | 'recommendation';
  title: string;
  description: string;
  category: IssueCategory | 'overall';
  data?: Record<string, number>;
  generatedAt: string;
}

// ── UI helper types ───────────────────────────────────────────

export interface CategoryMeta {
  key: IssueCategory;
  label: string;
  labelHi: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
}

export interface SeverityMeta {
  key: IssueSeverity;
  label: string;
  color: string;
  bgColor: string;
}

export interface StatusMeta {
  key: IssueStatus;
  label: string;
  color: string;
  bgColor: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: 'roads',           label: 'Roads & Transport',    labelHi: 'सड़क और परिवहन',     icon: 'Construction',   color: 'text-orange-500' },
  { key: 'water',           label: 'Water Supply',         labelHi: 'जल आपूर्ति',          icon: 'Droplets',       color: 'text-blue-500' },
  { key: 'electricity',     label: 'Electricity',          labelHi: 'बिजली',               icon: 'Zap',            color: 'text-yellow-500' },
  { key: 'sanitation',      label: 'Sanitation & Waste',   labelHi: 'स्वच्छता और कचरा',     icon: 'Trash2',         color: 'text-green-500' },
  { key: 'safety',          label: 'Public Safety',        labelHi: 'सार्वजनिक सुरक्षा',    icon: 'ShieldAlert',    color: 'text-red-500' },
  { key: 'environment',     label: 'Environment',          labelHi: 'पर्यावरण',             icon: 'TreePine',       color: 'text-emerald-500' },
  { key: 'public_services', label: 'Public Services',      labelHi: 'सार्वजनिक सेवाएं',     icon: 'Building2',      color: 'text-purple-500' },
  { key: 'noise',           label: 'Noise Pollution',      labelHi: 'ध्वनि प्रदूषण',        icon: 'Volume2',        color: 'text-pink-500' },
  { key: 'encroachment',    label: 'Encroachment',         labelHi: 'अतिक्रमण',             icon: 'Fence',          color: 'text-amber-600' },
  { key: 'other',           label: 'Other',                labelHi: 'अन्य',                 icon: 'MoreHorizontal', color: 'text-gray-500' },
];

export const SEVERITIES: SeverityMeta[] = [
  { key: 'low',      label: 'Low',      color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
  { key: 'medium',   label: 'Medium',   color: 'text-amber-400',   bgColor: 'bg-amber-500/10 border-amber-500/20' },
  { key: 'high',     label: 'High',     color: 'text-orange-400',  bgColor: 'bg-orange-500/10 border-orange-500/20' },
  { key: 'critical', label: 'Critical', color: 'text-red-400',     bgColor: 'bg-red-500/10 border-red-500/20' },
];

export const STATUSES: StatusMeta[] = [
  { key: 'reported',     label: 'Reported',      color: 'text-blue-400',    bgColor: 'bg-blue-500/10 border-blue-500/20' },
  { key: 'acknowledged', label: 'Acknowledged',   color: 'text-purple-400',  bgColor: 'bg-purple-500/10 border-purple-500/20' },
  { key: 'in_progress',  label: 'In Progress',    color: 'text-amber-400',   bgColor: 'bg-amber-500/10 border-amber-500/20' },
  { key: 'resolved',     label: 'Resolved',       color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
  { key: 'closed',       label: 'Closed',         color: 'text-gray-400',    bgColor: 'bg-gray-500/10 border-gray-500/20' },
];
