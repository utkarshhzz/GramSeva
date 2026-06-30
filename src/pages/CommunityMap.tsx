import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Plus, List, Filter,
  Construction, Droplets, Zap, Trash2, ShieldAlert,
  TreePine, Building2, Volume2, Fence, MoreHorizontal,
  Clock, ArrowUp, MapPin, Loader2,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getIssues } from '@/lib/firestore';
import { CATEGORIES, SEVERITIES } from '@/types/community';
import type { CommunityIssue, IssueCategory } from '@/types/community';

// Fix Leaflet default marker icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

// Component to handle map centering
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Custom Marker Icon generator
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export default function CommunityMap() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<IssueCategory | ''>('');
  const [center, setCenter] = useState<[number, number]>([22.5937, 78.9629]);
  const [zoom, setZoom] = useState(5);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadIssues();
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
        setZoom(12);
      },
      () => {}
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
            Community Hotspot Map
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
      <div className="flex-1 relative z-0">
        {loading && (
          <div className="absolute inset-0 z-10 bg-[#06060a]/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

        <MapContainer
          center={center}
          zoom={zoom}
          className="w-full h-full bg-[#0a0a0f]"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <MapUpdater center={center} zoom={zoom} />
          
          {issues.map(issue => {
            if (!issue.location?.lat || !issue.location?.lng) return null;
            const color = SEVERITY_COLORS[issue.severity] || '#6366f1';
            const Icon = CATEGORY_ICONS[issue.category] || MoreHorizontal;
            
            return (
              <Marker
                key={issue.id}
                position={[issue.location.lat, issue.location.lng]}
                icon={createCustomIcon(color)}
              >
                <Popup className="custom-popup">
                  <div className="p-2 w-64">
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{issue.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2">{issue.description}</p>
                      </div>
                    </div>
                    {issue.images?.[0] && (
                      <div className="rounded-lg overflow-hidden mb-2 h-24">
                        <img src={issue.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <Link
                      to={`/issues/${issue.id}`}
                      className="w-full block text-center py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100 transition-colors"
                    >
                      View Full Details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 p-3 rounded-xl bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 z-10">
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
        <div className="absolute top-4 left-4 px-3 py-2 rounded-xl bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 z-10">
          <p className="text-xs text-white/30">Issues on map</p>
          <p className="text-lg font-bold text-white">{issues.length}</p>
        </div>
      </div>
      
      {/* Global styles for leaflet overrides */}
      <style>{`
        .leaflet-container {
          font-family: inherit;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background-color: white;
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background-color: white;
        }
        .leaflet-control-attribution a {
          color: #6366f1 !important;
        }
      `}</style>
    </div>
  );
}
