import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * ScoreDial — animated circular progress ring showing a 0-100 score.
 * This is HireAI's visual signature: every match score in the app
 * (hero, job cards, applicant rows) renders through this same component.
 */
export default function ScoreDial({ score = 0, size = 72, strokeWidth = 6, label, animate = true }) {
  const prefersReducedMotion = useReducedMotion();
  const [displayScore, setDisplayScore] = useState(animate && !prefersReducedMotion ? 0 : score);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const tone =
    score >= 75 ? 'pulse' : score >= 50 ? 'signal' : 'ember';

  const strokeColor = {
    pulse: '#2DD4BF',
    signal: '#5B5BF6',
    ember: '#FB923C',
  }[tone];

  useEffect(() => {
    if (!animate || prefersReducedMotion) {
      setDisplayScore(score);
      return;
    }
    let frame;
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-slate-ink" style={{ fontSize: size * 0.26 }}>
          {displayScore}
          <span style={{ fontSize: size * 0.16 }}>%</span>
        </span>
        {label && <span className="text-[10px] text-slate-soft -mt-0.5">{label}</span>}
      </div>
    </div>
  );
}
