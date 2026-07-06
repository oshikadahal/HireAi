import { useEffect, useState } from 'react';
import { Calendar, Clock, Video, Brain, Plus, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { avatarFor } from '../../utils/avatar.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function HRInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ applicationId: '', date: '', duration: 60, meetingLink: '', type: 'video' });

  useEffect(() => {
    Promise.all([api.get('/interviews/hr'), api.get('/interviews/schedulable-pool')])
      .then(([ivRes, poolRes]) => { setInterviews(ivRes.data.interviews); setPool(poolRes.data.pool); })
      .finally(() => setLoading(false));
  }, []);

  const schedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await api.post('/interviews', form);
      setInterviews((prev) => [r.data.interview, ...prev]);
      setShowModal(false);
      toast.success('Interview scheduled — AI questions generated!');
      setForm({ applicationId: '', date: '', duration: 60, meetingLink: '', type: 'video' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Scheduling failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullHeight label="Loading interviews…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-ink">Interviews</h1>
          <p className="text-slate-soft text-sm mt-1">{interviews.length} scheduled</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> Schedule Interview</button>
      </div>

      {interviews.length === 0 ? (
        <EmptyState icon={Calendar} title="No interviews scheduled yet" />
      ) : (
        <div className="space-y-3">
          {interviews.map((iv) => (
            <div key={iv._id} className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <img src={avatarFor(iv.candidate?.avatar, iv.candidate?.name)} className="w-9 h-9 rounded-full" alt="" />
                    <div>
                      <p className="font-semibold text-slate-ink">{iv.candidate?.name}</p>
                      <p className="text-xs text-slate-400">{iv.job?.title}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-soft">
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-signal" />{new Date(iv.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5 font-mono"><Clock size={14} className="text-signal" />{new Date(iv.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · {iv.duration}min</span>
                    <span className="flex items-center gap-1.5 capitalize"><Video size={14} className="text-signal" />{iv.type}</span>
                  </div>
                </div>
                <span className={`badge text-xs ${iv.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : iv.status === 'completed' ? 'bg-pulse/10 text-pulse-dark' : 'bg-red-100 text-red-600'}`}>{iv.status}</span>
              </div>

              {iv.aiQuestions?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-signal mb-2 flex items-center gap-1"><Brain size={13} /> AI-Generated Interview Questions</p>
                  <ul className="space-y-1.5">
                    {iv.aiQuestions.slice(0, 5).map((q, i) => (
                      <li key={i} className="text-sm text-slate-soft flex gap-2"><span className="text-signal-light text-xs font-medium mt-0.5">{i + 1}.</span>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50">
          <div className="bg-white rounded-2xl shadow-lifted w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-display font-semibold text-slate-ink">Schedule Interview</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400 hover:text-slate-ink" /></button>
            </div>
            <form onSubmit={schedule} className="p-6 space-y-4">
              <div>
                <label className="label">Select Candidate & Job *</label>
                <select className="input" required value={form.applicationId} onChange={(e) => setForm((f) => ({ ...f, applicationId: e.target.value }))}>
                  <option value="">-- Pick a shortlisted application --</option>
                  {pool.map((p) => <option key={p._id} value={p._id}>{p.candidate?.name} – {p.jobTitle} ({p.matchScore}% match)</option>)}
                </select>
                {pool.length === 0 && <p className="text-xs text-ember mt-1">Shortlist some candidates first before scheduling.</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date & Time *</label>
                  <input type="datetime-local" className="input" required min={new Date().toISOString().slice(0, 16)} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Duration (minutes)</label>
                  <select className="input" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))}>
                    {[30, 45, 60, 90, 120].map((d) => <option key={d} value={d}>{d} minutes</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Interview Type</label>
                  <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in-person">In Person</option>
                  </select>
                </div>
                <div>
                  <label className="label">Meeting Link</label>
                  <input type="url" className="input" placeholder="https://meet.google.com/…" value={form.meetingLink} onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting || !form.applicationId} className="btn-primary flex-1">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                  {submitting ? 'Scheduling…' : 'Schedule + Generate AI Questions'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
