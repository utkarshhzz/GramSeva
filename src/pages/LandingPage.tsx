// ============================================================
// GramSahay — Premium Landing Page
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  MapPin, Shield, Mic, BarChart3, Users, Zap,
  ArrowRight, ChevronDown, Star, CheckCircle2,
  Construction, Droplets, TreePine, Trash2,
  ShieldAlert, Building2, Globe, Award,
  TrendingUp, Clock, MessageSquare,
} from 'lucide-react';
import HeroCanvas from '../components/HeroCanvas';

// ── Animated Counter ──────────────────────────────────────────

function AnimatedCounter({ target, suffix = '', duration = 2000 }: {
  target: number; suffix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Category Card ─────────────────────────────────────────────

const issueCategories = [
  { icon: Construction, label: 'Roads & Transport', color: 'from-orange-500 to-amber-500', count: '2.4K' },
  { icon: Droplets, label: 'Water Supply', color: 'from-blue-500 to-cyan-500', count: '1.8K' },
  { icon: Zap, label: 'Electricity', color: 'from-yellow-500 to-orange-400', count: '1.2K' },
  { icon: Trash2, label: 'Sanitation', color: 'from-green-500 to-emerald-500', count: '980' },
  { icon: ShieldAlert, label: 'Public Safety', color: 'from-red-500 to-rose-500', count: '756' },
  { icon: TreePine, label: 'Environment', color: 'from-emerald-500 to-teal-500', count: '543' },
];

// ── Feature data ──────────────────────────────────────────────

const features = [
  {
    icon: MapPin,
    title: 'Pin Issues on Map',
    desc: 'Report problems with exact GPS location. See a live heatmap of community issues in your area.',
    gradient: 'from-violet-500 to-indigo-500',
  },
  {
    icon: Mic,
    title: 'Voice-First Reporting',
    desc: 'Just speak in Hindi, English, or Kannada. Our AI transcribes, classifies, and files the report automatically.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Shield,
    title: 'AI Issue Classification',
    desc: 'Gemini AI auto-categorizes issues, assesses severity, identifies the right authority, and drafts formal complaints.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Community Analytics',
    desc: 'Track resolution rates, identify problem hotspots, and see AI-generated insights about your community.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Users,
    title: 'Community Heroes',
    desc: 'Earn points and badges for reporting and resolving issues. Climb the leaderboard and become your community\'s hero.',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    icon: Globe,
    title: 'Multilingual Support',
    desc: 'Full support for Hindi, English, and Kannada. Breaking language barriers for rural communities.',
    gradient: 'from-purple-500 to-violet-500',
  },
];

const howItWorks = [
  { step: '01', title: 'Report', desc: 'Snap a photo, pin the location, describe the issue — or just speak it.', icon: MapPin },
  { step: '02', title: 'AI Analyzes', desc: 'Gemini AI classifies the issue, assesses severity, and identifies the responsible authority.', icon: Zap },
  { step: '03', title: 'Community Supports', desc: 'Neighbors upvote and comment. Critical issues rise to the top automatically.', icon: Users },
  { step: '04', title: 'Resolution', desc: 'Track status from reported to resolved. Celebrate community wins together.', icon: CheckCircle2 },
];

const testimonials = [
  {
    name: 'Ramesh Kumar',
    role: 'Gram Panchayat Member, Varanasi',
    text: 'GramSahay helped our village report and fix 23 road issues in just 2 months. The AI suggestions made it easy to contact the right department.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'School Teacher, Lucknow',
    text: 'I reported a broken water pipeline using voice in Hindi. Within 3 days, Jal Board fixed it. This app truly empowers common citizens!',
    rating: 5,
  },
  {
    name: 'Suresh Patel',
    role: 'Shop Owner, Bangalore',
    text: 'The community leaderboard motivates everyone. Our ward has the highest resolution rate in the district now. Proud to be a Community Hero!',
    rating: 5,
  },
];

// ── Main Component ────────────────────────────────────────────

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[#06060a] text-white overflow-x-hidden">
      {/* ── Navigation ────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#06060a]/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              GramSahay
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">How It Works</a>
            <a href="#categories" className="text-sm text-white/60 hover:text-white transition-colors">Categories</a>
            <a href="#testimonials" className="text-sm text-white/60 hover:text-white transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/sign-in"
              className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/sign-up"
              className="text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 px-5 py-2.5 rounded-full font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section (3D Cinematic) ──────────────────────────────── */}
      <HeroCanvas />

      {/* ── Stats Bar ─────────────────────────────────── */}
      <section className="relative py-16 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 15000, suffix: '+', label: 'Issues Reported' },
              { value: 12800, suffix: '+', label: 'Issues Resolved' },
              { value: 850, suffix: '+', label: 'Communities Active' },
              { value: 95, suffix: '%', label: 'Resolution Rate' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Issue Categories ──────────────────────────── */}
      <section id="categories" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-indigo-400 text-sm font-medium mb-3 uppercase tracking-wider">Report Any Issue</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Every Problem Has A Category
              </span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              From broken roads to water shortages — report any community issue and our AI will route it to the right authority.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {issueCategories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 backdrop-blur-sm transition-all cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-[0.06] transition-opacity`} />
                <cat.icon className="w-8 h-8 text-white/60 group-hover:text-white/80 transition-colors mb-3" />
                <h3 className="font-semibold text-white/90 mb-1">{cat.label}</h3>
                <p className="text-sm text-white/40">{cat.count} issues reported</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────── */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-indigo-400 text-sm font-medium mb-3 uppercase tracking-wider">Platform Features</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                AI-Powered Community Action
              </span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Built with Google Gemini AI to make community service accessible, intelligent, and impactful.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/40 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-indigo-400 text-sm font-medium mb-3 uppercase tracking-wider">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent -translate-y-1/2" />

            <div className="grid md:grid-cols-4 gap-8">
              {howItWorks.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative text-center"
                >
                  <div className="relative z-10 w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-indigo-400" />
                  </div>
                  <span className="text-xs font-bold text-indigo-500 mb-2 block">{step.step}</span>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────── */}
      <section id="testimonials" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-indigo-400 text-sm font-medium mb-3 uppercase tracking-wider">Community Love</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                What Our Heroes Say
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-white/30">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />

            <div className="relative px-8 md:px-16 py-16 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Be Your Community's Hero
              </h2>
              <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
                Join thousands of citizens making a real difference. Report your first issue today and start driving change.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/sign-up"
                  className="group flex items-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/90 transition-all hover:scale-[1.02]"
                >
                  Join GramSahay
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/community-map"
                  className="flex items-center gap-2 px-8 py-4 rounded-full text-lg font-medium border border-white/30 hover:bg-white/10 transition-all"
                >
                  Explore Issues Map
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white/80">GramSahay</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/30">
              <Link to="/sign-in" className="hover:text-white/60 transition-colors">Sign In</Link>
              <a href="#features" className="hover:text-white/60 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white/60 transition-colors">How It Works</a>
            </div>
            <div className="text-sm text-white/20">
              Built with ❤️ for Indian Communities · Powered by Google Gemini
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
