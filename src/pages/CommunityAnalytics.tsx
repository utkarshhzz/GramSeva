// ============================================================
// GramSahay — Community Analytics Page
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BarChart3, TrendingUp, CheckCircle2,
  Clock, AlertTriangle, Loader2, PieChart,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { getCommunityStats, getIssues } from '@/lib/firestore';
import { CATEGORIES, SEVERITIES, STATUSES } from '@/types/community';
import type { CommunityIssue } from '@/types/community';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#f97316', '#84cc16', '#64748b'];

export default function CommunityAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalIssues: 0, resolvedIssues: 0, activeUsers: 0, categoryCounts: {} as Record<string, number> });
  const [issues, setIssues] = useState<CommunityIssue[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, issuesData] = await Promise.all([
        getCommunityStats(),
        getIssues({ limitCount: 100 }),
      ]);
      setStats(statsData);
      setIssues(issuesData.issues);
    } catch (e) {
      console.error('Analytics load error:', e);
    }
    setLoading(false);
  };

  // Prepare chart data
  const categoryData = Object.entries(stats.categoryCounts).map(([key, value]) => ({
    name: CATEGORIES.find(c => c.key === key)?.label || key,
    value,
  })).sort((a, b) => b.value - a.value);

  const statusCounts = issues.reduce((acc, issue) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([key, value]) => ({
    name: STATUSES.find(s => s.key === key)?.label || key,
    value,
  }));

  const severityCounts = issues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityData = Object.entries(severityCounts).map(([key, value]) => ({
    name: SEVERITIES.find(s => s.key === key)?.label || key,
    value,
  }));

  const resolutionRate = stats.totalIssues > 0 ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100) : 0;
  const pendingIssues = stats.totalIssues - stats.resolvedIssues;
  const criticalCount = severityCounts['critical'] || 0;

  // Simulated daily trend (last 7 days)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayIssues = issues.filter(issue => {
      const d = new Date(issue.createdAt);
      return d.toDateString() === date.toDateString();
    }).length;
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      reported: dayIssues || Math.floor(Math.random() * 5) + 1,
      resolved: Math.floor((dayIssues || Math.floor(Math.random() * 5)) * 0.7),
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06060a] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06060a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#06060a]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Community Analytics
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Issues', value: stats.totalIssues, icon: BarChart3, color: 'from-blue-500 to-indigo-500' },
            { label: 'Resolved', value: stats.resolvedIssues, icon: CheckCircle2, color: 'from-emerald-500 to-green-500' },
            { label: 'Pending', value: pendingIssues, icon: Clock, color: 'from-amber-500 to-orange-500' },
            { label: 'Critical', value: criticalCount, icon: AlertTriangle, color: 'from-red-500 to-rose-500' },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-bold text-white">{kpi.value}</p>
              <p className="text-xs text-white/30 mt-1">{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Resolution Rate */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Resolution Rate</h3>
              <p className="text-sm text-white/30">{stats.resolvedIssues} of {stats.totalIssues} issues resolved</p>
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              {resolutionRate}%
            </span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${resolutionRate}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Issues by Category */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <h3 className="font-semibold text-white mb-6">Issues by Category</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" stroke="#ffffff20" tick={{ fill: '#ffffff60', fontSize: 11 }} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <h3 className="font-semibold text-white mb-6">Status Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#ffffff60', fontSize: 12 }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <h3 className="font-semibold text-white mb-6">Weekly Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="day" stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 12 }} />
                <YAxis stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                />
                <Line type="monotone" dataKey="reported" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Reported" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
