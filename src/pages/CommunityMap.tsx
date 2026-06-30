// ============================================================
// GramSahay — Community Map Page
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Plus, List, Filter,
  Construction, Droplets, Zap, Trash2, ShieldAlert,
  TreePine, Building2, Volume2, Fence, MoreHorizontal,
  Clock, ArrowUp, MapPin, Loader2,
} from 'lucide-react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getIssues } from '@/lib/firestore';
import { CATEGORIES, SEVERITIES } from '@/types/community';
import type { CommunityIssue, IssueCategory } from '@/types/community';

const SEVERITY_COLORS: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

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
  return `${days}d ago`;
}

export default function CommunityMap() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<CommunityIssue | null>(null);
  const [filterCategory, setFilterCategory] = useState<IssueCategory | ''>('');
  const [center, setCenter] = useState<[number, number]>([22.5937, 78.9629]);
  const [zoom, setZoom] = useState(5);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadIssues();
    // Try to get user location
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
        setZoom(12);
      },
      () => {} // ignore
    );
  }, []);

  useEffect(() => {
    loadIssues();
  }, [filterCategory]);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const result = await getIssues({
        category: filterCategory || undefined,
        limitCount: 100,
      });
      setIssues(result.issues);
    } catch (e) {
      console.error('Failed to load issues:', e);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-[#06060a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#06060a]/80 border-b border-white/5">
        <div className="max-w-full mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <h1 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-400" />
            Community Map
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-all ${
                showFilters || filterCategory
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <Link
              to="/issues"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="List View"
            >
              <List className="w-5 h-5 text-white/60" />
            </Link>
            <Link
              to="/report"
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 rounded-full text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Report
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-6 py-3 border-t border-white/5 overflow-x-auto"
          >
            <div className="flex gap-2">
              <button
                onClick={() => setFilterCategory('')}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                  !filterCategory ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.03] text-white/40'
                }`}
              >
                All Issues
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setFilterCategory(cat.key === filterCategory ? '' : cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                    filterCategory === cat.key ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.03] text-white/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-[#06060a]/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

        <Map
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
          onClick={() => setSelectedIssue(null)}
        >
          {issues.map(issue => {
            if (!issue.location?.lat || !issue.location?.lng) return null;
            const color = SEVERITY_COLORS[issue.severity] || '#6366f1';
            return (
              <Marker
                key={issue.id}
                anchor={[issue.location.lat, issue.location.lng]}
                color={color}
                width={selectedIssue?.id === issue.id ? 50 : 36}
                onClick={() => setSelectedIssue(issue)}
              />
            );
          })}
        </Map>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 p-3 rounded-xl bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10">
          <p className="text-xs text-white/30 mb-2">Severity</p>
          <div className="flex flex-col gap-1.5">
            {SEVERITIES.map(s => (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS[s.key] }}
                />
                <span className="text-xs text-white/50">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats badge */}
        <div className="absolute top-4 left-4 px-3 py-2 rounded-xl bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10">
          <p className="text-xs text-white/30">Issues on map</p>
          <p className="text-lg font-bold text-white">{issues.length}</p>
        </div>

        {/* Selected issue popup */}
        {selectedIssue && (
          <div className="absolute bottom-6 right-6 left-20 md:left-auto md:w-96">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10"
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${SEVERITY_COLORS[selectedIssue.severity]}20` }}
                >
                  {(() => {
                    const Icon = CATEGORY_ICONS[selectedIssue.category] || MoreHorizontal;
                    return <Icon className="w-5 h-5" style={{ color: SEVERITY_COLORS[selectedIssue.severity] }} />;
                  })()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white line-clamp-1">{selectedIssue.title}</h3>
                  <p className="text-sm text-white/40 line-clamp-2">{selectedIssue.description}</p>
                </div>
              </div>

              {selectedIssue.images?.[0] && (
                <div className="rounded-xl overflow-hidden mb-3 h-32">
                  <img src={selectedIssue.images[0]} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-white/30 mb-4">
                <span className="flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  {selectedIssue.upvotes} votes
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(selectedIssue.createdAt)}
                </span>
                <span className={`ml-auto px-2 py-0.5 rounded text-xs ${
                  STATUSES.find(s => s.key === selectedIssue.status)?.bgColor
                } ${STATUSES.find(s => s.key === selectedIssue.status)?.color} border`}>
                  {STATUSES.find(s => s.key === selectedIssue.status)?.label}
                </span>
              </div>

              <Link
                to={`/issues/${selectedIssue.id}`}
                className="w-full block text-center py-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 transition-colors"
              >
                View Details
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

// Need this for the import used above
const STATUSES = [
  { key: 'reported',     label: 'Reported',      color: 'text-blue-400',    bgColor: 'bg-blue-500/10 border-blue-500/20' },
  { key: 'acknowledged', label: 'Acknowledged',   color: 'text-purple-400',  bgColor: 'bg-purple-500/10 border-purple-500/20' },
  { key: 'in_progress',  label: 'In Progress',    color: 'text-amber-400',   bgColor: 'bg-amber-500/10 border-amber-500/20' },
  { key: 'resolved',     label: 'Resolved',       color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
  { key: 'closed',       label: 'Closed',         color: 'text-gray-400',    bgColor: 'bg-gray-500/10 border-gray-500/20' },
];
