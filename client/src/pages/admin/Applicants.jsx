import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { avatarFor } from '../../utils/avatar.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ScoreDial from '../../components/ScoreDial.jsx';

const STATUSES = ['applied', 'screening', 'shortlisted', 'interview', 'selected', 'hired', 'rejected'];
const STATUS_COLORS = {
  applied: 'bg-blue-100 text-blue-700',
  screening: 'bg-amber-100 text-amber-700',
  shortlisted: 'bg-signal/10 text-signal-dark',
  interview: 'bg-purple-100 text-purple-700',
  selected: 'bg-pulse/10 text-pulse-dark',
  hired: 'bg-pulse/10 text-pulse-dark',
  rejected: 'bg-red-100 text-red-600',
};

export default function AdminApplicants() {
  const { id } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api
      .get(`/admin/jobs/${id}/applicants`)
      .then((r) => { setApplicants(r.data.applications); setJob(r.data.job); })
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (appId, status) => {
    try {
      const r = await api.put(`/admin/applications/${appId}/status`, { status });
      setApplicants((prev) => prev.map((a) => (a._id === appId ? r.data.application : a)));
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error('Update failed');
    }
  };

  if (loading) return <LoadingSpinner fullHeight label="Loading applicants…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-ink">{job?.title}</h1>
        <p className="text-slate-soft text-sm mt-1">{job?.company?.companyName} · {applicants.length} applicants</p>
      </div>

      {applicants.length === 0 ? (
        <EmptyState icon={Users} title="No applicants yet" />
      ) : (
        <div className="space-y-3">
          {applicants.map((app) => {
            const isOpen = expanded === app._id;
            return (
              <div key={app._id} className="card">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <img src={avatarFor(app.candidate?.avatar, app.candidate?.name)} className="w-11 h-11 rounded-full" alt="" />
                    <div>
                      <p className="font-medium text-slate-ink">{app.candidate?.name}</p>
                      <p className="text-sm text-slate-400">{app.candidate?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ScoreDial score={app.matchScore} size={48} strokeWidth={4.5} animate={false} />
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app._id, e.target.value)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer ${STATUS_COLORS[app.status]}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setExpanded(isOpen ? null : app._id)} className="text-slate-400 hover:text-slate-ink">
                      <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-100 grid md:grid-cols-2 gap-4">
                    {app.matchedSkills?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-pulse-dark mb-2">Matched Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {app.matchedSkills.map((s) => <span key={s} className="badge bg-pulse/10 text-pulse-dark">{s}</span>)}
                        </div>
                      </div>
                    )}
                    {app.missingSkills?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-ember mb-2">Skill Gaps</p>
                        <div className="flex flex-wrap gap-1.5">
                          {app.missingSkills.map((s) => <span key={s} className="badge bg-ember/10 text-ember">{s}</span>)}
                        </div>
                      </div>
                    )}
                    {app.coverLetter && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-medium text-slate-soft mb-1">Cover Letter</p>
                        <p className="text-sm text-slate-soft bg-slate-50 p-3 rounded-xl">{app.coverLetter}</p>
                      </div>
                    )}
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
