import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Clock, Star, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../services/api.js';
import { avatarFor } from '../../utils/avatar.js';
import { useAuth } from '../../hooks/useAuth.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ScoreDial from '../../components/ScoreDial.jsx';

const STATUS_BADGE = {
  applied: 'bg-blue-100 text-blue-700',
  screening: 'bg-amber-100 text-amber-700',
  shortlisted: 'bg-signal/10 text-signal-dark',
  interview: 'bg-purple-100 text-purple-700',
  selected: 'bg-pulse/10 text-pulse-dark',
  hired: 'bg-pulse/10 text-pulse-dark',
  rejected: 'bg-red-100 text-red-600',
};

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/candidates/dashboard-stats'),
      api.get('/applications/my'),
      api.get('/ai/recommend-jobs').catch(() => ({ data: { recommendations: [] } })),
    ])
      .then(([statsRes, appsRes, recsRes]) => {
        setStats(statsRes.data.stats);
        setApps(appsRes.data.applications.slice(0, 5));
        setRecs(recsRes.data.recommendations?.slice(0, 3) || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullHeight label="Loading dashboard…" />;

  const statCards = [
    { label: 'Total Applied', value: stats?.total || 0, icon: Briefcase, tone: 'signal' },
    { label: 'Under Review', value: (stats?.applied || 0) + (stats?.screening || 0), icon: Clock, tone: 'ember' },
    { label: 'Shortlisted', value: stats?.shortlisted || 0, icon: Star, tone: 'pulse' },
    { label: 'Interviews', value: stats?.interview || 0, icon: CheckCircle2, tone: 'signal' },
  ];
  const TONE = { signal: 'text-signal bg-signal/10', ember: 'text-ember bg-ember/10', pulse: 'text-pulse-dark bg-pulse/10' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-ink">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-soft text-sm mt-1">Here's your job search overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, tone }) => (
          <motion.div key={label} whileHover={{ y: -2 }} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${TONE[tone]}`}>
              <Icon size={21} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-ink font-mono">{value}</p>
              <p className="text-xs text-slate-soft">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-ink">Recent Applications</h2>
            <Link to="/candidate/applications" className="text-sm text-signal hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {apps.length === 0 ? (
            <div className="text-center py-10">
              <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-soft text-sm">No applications yet.</p>
              <Link to="/jobs" className="btn-primary mt-4 inline-flex">Browse Jobs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {apps.map((app) => (
                <div key={app._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={avatarFor(app.job?.company?.logo, app.job?.company?.companyName)} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" alt="" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-ink truncate">{app.job?.title}</p>
                      <p className="text-xs text-slate-400 truncate">{app.job?.company?.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {app.matchScore > 0 && <ScoreDial score={app.matchScore} size={34} strokeWidth={3.5} animate={false} />}
                    <span className={`badge ${STATUS_BADGE[app.status] || 'bg-slate-100 text-slate-600'}`}>{app.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-display font-semibold text-slate-ink mb-4">AI Recommendations</h2>
          {recs.length === 0 ? (
            <p className="text-slate-soft text-sm">Add skills to your profile to get personalized job matches.</p>
          ) : (
            <div className="space-y-3">
              {recs.map(({ job, score }) => (
                <Link key={job._id} to={`/jobs/${job._id}`} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:border-signal/30 hover:bg-signal/5 transition-colors">
                  <ScoreDial score={score} size={38} strokeWidth={4} animate={false} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-ink truncate">{job.title}</p>
                    <p className="text-xs text-slate-400 truncate">{job.company?.companyName}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
