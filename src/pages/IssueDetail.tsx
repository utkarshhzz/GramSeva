// ============================================================
// GramSahay — Issue Detail Page
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowUp, Clock, MapPin, MessageSquare, Send,
  Sparkles, ChevronRight, CheckCircle2, Copy, Share2,
  Construction, Droplets, Zap, Trash2, ShieldAlert,
  TreePine, Building2, Volume2, Fence, MoreHorizontal,
  Loader2, AlertTriangle, Shield, HeartHandshake, Mail, MessageCircle,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getIssue, toggleVote, hasUserVoted, addComment, getComments, updateIssueStatus } from '@/lib/firestore';
import { CATEGORIES, SEVERITIES, STATUSES } from '@/types/community';
import type { CommunityIssue, IssueComment } from '@/types/community';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  roads: Construction, water: Droplets, electricity: Zap,
  sanitation: Trash2, safety: ShieldAlert, environment: TreePine,
  public_services: Building2, noise: Volume2, encroachment: Fence,
  other: MoreHorizontal,
};

const SEVERITY_COLORS: Record<string, string> = {
  low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444',
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { translate } = useLanguage();

  const [issue, setIssue] = useState<CommunityIssue | null>(null);
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [hasVolunteered, setHasVolunteered] = useState(false);

  // Free Hackathon Feature: Generate WhatsApp share link
  const getWhatsAppLink = () => {
    if (!issue) return '#';
    const text = `🚨 Urgent Community Issue: ${issue.title}\n📍 ${issue.ward || 'Local Area'}\n\nTap here to upvote so the authorities fix it faster! Together we can make a difference.\n\n${window.location.href}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  // Free Hackathon Feature: Generate mailto link for escalation
  const getMailtoLink = () => {
    if (!issue) return '#';
    const subject = `Urgent Community Issue: ${issue.title}`;
    const body = `Dear Authority,\n\nI am writing to bring to your attention a critical community issue that has gathered ${voteCount} upvotes from local residents.\n\nIssue: ${issue.title}\nLocation: ${issue.address || issue.ward || 'See map'}\n\nDescription:\n${issue.description}\n\nPlease take immediate action to resolve this matter.\n\nRegards,\nConcerned Citizen`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  useEffect(() => {
    if (id) loadIssue();
  }, [id]);

  const loadIssue = async () => {
    setLoading(true);
    try {
      const data = await getIssue(id!);
      setIssue(data);
      setVoteCount(data?.upvotes || 0);

      if (data) {
        const cmts = await getComments(id!);
        setComments(cmts);
      }

      if (user && data) {
        const v = await hasUserVoted(id!, user.uid);
        setVoted(v);
      }
    } catch (e) {
      console.error('Failed to load issue:', e);
    }
    setLoading(false);
  };

  const handleVote = async () => {
    if (!user || !id) return;
    const isVoted = await toggleVote(id, user.uid);
    setVoted(isVoted);
    setVoteCount(prev => isVoted ? prev + 1 : prev - 1);
  };

  const handleAddComment = async () => {
    if (!user || !profile || !id || !newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await addComment({
        issueId: id,
        userId: user.uid,
        userName: profile.name || user.email || 'Anonymous',
        userAvatar: profile.profileImage || '',
        userRole: profile.role,
        content: newComment.trim(),
      });
      setNewComment('');
      const cmts = await getComments(id);
      setComments(cmts);
    } catch (e) {
      console.error('Failed to add comment:', e);
    }
    setSubmittingComment(false);
  };

  const handleCopyComplaint = () => {
    if (issue?.aiComplaintDraft) {
      navigator.clipboard.writeText(issue.aiComplaintDraft);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06060a] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-[#06060a] text-white flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <p className="text-white/60">{translate('issueNotFound')}</p>
        <Link to="/issues" className="text-indigo-400 hover:text-indigo-300">← {translate('backToIssues')}</Link>
      </div>
    );
  }

  const CatIcon = CATEGORY_ICONS[issue.category] || MoreHorizontal;
  const categoryMeta = CATEGORIES.find(c => c.key === issue.category);
  const severityMeta = SEVERITIES.find(s => s.key === issue.severity);
  const statusMeta = STATUSES.find(s => s.key === issue.status);

  return (
    <div className="min-h-screen bg-[#06060a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#06060a]/80 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            {translate('back')}
          </button>
          <div className="flex items-center gap-3">
            <div className="dark">
              <LanguageSelector />
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Share2 className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs ${categoryMeta?.color || ''} bg-white/[0.05]`}>
                <CatIcon className="w-3.5 h-3.5" />
                {categoryMeta?.label}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${severityMeta?.bgColor} ${severityMeta?.color} border`}>
                {severityMeta?.label}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs ${statusMeta?.bgColor} ${statusMeta?.color} border`}>
                {statusMeta?.label}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white">{issue.title}</h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-white/40">
              <span>{translate('reportedBy')} <span className="text-white/60">{issue.reporterName}</span></span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {timeAgo(issue.createdAt)}
              </span>
            </div>

            {/* Description */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <p className="text-white/70 leading-relaxed whitespace-pre-line">{issue.description}</p>
            </div>

            {/* Images */}
            {issue.images?.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {issue.images.map((img, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-white/10 aspect-video">
                    <img src={img} alt={`Issue photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Map */}
            {issue.location && (
              <div className="rounded-2xl overflow-hidden border border-white/10 h-[200px] relative z-0">
                <MapContainer
                  center={[issue.location.lat, issue.location.lng]}
                  zoom={15}
                  className="w-full h-full bg-[#0a0a0f]"
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker
                    position={[issue.location.lat, issue.location.lng]}
                    icon={createCustomIcon(SEVERITY_COLORS[issue.severity] || '#6366f1')}
                  />
                </MapContainer>
              </div>
            )}
            {issue.address && (
              <p className="text-sm text-white/30 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {issue.address}
              </p>
            )}

            {/* AI Insights */}
            {(issue.aiSummary || issue.aiSuggestions?.length > 0) && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span className="font-medium text-indigo-300">{translate('aiAnalysis')}</span>
                </div>

                {issue.aiSummary && (
                  <p className="text-sm text-white/70">{issue.aiSummary}</p>
                )}

                {issue.aiAuthority && (
                  <div>
                    <p className="text-xs text-white/30 mb-1">{translate('responsibleAuthority')}</p>
                    <p className="text-sm text-white/80">{issue.aiAuthority}</p>
                  </div>
                )}

                {issue.aiSuggestions?.length > 0 && (
                  <div>
                    <p className="text-xs text-white/30 mb-2">{translate('suggestions')}</p>
                    <ul className="space-y-1.5">
                      {issue.aiSuggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {issue.aiComplaintDraft && (
                  <div>
                    <button
                      onClick={() => setShowComplaint(!showComplaint)}
                      className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${showComplaint ? 'rotate-90' : ''}`} />
                      {translate('formalComplaintDraft')}
                    </button>
                    {showComplaint && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-3 relative"
                      >
                        <pre className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/50 whitespace-pre-line font-sans">
                          {issue.aiComplaintDraft}
                        </pre>
                        <button
                          onClick={handleCopyComplaint}
                          className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4 text-white/60" />
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Comments */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-white/40" />
                {translate('comments')} ({comments.length})
              </h2>

              {/* Add comment */}
              {user && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-semibold shrink-0">
                    {(profile?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                      placeholder={translate('addComment')}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 text-sm"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submittingComment}
                      className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors disabled:opacity-30"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Comments list */}
              {comments.length === 0 ? (
                <p className="text-sm text-white/20 text-center py-6">{translate('noCommentsYet')}</p>
              ) : (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold shrink-0 text-white/40">
                        {(comment.userName?.[0] || 'U').toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white/80">{comment.userName}</span>
                          {comment.userRole !== 'citizen' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300">
                              {comment.userRole}
                            </span>
                          )}
                          <span className="text-xs text-white/20">{timeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-white/60">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Vote card */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <button
                onClick={handleVote}
                className={`w-full flex flex-col items-center gap-2 py-4 rounded-xl transition-all ${
                  voted
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-white/[0.03] text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10'
                }`}
              >
                <ArrowUp className="w-8 h-8" />
                <span className="text-2xl font-bold">{voteCount}</span>
                <span className="text-xs">{voted ? translate('youUpvoted') : translate('upvoteThisIssue')}</span>
              </button>
            </div>

            {/* Status card */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-sm font-medium text-white/60 mb-3">{translate('statusTimeline')}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm text-white/70">{translate('reportedStatus')}</p>
                    <p className="text-xs text-white/20">{new Date(issue.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {issue.acknowledgedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <div>
                      <p className="text-sm text-white/70">{translate('acknowledgedStatus')}</p>
                      <p className="text-xs text-white/20">{new Date(issue.acknowledgedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {issue.resolvedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-sm text-white/70">{translate('resolvedStatus')}</p>
                      <p className="text-xs text-white/20">{new Date(issue.resolvedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons (Hackathon Features) */}
            <div className="space-y-3">
              <button 
                onClick={() => setHasVolunteered(!hasVolunteered)}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                  hasVolunteered 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20'
                }`}
              >
                <HeartHandshake className="w-5 h-5" />
                {hasVolunteered ? translate('youAreVolunteering') : translate('volunteerToHelp')}
              </button>

              <a 
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-all border border-[#25D366]/30"
              >
                <MessageCircle className="w-5 h-5" />
                {translate('rallyCommunity')}
              </a>

              <a 
                href={getMailtoLink()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30"
              >
                <Mail className="w-5 h-5" />
                {translate('escalateToAuthority')}
              </a>
            </div>

            {/* Quick stats */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-sm font-medium text-white/60 mb-3">{translate('quickInfo')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/30">{translate('category')}</span>
                  <span className={categoryMeta?.color}>{categoryMeta?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">{translate('severity')}</span>
                  <span className={severityMeta?.color}>{severityMeta?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">{translate('comments')}</span>
                  <span className="text-white/60">{comments.length}</span>
                </div>
                {issue.ward && (
                  <div className="flex justify-between">
                    <span className="text-white/30">{translate('ward')}</span>
                    <span className="text-white/60">{issue.ward}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
