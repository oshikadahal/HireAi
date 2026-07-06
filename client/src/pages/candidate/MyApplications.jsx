import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MapPin, Clock, Briefcase } from 'lucide-react';
import api from '../../services/api.js';
import { avatarFor } from '../../utils/avatar.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ScoreDial from '../../components/ScoreDial.jsx';

const STATUS_META = {
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  screening: { label: 'Screening', color: 'bg-amber-100 text-amber-700' },
  shortlisted: { label: 'Shortlisted', color: 'bg-signal/10 text-signal-dark' },
  interview: { label: 'Interview', color: 'bg-purple-100 text-purple-700' },
  selected: { label: 'Selected', color: 'bg-pulse/10 text-pulse-dark' },
  hired: { label: 'Hired 🎉', color: 'bg-pulse/10 text-pulse-dark' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600' },
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/applications/my').then((r) => setApplications(r.data.applications)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? applications : applications.filter((a) => a.status === filter);
  const counts = applications.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

  if (loading) return <LoadingSpinner fullHeight label="Loading applications…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-ink">My Applications</h1>
        <p className="text-slate-soft text-sm mt-1">{applications.length} total applications</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-signal text-white' : 'bg-white border border-slate-200 text-slate-soft hover:bg-slate-50'}`}>
          All ({applications.length})
        </button>
        {Object.entries(STATUS_META).filter(([key]) => counts[key]).map(([key, meta]) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === key ? 'bg-signal text-white' : 'bg-white border border-slate-200 text-slate-soft hover:bg-slate-50'}`}>
            {meta.label} ({counts[key]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No applications here" description="Browse open roles and apply to get started." action={<Link to="/jobs" className="btn-primary">Browse Jobs</Link>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const meta = STATUS_META[app.status] || STATUS_META.applied;
            const isOpen = expanded === app._id;
            return (
              <div key={app._id} className="card">
                <div className="flex items-center gap-4">
                  <img src={avatarFor(app.job?.company?.logo, app.job?.company?.companyName)} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-display font-semibold text-slate-ink truncate">{app.job?.title || 'Job'}</h3>
                        <p className="text-sm text-slate-soft">{app.job?.company?.companyName}</p>
                      </div>
                      <span className={`badge ${meta.color}`}>{meta.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                      {app.job?.location && <span className="flex items-center gap-1"><MapPin size={11} />{app.job.location}</span>}
                      <span className="flex items-center gap-1 font-mono"><Clock size={11} />Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {app.matchScore > 0 && <ScoreDial score={app.matchScore} size={44} strokeWidth={4} animate={false} />}
                  <button onClick={() => setExpanded(isOpen ? null : app._id)} className="text-slate-400 hover:text-slate-ink flex-shrink-0">
                    <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {app.matchedSkills?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-pulse-dark mb-2">✅ Matched Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {app.matchedSkills.map((s) => <span key={s} className="badge bg-pulse/10 text-pulse-dark text-xs">{s}</span>)}
                          </div>
                        </div>
                      )}
                      {app.missingSkills?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-ember mb-2">⚠️ Skill Gaps</p>
                          <div className="flex flex-wrap gap-1.5">
                            {app.missingSkills.map((s) => <span key={s} className="badge bg-ember/10 text-ember text-xs">{s}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                    {app.coverLetter && (
                      <div>
                        <p className="text-xs font-semibold text-slate-soft mb-1">Your Cover Letter</p>
                        <p className="text-sm text-slate-soft bg-slate-50 p-3 rounded-xl leading-relaxed">{app.coverLetter}</p>
                      </div>
                    )}
                    <Link to={`/jobs/${app.job?._id}`} className="inline-block text-sm text-signal hover:underline">View Job Posting →</Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
