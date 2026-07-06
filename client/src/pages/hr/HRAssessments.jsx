import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, CheckCircle2, ClipboardList, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { avatarFor } from '../../utils/avatar.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const BLANK_QUESTION = { type: 'mcq', question: '', options: ['', '', '', ''], correctAnswer: '', points: 10 };
const BLANK_FORM = { title: '', description: '', jobId: '', duration: 30, questions: [{ ...BLANK_QUESTION, options: ['', '', '', ''] }] };

export default function HRAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [viewingResults, setViewingResults] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/assessments/my-created'), api.get('/jobs/my-jobs')])
      .then(([aRes, jRes]) => { setAssessments(aRes.data.assessments); setJobs(jRes.data.jobs); })
      .finally(() => setLoading(false));
  }, []);

  const addQuestion = () => setForm((f) => ({ ...f, questions: [...f.questions, { ...BLANK_QUESTION, options: ['', '', '', ''] }] }));
  const removeQuestion = (i) => setForm((f) => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));
  const updateQuestion = (i, key, value) => setForm((f) => ({ ...f, questions: f.questions.map((q, idx) => (idx === i ? { ...q, [key]: value } : q)) }));
  const updateOption = (qi, oi, value) =>
    setForm((f) => ({ ...f, questions: f.questions.map((q, idx) => (idx === qi ? { ...q, options: q.options.map((o, oidx) => (oidx === oi ? value : o)) } : q)) }));

  const submit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const r = await api.post('/assessments', form);
      setAssessments((prev) => [r.data.assessment, ...prev]);
      toast.success('Assessment created!');
      setForm(BLANK_FORM);
      setShowCreate(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assessment');
    } finally {
      setCreating(false);
    }
  };

  const viewResults = async (assessmentId) => {
    setViewingResults(assessmentId);
    try {
      const r = await api.get(`/assessments/${assessmentId}/results`);
      setResults(r.data.results);
    } catch {
      toast.error('Could not load results');
    }
  };

  if (loading) return <LoadingSpinner fullHeight label="Loading assessments…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-ink">Assessments</h1>
          <p className="text-slate-soft text-sm mt-1">{assessments.length} tests created</p>
        </div>
        <button onClick={() => setShowCreate((s) => !s)} className="btn-primary">
          {showCreate ? <X size={16} /> : <Plus size={16} />} {showCreate ? 'Close' : 'Create Test'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={submit} className="space-y-6">
          <div className="card space-y-4">
            <h2 className="font-display font-semibold text-slate-ink border-b border-slate-100 pb-3">Test Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Title *</label>
                <input type="text" className="input" placeholder="e.g. React Developer Test" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Link to Job</label>
                <select className="input" value={form.jobId} onChange={(e) => setForm((f) => ({ ...f, jobId: e.target.value }))}>
                  <option value="">-- Not linked --</option>
                  {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Duration (minutes) *</label>
                <input type="number" className="input" min="5" max="240" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))} required />
              </div>
              <div className="md:col-span-2">
                <label className="label">Description</label>
                <textarea rows={2} className="input resize-none" placeholder="Instructions for candidates…" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-slate-ink">Questions ({form.questions.length})</h2>
              <span className="text-sm text-slate-soft font-mono">Total: {form.questions.reduce((a, q) => a + Number(q.points || 0), 0)} pts</span>
            </div>
            {form.questions.map((q, qi) => (
              <div key={qi} className="card border border-slate-200 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-ink">Question {qi + 1}</span>
                  <div className="flex items-center gap-2">
                    <select value={q.type} onChange={(e) => updateQuestion(qi, 'type', e.target.value)} className="input text-sm py-1.5 w-28">
                      <option value="mcq">MCQ</option>
                      <option value="coding">Coding</option>
                      <option value="aptitude">Aptitude</option>
                    </select>
                    <input type="number" className="input w-20 text-sm py-1.5" min="1" max="100" value={q.points} onChange={(e) => updateQuestion(qi, 'points', Number(e.target.value))} />
                    {form.questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(qi)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                    )}
                  </div>
                </div>
                <textarea rows={2} className="input resize-none" placeholder="Enter your question…" value={q.question} onChange={(e) => updateQuestion(qi, 'question', e.target.value)} required />
                {q.type === 'mcq' && (
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === opt && opt !== ''} onChange={() => updateQuestion(qi, 'correctAnswer', opt)} className="accent-signal flex-shrink-0" />
                        <input type="text" className="input flex-1" placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} />
                      </div>
                    ))}
                    <p className="text-xs text-slate-400">Select the radio next to the correct answer</p>
                  </div>
                )}
                {q.type !== 'mcq' && (
                  <textarea rows={2} className="input resize-none font-mono text-sm" placeholder="Expected answer / grading notes (reviewed manually)" value={q.correctAnswer} onChange={(e) => updateQuestion(qi, 'correctAnswer', e.target.value)} />
                )}
              </div>
            ))}
            <button type="button" onClick={addQuestion} className="btn-secondary w-full"><Plus size={16} /> Add Question</button>
          </div>

          <button type="submit" disabled={creating} className="btn-primary">
            {creating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {creating ? 'Creating…' : 'Create Assessment'}
          </button>
        </form>
      )}

      {assessments.length === 0 && !showCreate ? (
        <EmptyState icon={ClipboardList} title="No assessments created yet" action={<button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> Create Your First Test</button>} />
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => (
            <div key={a._id} className="card">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-medium text-slate-ink">{a.title}</p>
                  <p className="text-xs text-slate-soft">{a.job?.title || 'Not linked to a job'} · {a.duration} min · {a.questions?.length} questions</p>
                </div>
                <button onClick={() => viewResults(a._id)} className="btn-secondary text-sm"><Users size={14} /> View Results</button>
              </div>

              {viewingResults === a._id && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {results.length === 0 ? (
                    <p className="text-sm text-slate-soft">No submissions yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {results.map((r) => (
                        <div key={r._id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <img src={avatarFor(r.candidate?.avatar, r.candidate?.name)} className="w-7 h-7 rounded-full" alt="" />
                            <span className="text-sm text-slate-ink">{r.candidate?.name}</span>
                          </div>
                          <span className="text-sm font-mono font-semibold text-signal">{r.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
