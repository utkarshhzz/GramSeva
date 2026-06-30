// ============================================================
// GramSahay — Issue Feed Page
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MapPin, Clock, ArrowUp, MessageSquare,
  Plus, Construction, Droplets, Zap, Trash2, ShieldAlert,
  TreePine, Building2, Volume2, Fence, MoreHorizontal,
  ChevronDown, Shield, ArrowLeft, Loader2, LayoutGrid,
  Map as MapIcon, TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getIssues, toggleVote, hasUserVoted } from '@/lib/firestore';
import { CATEGORIES, SEVERITIES, STATUSES } from '@/types/community';
import type { CommunityIssue, IssueCategory, IssueStatus, IssueSeverity } from '@/types/community';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  roads: Construction, water: Droplets, electricity: Zap,
  sanitation: Trash2, safety: ShieldAlert, environment: TreePine,
  public_services: Building2, noise: Volume2, encroachment: Fence,
  other: MoreHorizontal,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ── Issue Card Component ──────────────────────────────────────

function IssueCard({ issue }: { issue: CommunityIssue }) {
  const { user } = useAuth();
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(issue.upvotes);
  const [voting, setVoting] = useState(false);

  const CatIcon = CATEGORY_ICONS[issue.category] || MoreHorizontal;
  const severityMeta = SEVERITIES.find(s => s.key === issue.severity);
  const statusMeta = STATUSES.find(s => s.key === issue.status);
  const categoryMeta = CATEGORIES.find(c => c.key === issue.category);

  useEffect(() => {
    if (user) {
      hasUserVoted(issue.id, user.uid).then(setVoted);
    }
  }, [issue.id, user]);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || voting) return;
    setVoting(true);
    try {
      const isVoted = await toggleVote(issue.id, user.uid);
      setVoted(isVoted);
      setVoteCount(prev => isVoted ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Vote error:', err);
    }
    setVoting(false);
  };

  return (
    <Link to={`/issues/${issue.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] transition-all"
      >
        <div className="flex gap-4">
          {/* Vote column */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <button
              onClick={handleVote}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                voted
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'bg-white/[0.03] text-white/30 hover:text-indigo-400 hover:bg-indigo-500/10'
              }`}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <span className={`text-sm font-semibold ${voted ? 'text-indigo-400' : 'text-white/40'}`}>
              {voteCount}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {/* Category badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs ${categoryMeta?.color || 'text-white/50'} bg-white/[0.05]`}>
                <CatIcon className="w-3 h-3" />
                {categoryMeta?.label || issue.category}
              </span>

              {/* Severity */}
              <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${severityMeta?.bgColor} ${severityMeta?.color} border`}>
                {severityMeta?.label}
              </span>

              {/* Status */}
              <span className={`ml-auto px-2 py-0.5 rounded-lg text-xs ${statusMeta?.bgColor} ${statusMeta?.color} border`}>
                {statusMeta?.label}
              </span>
            </div>

            <h3 className="text-white/90 font-semibold mb-1 group-hover:text-indigo-300 transition-colors line-clamp-1">
              {issue.title}
            </h3>
            <p className="text-white/40 text-sm line-clamp-2 mb-3">{issue.description}</p>

            {/* Image preview */}
            {issue.images?.length > 0 && (
              <div className="flex gap-2 mb-3">
                {issue.images.slice(0, 3).map((img, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {issue.images.length > 3 && (
                  <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-xs text-white/30">
                    +{issue.images.length - 3}
                  </div>
                )}
              </div>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-4 text-xs text-white/30">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {issue.address?.split(',').slice(0, 2).join(',') || 'Location marked'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(issue.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {issue.commentCount}
              </span>
              <span className="ml-auto text-white/20">by {issue.reporterName}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export default function IssueFeed() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<IssueCategory | ''>('');
  const [filterStatus, setFilterStatus] = useState<IssueStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadIssues();
  }, [filterCategory, filterStatus]);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const result = await getIssues({
        category: filterCategory || undefined,
        status: filterStatus || undefined,
        limitCount: 50,
      });
      setIssues(result.issues);
    } catch (e) {
      console.error('Failed to load issues:', e);
    }
    setLoading(false);
  };

  const filteredIssues = issues.filter(issue => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      issue.title.toLowerCase().includes(q) ||
      issue.description.toLowerCase().includes(q) ||
      issue.address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#06060a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#06060a]/80 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <h1 className="text-lg font-semibold">Community Issues</h1>
          <div className="flex items-center gap-2">
            <Link
              to="/community-map"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Map View"
            >
              <MapIcon className="w-5 h-5 text-white/60" />
            </Link>
            <Link
              to="/report"
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 rounded-full text-sm font-medium hover:from-indigo-400 hover:to-purple-500 transition-all"
            >
              <Plus className="w-4 h-4" />
              Report
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Search & Filters */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search issues..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 text-sm transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm transition-all ${
              showFilters || filterCategory || filterStatus
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                <div>
                  <p className="text-xs text-white/30 mb-2">Category</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterCategory('')}
                      className={`px-3 py-1.5 rounded-lg text-xs ${
                        !filterCategory ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.03] text-white/40'
                      }`}
                    >
                      All
                    </button>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => setFilterCategory(cat.key === filterCategory ? '' : cat.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs ${
                          filterCategory === cat.key ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.03] text-white/40'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-2">Status</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterStatus('')}
                      className={`px-3 py-1.5 rounded-lg text-xs ${
                        !filterStatus ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.03] text-white/40'
                      }`}
                    >
                      All
                    </button>
                    {STATUSES.map(s => (
                      <button
                        key={s.key}
                        onClick={() => setFilterStatus(s.key === filterStatus ? '' : s.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs ${
                          filterStatus === s.key ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.03] text-white/40'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Issues list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-white/40">Loading community issues...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-semibold text-white/60">No Issues Found</h3>
            <p className="text-white/30 text-sm text-center max-w-sm">
              {search ? 'Try a different search term.' : 'Be the first to report an issue in your community!'}
            </p>
            <Link
              to="/report"
              className="mt-2 flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 rounded-full text-sm font-medium hover:from-indigo-400 hover:to-purple-500 transition-all"
            >
              <Plus className="w-4 h-4" />
              Report First Issue
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-white/20">{filteredIssues.length} issues found</p>
            {filteredIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
