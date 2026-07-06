import { motion } from 'framer-motion';
import { Zap, CheckCircle2, TrendingUp } from 'lucide-react';
import ScoreDial from '../../components/ScoreDial.jsx';

export default function AuthSidePanel() {
  return (
    <div className="hidden lg:flex w-[44%] relative bg-ink overflow-hidden flex-col justify-between p-10">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(91,91,246,0.35), transparent 50%), radial-gradient(circle at 80% 70%, rgba(45,212,191,0.25), transparent 50%)',
        }}
      />

      <div className="relative z-10 flex items-center gap-2 text-white font-display font-bold text-lg">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-signal to-pulse flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </span>
        HireAI
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="bg-white rounded-2xl shadow-lifted p-5 w-72"
        >
          <div className="flex items-center gap-3">
            <ScoreDial score={92} size={56} strokeWidth={5} animate />
            <div>
              <p className="text-sm font-semibold text-slate-ink">Match Score</p>
              <p className="text-xs text-slate-soft">Senior Frontend Engineer</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {['React', 'TypeScript', 'Redux'].map((s) => (
              <span key={s} className="badge bg-pulse/10 text-pulse-dark">{s}</span>
            ))}
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lifted p-4 w-64 mt-5 -ml-8"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-slate-ink">
            <CheckCircle2 size={16} className="text-pulse" /> Interview scheduled
          </div>
          <p className="text-xs text-slate-soft mt-1 font-mono">Tomorrow, 2:30 PM</p>
        </motion.div>

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="bg-white rounded-2xl shadow-lifted p-4 w-56 mt-5 ml-10"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-slate-ink">
            <TrendingUp size={16} className="text-signal" /> 6 new matches today
          </div>
        </motion.div>
      </div>

      <p className="relative z-10 text-slate-400 text-sm leading-relaxed max-w-sm">
        "HireAI cut our screening time dramatically — the match scores are spot on."
        <span className="block mt-1 text-slate-500">— Sarah Mitchell, Nimbus Technologies</span>
      </p>
    </div>
  );
}
