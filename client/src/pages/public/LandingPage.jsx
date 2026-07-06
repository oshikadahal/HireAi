import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Brain, Code2, Calendar, Target, TrendingUp, BarChart3,
  Star, ArrowRight, CheckCircle2, Sparkles,
} from 'lucide-react';
import ScoreDial from '../../components/ScoreDial.jsx';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const STATS = [
  { label: 'Jobs Posted', value: '2,400+' },
  { label: 'Companies', value: '320+' },
  { label: 'Candidates', value: '18,900+' },
  { label: 'Avg. Time to Hire', value: '9 days' },
];

const FEATURES = [
  { icon: Brain, title: 'AI Resume Screening', desc: 'Resumes are parsed automatically and scored against job requirements in seconds.', tone: 'signal' },
  { icon: Code2, title: 'Coding Assessments', desc: 'Built-in MCQ and coding tests evaluate technical skills objectively, at scale.', tone: 'pulse' },
  { icon: Calendar, title: 'Interview Scheduling', desc: 'One click schedules the interview and generates tailored questions for the role.', tone: 'signal' },
  { icon: Target, title: 'Match Scoring', desc: 'Every application gets a transparent 0–100 score with a skill-gap breakdown.', tone: 'ember' },
  { icon: TrendingUp, title: 'Pipeline Tracking', desc: 'Move candidates through Applied → Interview → Hired with one click.', tone: 'pulse' },
  { icon: BarChart3, title: 'Hiring Analytics', desc: 'Real-time dashboards show acceptance rates and your best-performing jobs.', tone: 'signal' },
];

const TONE_CLASSES = {
  signal: 'text-signal bg-signal/10',
  pulse: 'text-pulse-dark bg-pulse/10',
  ember: 'text-ember bg-ember/10',
};

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Frontend Engineer', text: 'I could see exactly which skills I was missing for each role. Landed an offer in two weeks.', rating: 5 },
  { name: 'Sarah Mitchell', role: 'Head of Talent, Nimbus Tech', text: 'Screening time dropped dramatically once we started trusting the match scores.', rating: 5 },
  { name: 'David Okafor', role: 'Product Designer', text: 'The whole application flow feels considered — not just another job board.', rating: 5 },
];

export default function LandingPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  };

  return (
    <div className="overflow-hidden">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-ink py-20 sm:py-28 px-4 sm:px-6">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 15% 25%, rgba(91,91,246,0.25), transparent 45%), radial-gradient(circle at 85% 75%, rgba(45,212,191,0.18), transparent 45%)',
          }}
        />
        <div className="max-w-7xl mx-auto relative grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-pulse text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={14} /> AI-Powered Recruitment
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-[1.1] mb-6">
              Hiring, scored
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-signal-light to-pulse">in real numbers.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-slate-400 mb-9 max-w-lg">
              HireAI matches candidates to roles with a transparent score — not gut feeling.
              Less guessing, faster decisions, better hires.
            </motion.p>

            <motion.form variants={fadeUp} onSubmit={handleSearch} className="flex max-w-md gap-2 mb-8">
              <div className="flex-1 relative">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search jobs, skills, companies…"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-signal focus:bg-white/10 transition-colors"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="bg-signal hover:bg-signal-dark text-white px-6 py-3.5 rounded-xl font-medium transition-colors flex-shrink-0">
                Search
              </button>
            </motion.form>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              {['React Developer', 'Data Analyst', 'Product Designer', 'DevOps Engineer'].map((t) => (
                <button key={t} onClick={() => navigate(`/jobs?search=${encodeURIComponent(t)}`)} className="hover:text-pulse transition-colors">
                  {t} →
                </button>
              ))}
            </motion.div>
          </motion.div>

          {/* Floating match-score mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-[420px] hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-4 left-4 bg-white rounded-2xl shadow-lifted p-5 w-72"
            >
              <div className="flex items-center gap-4">
                <ScoreDial score={92} size={64} strokeWidth={6} />
                <div>
                  <p className="text-sm font-semibold text-slate-ink">Senior Frontend Engineer</p>
                  <p className="text-xs text-slate-soft">Nimbus Technologies</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {['React', 'TypeScript', 'Redux', 'Tailwind'].map((s) => (
                  <span key={s} className="badge bg-pulse/10 text-pulse-dark text-xs">{s}</span>
                ))}
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute top-56 right-2 bg-white rounded-2xl shadow-lifted p-4 w-64"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-slate-ink mb-2">
                <CheckCircle2 size={15} className="text-pulse" /> Pipeline
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                {['Applied', 'Screen', 'Interview', 'Hired'].map((s, i) => (
                  <span key={s} className={`px-2 py-1 rounded-md ${i === 2 ? 'bg-signal text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
              className="absolute bottom-2 left-16 bg-white rounded-2xl shadow-lifted p-4 w-60"
            >
              <div className="flex items-center gap-2">
                <ScoreDial score={78} size={40} strokeWidth={4} animate={false} />
                <div>
                  <p className="text-xs font-semibold text-slate-ink">3 new candidates</p>
                  <p className="text-xs text-slate-soft">matched today</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100 py-10 px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {STATS.map(({ label, value }) => (
            <motion.div key={label} variants={fadeUp} className="text-center">
              <p className="text-3xl font-display font-bold text-signal font-mono">{value}</p>
              <p className="text-sm text-slate-soft mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-paper">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-ink">Everything end-to-end hiring needs</h2>
            <p className="text-slate-soft mt-3 text-lg">One platform, from first application to signed offer.</p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map(({ icon: Icon, title, desc, tone }) => (
              <motion.div key={title} variants={fadeUp} whileHover={{ y: -4 }} className="card transition-shadow hover:shadow-lifted">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${TONE_CLASSES[tone]}`}>
                  <Icon size={21} />
                </div>
                <h3 className="text-lg font-display font-semibold text-slate-ink mb-2">{title}</h3>
                <p className="text-slate-soft text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-signal to-pulse-dark relative overflow-hidden">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">Ready to hire with confidence?</h2>
          <p className="text-white/80 text-lg mb-8">Join candidates and companies already matching smarter on HireAI.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register/candidate" className="bg-white text-signal font-semibold px-8 py-3 rounded-xl hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2">
              Find Jobs <ArrowRight size={16} />
            </Link>
            <Link to="/register/hr" className="bg-white/10 border border-white/25 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2">
              Post Jobs <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-3xl font-display font-bold text-center text-slate-ink mb-12">
            What people say
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, rating }) => (
              <motion.div key={name} variants={fadeUp} className="card">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={15} fill="#FB923C" className="text-ember" />
                  ))}
                </div>
                <p className="text-slate-soft text-sm leading-relaxed mb-4">"{text}"</p>
                <p className="font-semibold text-slate-ink text-sm">{name}</p>
                <p className="text-slate-400 text-xs">{role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
