// ============================================================
// GramSahay — Community Dashboard
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import ParticleSphere3D from '@/components/ParticleSphere3D';
import {
  MapPin, Plus, BarChart3, Trophy, Users, MessageSquare,
  Shield, ArrowUp, Clock, TrendingUp, AlertTriangle,
  CheckCircle2, Loader2, LogOut, Settings, Sparkles,
  Construction, Droplets, Zap, Trash2, ShieldAlert,
  TreePine, Map as MapIcon, Mic, FileText, Database, Building2,
} from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getIssues, getUserIssues, getCommunityStats, createIssue } from '@/lib/firestore';
import LanguageSelector from '@/components/LanguageSelector';
import { generateCommunityInsights } from '@/lib/gemini';
import { CATEGORIES, SEVERITIES, STATUSES } from '@/types/community';
import type { CommunityIssue, AICommunityInsight } from '@/types/community';
import FloatingChatbot from '@/components/FloatingChatbot';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Note: We use quickActions array directly in the render method now so it can access translate()

export default function CommunityDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { translate } = useLanguage();

  const quickActions = [
    { icon: Plus,      label: translate('reportIssue'),       to: '/report',           color: 'from-yellow-600 to-yellow-400' },
    { icon: MapIcon,   label: translate('communityMap'),       to: '/community-map',    color: 'from-yellow-500 to-amber-600' },
    { icon: Mic,       label: translate('voiceReport'),        to: '/report',           color: 'from-amber-400 to-orange-500' },
    { icon: BarChart3, label: translate('analytics'),           to: '/analytics',        color: 'from-orange-500 to-red-500' },
    { icon: Trophy,    label: translate('leaderboard'),         to: '/leaderboard',      color: 'from-yellow-600 to-amber-500' },
    { icon: MessageSquare, label: translate('aiAssistant'),    to: '/assistant',        color: 'from-amber-600 to-yellow-600' },
    { icon: Building2, label: translate('govSchemes'),         to: '/government',          color: 'from-yellow-500 to-yellow-700' },
  ];

  const [myIssues, setMyIssues] = useState<CommunityIssue[]>([]);
  const [recentIssues, setRecentIssues] = useState<CommunityIssue[]>([]);
  const [stats, setStats] = useState({ totalIssues: 0, resolvedIssues: 0, activeUsers: 0, categoryCounts: {} as Record<string, number> });
  const [insights, setInsights] = useState<AICommunityInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, [loading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, recentData] = await Promise.all([
        getCommunityStats(),
        getIssues({ limitCount: 5 }),
      ]);
      setStats(statsData);
      setRecentIssues(recentData.issues);

      if (user) {
        const myData = await getUserIssues(user.uid);
        setMyIssues(myData);
      }
    } catch (e) {
      console.error('Dashboard load error:', e);
    }
    setLoading(false);
  };

  const loadInsights = async () => {
    if (recentIssues.length === 0) return;
    setInsightsLoading(true);
    try {
      const data = await generateCommunityInsights(recentIssues);
      setInsights(data);
    } catch (e) {
      console.error('Insights error:', e);
    }
    setInsightsLoading(false);
  };

  const seedDummyData = async () => {
    if (!user || !profile) {
      alert("Please log in to seed data.");
      return;
    }
    setLoading(true);
    try {
      const dummyIssues = [
        {
          title: "Broken Water Pipeline in Ward 4",
          description: "There is a massive water leak on the main road causing flooding and water wastage for the past 2 days.",
          category: "water" as any,
          severity: "high" as any,
          location: { lat: 22.5937 + (Math.random() - 0.5) * 0.05, lng: 78.9629 + (Math.random() - 0.5) * 0.05 },
          address: "Ward 4, Near Main Bazaar",
          aiComplaintDraft: "To the Municipal Corporation Water Department,\n\nSubject: Urgent - Broken Water Pipeline Causing Flooding in Ward 4\n\nRespected Sir/Madam,\n\nI am writing to bring to your urgent attention a massive water leak on the main road in Ward 4, near the Main Bazaar. This pipeline rupture has been ongoing for the past two days, resulting in significant water wastage and localized flooding that is severely inconveniencing residents and commuters.\n\nGiven the current water scarcity challenges, such continuous wastage is alarming. Additionally, the stagnant water poses a risk of structural damage to the road and potential health hazards due to mosquito breeding.\n\nI kindly request you to dispatch a maintenance team immediately to assess and repair the broken pipeline. Your prompt action will prevent further loss of our precious water resources and restore normalcy in the area.\n\nThank you for your anticipated cooperation.\n\nYours faithfully,\nConcerned Citizen",
        },
        {
          title: "Streetlights not working",
          description: "The streetlights near the community center have been out for a week. It's unsafe at night.",
          category: "electricity" as any,
          severity: "medium" as any,
          location: { lat: 22.5937 + (Math.random() - 0.5) * 0.05, lng: 78.9629 + (Math.random() - 0.5) * 0.05 },
          address: "Community Center Road",
          aiComplaintDraft: "To the State Electricity Board,\n\nSubject: Non-functional Streetlights on Community Center Road\n\nRespected Sir/Madam,\n\nI wish to report that the streetlights along the Community Center Road have been completely non-functional for the past week. This stretch of road is heavily used by pedestrians and vehicles, and the total darkness after sunset has created a significant safety hazard.\n\nResidents, particularly women and the elderly, are finding it unsafe to commute during the evening hours. The lack of illumination also increases the risk of accidents and petty crimes in the vicinity.\n\nI urgently request you to kindly arrange for a technician to inspect and repair the faulty streetlights at the earliest. Restoring proper lighting is essential for the safety and security of our neighborhood.\n\nThank you for your prompt assistance in this matter.\n\nYours sincerely,\nConcerned Citizen",
        },
        {
          title: "Illegal Garbage Dumping",
          description: "People are dumping garbage in the empty plot next to the school. The smell is unbearable.",
          category: "sanitation" as any,
          severity: "critical" as any,
          status: "resolved" as any,
          location: { lat: 22.5937 + (Math.random() - 0.5) * 0.05, lng: 78.9629 + (Math.random() - 0.5) * 0.05 },
          address: "Plot 42, School Lane",
          aiComplaintDraft: "To the Municipal Corporation Sanitation Department,\n\nSubject: Critical - Illegal Garbage Dumping Next to School in Plot 42\n\nRespected Sir/Madam,\n\nI am writing to file a formal complaint regarding the rampant and illegal dumping of garbage in the empty plot (Plot 42) situated directly adjacent to the local school on School Lane. The accumulated waste has created an unbearable stench and is rapidly becoming a serious health hazard for the students and nearby residents.\n\nThis unhygienic environment is attracting stray animals, flies, and mosquitoes, directly threatening the health and well-being of young children attending the school daily. This violation of public health standards requires immediate intervention.\n\nI urge the municipal authorities to clear the accumulated garbage without delay, sanitize the area, and implement measures (such as warning signs or penalizing offenders) to prevent future dumping at this site. Protecting the health of our students must be a priority.\n\nThank you for your immediate action.\n\nYours faithfully,\nConcerned Citizen",
        }
      ];

      for (const issue of dummyIssues) {
        await createIssue({
          reporterId: user.uid,
          reporterName: profile.name || user.email || 'Anonymous',
          reporterAvatar: profile.profileImage || '',
          title: issue.title,
          description: issue.description,
          category: issue.category,
          severity: issue.severity,
          status: issue.status || 'reported',
          location: issue.location,
          address: issue.address,
          ward: 'Demo Ward',
          images: ['https://images.unsplash.com/photo-1518770660439-4636190af475'],
          aiCategory: issue.category,
          aiSeverity: issue.severity,
          aiSummary: 'Auto-generated dummy issue for demo purposes.',
          aiSuggestions: ['Dispatch team immediately', 'Assess damage', 'Inform community'],
          aiAuthority: 'Local Municipal Corporation',
          aiComplaintDraft: issue.aiComplaintDraft,
          acknowledgedAt: issue.status === 'in-progress' || issue.status === 'resolved' ? new Date().toISOString() : null,
          resolvedAt: issue.status === 'resolved' ? new Date().toISOString() : null,
        });
      }
      await loadData();
    } catch (e) {
      console.error("Seed error:", e);
      alert("Failed to seed data. Check console.");
    }
    setLoading(false);
  };

  const resolutionRate = stats.totalIssues > 0
    ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100)
    : 0;

  const topCategories = Object.entries(stats.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06060a] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ParticleSphere3D />
        </Canvas>
      </div>

      <div className="relative z-10">
        {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#050505]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-400 flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">
              GramSahay
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="dark">
              <LanguageSelector />
            </div>
            <Link
              to="/report"
              className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-600 to-yellow-500 px-4 py-2 rounded-full text-sm font-bold text-black hover:brightness-110 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]"
            >
              <Plus className="w-4 h-4" />
              {translate('reportIssue')}
            </Link>
            <button
              onClick={() => signOut().then(() => navigate('/'))}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-1">
            {translate('welcomeHero')}, {profile?.name || user?.email?.split('@')[0] || 'Hero'} 👋
          </h1>
          <p className="text-white/40">
            You have {profile?.points || 0} points · {myIssues.length} issues reported
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: translate('totalIssues'), value: stats.totalIssues, icon: FileText, color: 'text-blue-400' },
            { label: translate('resolved'), value: stats.resolvedIssues, icon: CheckCircle2, color: 'text-emerald-400' },
            { label: translate('resolutionRate'), value: `${resolutionRate}%`, icon: TrendingUp, color: 'text-amber-400' },
            { label: translate('activeCitizens'), value: stats.activeUsers, icon: Users, color: 'text-purple-400' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
              whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5, zIndex: 10 }}
              style={{ transformPerspective: 1000 }}
              className="p-6 rounded-3xl bg-card border border-white/10 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] transition-all duration-300"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
              <p className="text-sm text-white/40 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{translate('quickActions')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05, rotateX: -5, rotateY: 5 }} style={{ transformPerspective: 800 }}>
                <Link
                  to={action.to}
                  className="block group p-5 rounded-3xl bg-card border border-white/10 hover:border-primary/50 transition-all text-center shadow-sm hover:shadow-[0_0_25px_rgba(234,179,8,0.2)] h-full"
                >
                  <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner`}>
                    <action.icon className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-sm font-medium text-white/70 group-hover:text-yellow-400 transition-colors">{action.label}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Issues */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{translate('recentIssues')}</h2>
              <Link to="/issues" className="text-sm text-indigo-400 hover:text-indigo-300">View All →</Link>
            </div>
            {recentIssues.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                <p className="text-white/40 mb-4">No issues reported yet</p>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    to="/report"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-5 py-2 rounded-full text-sm hover:brightness-110 font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Report First Issue
                  </Link>
                  <button
                    onClick={seedDummyData}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full text-sm transition-colors"
                  >
                    <Database className="w-4 h-4" />
                    Seed Demo Data
                  </button>
                </div>
              </div>
            ) : (
              recentIssues.map((issue, index) => {
                const catMeta = CATEGORIES.find(c => c.key === issue.category);
                const statusMeta = STATUSES.find(s => s.key === issue.status);
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    key={issue.id}
                  >
                    <Link
                      to={`/issues/${issue.id}`}
                      className="block p-5 rounded-2xl bg-card border border-white/10 hover:border-primary/30 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] group"
                    >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-medium text-white/90 line-clamp-1 group-hover:text-yellow-400 transition-colors">{issue.title}</h3>
                        <p className="text-sm text-white/40 mt-1.5 line-clamp-2 leading-relaxed">{issue.description}</p>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] ${statusMeta?.bgColor} ${statusMeta?.color} border`}>
                        {statusMeta?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-white/20">
                      <span className={catMeta?.color}>{catMeta?.label}</span>
                      <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" />{issue.upvotes}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(issue.createdAt)}</span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Profile Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-400 flex items-center justify-center text-lg font-bold text-black">
                  {(profile?.name?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{profile?.name || 'User'}</p>
                  <p className="text-xs text-white/30">{profile?.role === 'citizen' ? '🛡️ Citizen' : `⭐ ${profile?.role}`}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-yellow-500">{profile?.points || 0}</p>
                  <p className="text-[10px] text-white/30">Points</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white/80">{profile?.issuesReported || 0}</p>
                  <p className="text-[10px] text-white/30">Reported</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-400">{profile?.issuesResolved || 0}</p>
                  <p className="text-[10px] text-white/30">Resolved</p>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="p-5 rounded-2xl bg-card border border-white/10 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium flex items-center gap-2 text-yellow-500">
                  <Sparkles className="w-4 h-4" />
                  AI Insights
                </h3>
                <button
                  onClick={loadInsights}
                  disabled={insightsLoading}
                  className="text-xs text-yellow-600 hover:text-yellow-400 disabled:opacity-30"
                >
                  {insightsLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>

              {insightsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                </div>
              ) : insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map(insight => (
                    <div key={insight.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <p className="text-xs font-medium text-white/70 mb-1">{insight.title}</p>
                      <p className="text-xs text-white/40">{insight.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/20 text-center py-4">
                  Click "Generate" to get AI-powered community insights
                </p>
              )}
            </div>

            {/* Top Categories */}
            {topCategories.length > 0 && (
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="text-sm font-medium text-white/60 mb-4">Top Issue Categories</h3>
                <div className="space-y-3">
                  {topCategories.map(([cat, count]) => {
                    const meta = CATEGORIES.find(c => c.key === cat);
                    const pct = Math.round((count / stats.totalIssues) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={meta?.color || 'text-white/50'}>{meta?.label || cat}</span>
                          <span className="text-white/30">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-yellow-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating Chatbot */}
      <FloatingChatbot />
      </div>
    </div>
  );
}
