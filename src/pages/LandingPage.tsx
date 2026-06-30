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
  TrendingUp, Clock, MessageSquare, Mail, FileText,
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
    icon: Shield,
    title: 'Auto-Mail & Complaint Drafts',
    desc: 'Gemini AI automatically drafts formal complaint letters and identifies the correct municipal authority for your specific issue.',
    gradient: 'from-yellow-500 to-yellow-300',
  },
  {
    icon: Building2,
    title: 'AI Government Schemes Matching',
    desc: 'Discover state and central government schemes personalized for you using our smart AI matching engine.',
    gradient: 'from-yellow-600 to-yellow-400',
  },
  {
    icon: Mic,
    title: 'Voice-First Reporting',
    desc: 'Report issues instantly by speaking in Hindi, English, or Kannada. Our AI transcribes and files it seamlessly.',
    gradient: 'from-amber-500 to-yellow-500',
  },
  {
    icon: MapPin,
    title: 'Live Heatmaps',
    desc: 'Report problems with exact GPS location. See a live heatmap of community issues in your area.',
    gradient: 'from-yellow-700 to-amber-500',
  },
  {
    icon: MessageSquare,
    title: 'Multilingual AI Assistant',
    desc: 'Chat with our AI in your native language to get guidance on reporting issues or applying for schemes.',
    gradient: 'from-yellow-400 to-yellow-200',
  },
  {
    icon: FileText,
    title: 'End-to-End Audit Trail',
    desc: 'Every issue is tracked from reporting to resolution with full transparency and community upvoting.',
    gradient: 'from-amber-600 to-yellow-600',
  }
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
  const { scrollY } = useScroll();
  // Hero is 300vh. Reveal navbar after 200vh
  const navY = useTransform(scrollY, [0, window.innerHeight * 2, window.innerHeight * 2.5], [-100, -100, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navigation ────────────────────────────────── */}
      <motion.nav 
        style={{ y: navY }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-white/90">
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
              className="text-sm bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 px-6 py-2.5 rounded-full font-bold transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

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
                <div className="text-3xl md:text-4xl font-bold text-primary">
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
            <p className="text-primary text-sm font-bold mb-3 uppercase tracking-widest">Report Any Issue</p>
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
                <div className={`absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
                <cat.icon className="w-8 h-8 text-white/40 group-hover:text-primary transition-colors mb-3" />
                <h3 className="font-semibold text-white/90 mb-1">{cat.label}</h3>
                <p className="text-sm text-white/40">{cat.count} issues reported</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────── */}
      <section id="features" className="py-24 relative border-t border-white/5">
        <div className="absolute inset-0 bg-background" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-primary text-sm font-bold mb-3 uppercase tracking-widest">Platform Features</p>
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
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative p-8 rounded-3xl bg-card border border-white/10 hover:border-primary/50 transition-all shadow-lg hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.3)]`}>
                  <feature.icon className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Ecosystem (Bento Box Showcase) ───────────────────────── */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-primary text-sm font-bold mb-3 uppercase tracking-widest">Ecosystem</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Everything You Need, In One Place
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento 1: Report */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="md:col-span-2 p-8 rounded-[2rem] bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 hover:border-primary/50 transition-all flex flex-col md:flex-row items-center gap-8 group shadow-xl hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]"
            >
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Report Issues Instantly</h3>
                <p className="text-white/60 mb-6">Use voice or text to report local problems. Our AI instantly drafts a formal letter to the correct authority.</p>
                <Link to="/report" className="text-primary font-bold hover:underline flex items-center gap-2">
                  Try Reporting <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="w-full md:w-1/2 aspect-video rounded-2xl bg-black/50 border border-white/5 flex items-center justify-center overflow-hidden">
                <div className="w-24 h-24 rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
                   <Mic className="w-10 h-10 text-primary" />
                </div>
              </div>
            </motion.div>

            {/* Bento 2: Government Schemes */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-8 rounded-[2rem] bg-card border border-white/10 hover:border-primary/50 transition-all group shadow-xl hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Government Schemes</h3>
              <p className="text-white/60 mb-6 text-sm">Discover and apply for schemes perfectly matched to your demographic.</p>
              <Link to="/government" className="text-primary font-bold hover:underline flex items-center gap-2 text-sm mt-auto">
                Explore Schemes <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Bento 3: AI Assistant */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="p-8 rounded-[2rem] bg-card border border-white/10 hover:border-primary/50 transition-all group shadow-xl hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Assistant</h3>
              <p className="text-white/60 mb-6 text-sm">24/7 multilingual support answering your questions and guiding you.</p>
              <Link to="/assistant" className="text-primary font-bold hover:underline flex items-center gap-2 text-sm mt-auto">
                Chat Now <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Bento 4: Analytics Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="md:col-span-2 p-8 rounded-[2rem] bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 hover:border-primary/50 transition-all flex flex-col md:flex-row-reverse items-center gap-8 group shadow-xl hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]"
            >
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Community Live Map</h3>
                <p className="text-white/60 mb-6">View live issue heatmaps, track neighborhood analytics, and see which areas need the most help.</p>
                <Link to="/community-map" className="text-primary font-bold hover:underline flex items-center gap-2">
                  View Heatmap <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="w-full md:w-1/2 aspect-video rounded-2xl bg-black/50 border border-white/5 flex flex-col items-center justify-center overflow-hidden gap-3">
                 <div className="flex items-end gap-2 h-20">
                    <div className="w-4 bg-primary/40 h-8 rounded-t-sm" />
                    <div className="w-4 bg-primary/60 h-12 rounded-t-sm" />
                    <div className="w-4 bg-primary h-20 rounded-t-sm" />
                    <div className="w-4 bg-primary/80 h-16 rounded-t-sm" />
                 </div>
              </div>
            </motion.div>
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
            <p className="text-primary text-sm font-bold mb-3 uppercase tracking-widest">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2" />

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
                  <div className="relative z-10 w-16 h-16 mx-auto mb-5 rounded-2xl bg-card border border-white/10 group-hover:border-primary/50 flex items-center justify-center transition-colors">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-primary mb-2 block tracking-widest">{step.step}</span>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────── */}
      <section id="testimonials" className="py-24 relative border-t border-white/5">
        <div className="absolute inset-0 bg-background" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-primary text-sm font-bold mb-3 uppercase tracking-widest">Community Love</p>
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
                    <Star key={j} className="w-4 h-4 text-primary fill-primary" />
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
            <div className="absolute inset-0 bg-card border border-white/10 rounded-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--primary)_0%,transparent_80%)] opacity-[0.05]" />

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
                  className="group flex items-center gap-2 bg-primary text-black px-10 py-4 rounded-full text-lg font-bold hover:brightness-110 transition-all hover:scale-[1.02]"
                >
                  Join GramSahay
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/community-map"
                  className="flex items-center gap-2 px-8 py-4 rounded-full text-lg font-medium border border-white/20 hover:border-primary/50 hover:text-primary transition-all"
                >
                  Explore Issues Map
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
