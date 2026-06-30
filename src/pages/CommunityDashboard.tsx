// ============================================================
// GramSahay — Community Dashboard (Bento-Box Redesign)
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Canvas } from '@react-three/fiber';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ParticleSphere3D from '@/components/ParticleSphere3D';
import {
  Plus, BarChart3, Trophy, Users, MessageSquare,
  Shield, ArrowUp, Clock, TrendingUp, CheckCircle2,
  Loader2, LogOut, Sparkles, Map as MapIcon, Mic,
  FileText, Database, Building2,
} from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getIssues, getUserIssues, getCommunityStats, createIssue } from '@/lib/firestore';
import LanguageSelector from '@/components/LanguageSelector';
import { generateCommunityInsights } from '@/lib/gemini';
import { CATEGORIES, STATUSES } from '@/types/community';
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

export default function CommunityDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { translate } = useLanguage();

  const quickActions = [
    { icon: Plus,      label: translate('reportIssue'),       to: '/report',           color: 'from-yellow-500 to-amber-500' },
    { icon: Building2, label: translate('govSchemes'),         to: '/government',       color: 'from-amber-600 to-yellow-600' },
    { icon: MapIcon,   label: translate('communityMap'),       to: '/community-map',    color: 'from-yellow-400 to-yellow-600' },
    { icon: Trophy,    label: translate('leaderboard'),         to: '/leaderboard',      color: 'from-orange-500 to-amber-600' },
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
        getIssues({ limitCount: 4 }),
      ]);
      setStats(statsData);
      setRecentIssues(recentData.issues);
      if (user) setMyIssues(await getUserIssues(user.uid));
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
          location: { lat: 22.5937, lng: 78.9629 },
          address: "Ward 4, Near Main Bazaar",
          aiComplaintDraft: "To the Municipal Corporation...",
        },
        {
          title: "Illegal Garbage Dumping",
          description: "People are dumping garbage in the empty plot next to the school.",
          category: "sanitation" as any,
          severity: "critical" as any,
          status: "resolved" as any,
          location: { lat: 22.59, lng: 78.96 },
          address: "Plot 42, School Lane",
          aiComplaintDraft: "To the Sanitation Dept...",
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
          images: [],
          aiCategory: issue.category,
          aiSeverity: issue.severity,
          aiSummary: 'Auto-generated dummy issue.',
          aiSuggestions: [],
          aiAuthority: 'Local Municipal Corporation',
          aiComplaintDraft: issue.aiComplaintDraft,
          acknowledgedAt: null,
          resolvedAt: issue.status === 'resolved' ? new Date().toISOString() : null,
        });
      }
      await loadData();
    } catch (e) {
      console.error("Seed error:", e);
    }
    setLoading(false);
  };

  const resolutionRate = stats.totalIssues > 0
    ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100)
    : 0;

  const topCategories = Object.entries(stats.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, value]) => ({
       name: CATEGORIES.find(c => c.key === name)?.label || name, 
       value 
    }));

  const COLORS = ['#EAB308', '#F59E0B', '#D97706', '#B45309'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06060a] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
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
        <div className="sticky top-0 z-50 backdrop-blur-2xl bg-[#050505]/70 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-400 flex items-center justify-center">
                <Shield className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white">GramSahay</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="dark"><LanguageSelector /></div>
              <Link
                to="/report"
                className="flex items-center gap-1.5 bg-yellow-500 px-4 py-2 rounded-full text-sm font-bold text-black hover:brightness-110 shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all"
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

        <div ref={containerRef} className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(140px,auto)]">
          
          {/* Bento 1: Profile (md:col-span-4, row-span-2) */}
          <motion.div 
            whileHover={{ scale: 1.02, rotateY: 2 }}
            style={{ transformPerspective: 1000 }}
            className="md:col-span-4 md:row-span-2 p-8 rounded-[2rem] bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 shadow-xl hover:shadow-[0_0_40px_rgba(234,179,8,0.15)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-2xl font-bold text-black mb-6 shadow-lg shadow-yellow-500/20">
                {(profile?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold mb-1">{translate('welcomeHero')},</h2>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-200 bg-clip-text text-transparent mb-2">
                {profile?.name || user?.email?.split('@')[0] || 'Hero'}
              </h1>
              <p className="text-white/40 text-sm">{profile?.role === 'citizen' ? '🛡️ Active Citizen' : `⭐ ${profile?.role}`}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
              <div>
                <p className="text-3xl font-bold text-white">{profile?.points || 0}</p>
                <p className="text-xs text-yellow-500 uppercase tracking-widest font-bold mt-1">Points</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{myIssues.length}</p>
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-1">Reported</p>
              </div>
            </div>
          </motion.div>

          {/* Bento 2: Quick Actions (md:col-span-8) */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickActions.map((action, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05, y: -5 }} className="h-full">
                <Link
                  to={action.to}
                  className="flex flex-col items-center justify-center h-full p-6 rounded-[2rem] bg-card border border-white/10 hover:border-yellow-500/50 hover:bg-white/[0.02] transition-all group shadow-lg"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
                    <action.icon className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-sm font-bold text-white/70 group-hover:text-yellow-400 transition-colors text-center">{action.label}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bento 3: Global Stats (md:col-span-4) */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="md:col-span-4 p-8 rounded-[2rem] bg-card border border-white/10 shadow-xl flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-white/40 font-bold uppercase tracking-widest mb-2">Resolution Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-yellow-500">{resolutionRate}%</span>
                <TrendingUp className="w-6 h-6 text-yellow-500/50" />
              </div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-yellow-500/20 border-t-yellow-500 animate-spin-slow flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-yellow-500" />
            </div>
          </motion.div>

          {/* Bento 4: Categories Chart (md:col-span-4) */}
          <motion.div 
             whileHover={{ scale: 1.02 }}
             className="md:col-span-4 p-6 rounded-[2rem] bg-card border border-white/10 shadow-xl flex flex-col"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Top Categories</h3>
            {topCategories.length > 0 ? (
              <div className="flex-1 min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={topCategories} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                      {topCategories.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#EAB308', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/20 text-sm">No data yet</div>
            )}
          </motion.div>

          {/* Bento 5: AI Insights (md:col-span-8, row-span-2) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="md:col-span-8 md:row-span-2 p-8 rounded-[2rem] bg-gradient-to-br from-card to-background border border-white/10 shadow-xl flex flex-col"
          >
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-yellow-500">
                  <Sparkles className="w-5 h-5" />
                  AI Community Insights
                </h3>
                <button
                  onClick={loadInsights}
                  disabled={insightsLoading}
                  className="px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-bold hover:bg-yellow-500/20 transition-colors disabled:opacity-50"
                >
                  {insightsLoading ? 'Analyzing...' : 'Generate New'}
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {insightsLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-yellow-500/50">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm font-medium">Gemini is analyzing reports...</p>
                  </div>
                ) : insights.length > 0 ? (
                  insights.map(insight => (
                    <div key={insight.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-yellow-500/30 transition-colors">
                      <p className="text-sm font-bold text-white mb-2">{insight.title}</p>
                      <p className="text-sm text-white/60 leading-relaxed">{insight.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-white/20">
                     <Sparkles className="w-10 h-10 opacity-20" />
                     <p className="text-sm">Click Generate to get AI insights about your community.</p>
                  </div>
                )}
              </div>
          </motion.div>

          {/* Bento 6: Recent Issues (md:col-span-4, row-span-2) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="md:col-span-4 md:row-span-2 p-6 rounded-[2rem] bg-card border border-white/10 shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Recent Reports</h2>
              <Link to="/issues" className="text-xs text-yellow-500 hover:underline font-bold">View All</Link>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
              {recentIssues.length === 0 ? (
                <div className="text-center py-10">
                   <p className="text-white/40 text-sm mb-4">No issues yet</p>
                   <button onClick={seedDummyData} className="text-xs font-bold bg-white/10 px-4 py-2 rounded-full hover:bg-white/20">Seed Demo Data</button>
                </div>
              ) : (
                recentIssues.map((issue) => {
                  const catMeta = CATEGORIES.find(c => c.key === issue.category);
                  const statusMeta = STATUSES.find(s => s.key === issue.status);
                  return (
                    <Link
                      key={issue.id}
                      to={`/issues/${issue.id}`}
                      className="block p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-yellow-500/30 hover:bg-white/[0.05] transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="text-sm font-bold text-white/90 line-clamp-1 group-hover:text-yellow-400">{issue.title}</h3>
                         <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${statusMeta?.bgColor} ${statusMeta?.color}`}>
                           {statusMeta?.label}
                         </span>
                      </div>
                      <p className="text-xs text-white/40 line-clamp-2 mb-3">{issue.description}</p>
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-white/30">
                         <span className={catMeta?.color}>{catMeta?.label}</span>
                         <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" />{issue.upvotes}</span>
                         <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(issue.createdAt)}</span>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </motion.div>

        </div>
      </div>
      
      <FloatingChatbot />
    </div>
  );
}
