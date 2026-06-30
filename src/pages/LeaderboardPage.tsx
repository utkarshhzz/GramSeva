// ============================================================
// GramSahay — Leaderboard Page
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, Medal, Award, Star, ArrowLeft, Shield,
  Users, TrendingUp, Loader2, Crown,
} from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getLeaderboard } from '@/lib/firestore';
import type { CommunityUser } from '@/types/community';

const RANK_COLORS = ['text-amber-400', 'text-gray-300', 'text-amber-600'];
const RANK_BG     = ['bg-amber-400/10 border-amber-400/20', 'bg-gray-300/10 border-gray-300/20', 'bg-amber-600/10 border-amber-600/20'];

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(20);
      setLeaders(data);
    } catch (e) {
      console.error('Leaderboard error:', e);
    }
    setLoading(false);
  };

  const myRank = leaders.findIndex(l => l.uid === user?.uid) + 1;

  return (
    <div className="min-h-screen bg-[#06060a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#06060a]/80 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Community Heroes
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Top 3 podium */}
        {!loading && leaders.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-12 pt-8">
            {/* 2nd place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-xl font-bold mb-2">
                {(leaders[1].name?.[0] || '?').toUpperCase()}
              </div>
              <p className="text-sm font-medium text-white/90 mb-1">{leaders[1].name}</p>
              <p className="text-xs text-gray-400">{leaders[1].points} pts</p>
              <div className="mt-2 w-20 h-16 bg-gray-400/10 border border-gray-400/20 rounded-t-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">2</span>
              </div>
            </motion.div>

            {/* 1st place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center -mt-8"
            >
              <Crown className="w-8 h-8 text-amber-400 mx-auto mb-1" />
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-2xl font-bold mb-2 ring-4 ring-amber-400/20">
                {(leaders[0].name?.[0] || '?').toUpperCase()}
              </div>
              <p className="text-sm font-medium text-white mb-1">{leaders[0].name}</p>
              <p className="text-xs text-amber-400">{leaders[0].points} pts</p>
              <div className="mt-2 w-24 h-24 bg-amber-400/10 border border-amber-400/20 rounded-t-xl flex items-center justify-center">
                <span className="text-3xl font-bold text-amber-400">1</span>
              </div>
            </motion.div>

            {/* 3rd place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-xl font-bold mb-2">
                {(leaders[2].name?.[0] || '?').toUpperCase()}
              </div>
              <p className="text-sm font-medium text-white/90 mb-1">{leaders[2].name}</p>
              <p className="text-xs text-amber-600">{leaders[2].points} pts</p>
              <div className="mt-2 w-20 h-12 bg-amber-600/10 border border-amber-600/20 rounded-t-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-amber-600">3</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Your rank */}
        {myRank > 0 && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <p className="text-sm text-indigo-300">
              Your rank: <span className="font-bold text-lg">#{myRank}</span> with{' '}
              <span className="font-bold">{leaders[myRank - 1]?.points || 0}</span> points
            </p>
          </div>
        )}

        {/* Full list */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {leaders.map((leader, i) => (
              <motion.div
                key={leader.uid}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  leader.uid === user?.uid
                    ? 'bg-indigo-500/10 border border-indigo-500/20'
                    : 'bg-white/[0.02] border border-white/[0.04] hover:border-white/10'
                }`}
              >
                {/* Rank */}
                <div className={`w-8 text-center font-bold text-lg ${
                  i < 3 ? RANK_COLORS[i] : 'text-white/30'
                }`}>
                  {i + 1}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  i < 3
                    ? `bg-gradient-to-br ${i === 0 ? 'from-amber-400 to-amber-500' : i === 1 ? 'from-gray-300 to-gray-400' : 'from-amber-600 to-amber-700'}`
                    : 'bg-white/10 text-white/50'
                }`}>
                  {(leader.name?.[0] || '?').toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white/90 text-sm truncate">
                    {leader.name}
                    {leader.uid === user?.uid && <span className="text-indigo-400 ml-2">(You)</span>}
                  </p>
                  <p className="text-xs text-white/30">
                    {leader.issuesReported} reported · {leader.issuesResolved} resolved
                  </p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className={`font-bold ${i < 3 ? RANK_COLORS[i] : 'text-white/60'}`}>{leader.points}</p>
                  <p className="text-[10px] text-white/20">points</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
