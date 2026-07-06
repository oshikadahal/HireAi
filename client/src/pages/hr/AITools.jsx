import { useState } from 'react';
import { Brain, Copy, CheckCheck, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import SkillTagInput from '../../components/SkillTagInput.jsx';

export default function AITools() {
  const [jobTitle, setJobTitle] = useState('');
  const [skills, setSkills] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const generate = async () => {
    if (!jobTitle.trim()) { toast.error('Enter a job title'); return; }
    setLoading(true);
    try {
      const r = await api.post('/ai/generate-questions', { jobTitle, skills });
      setQuestions(r.data.questions);
      toast.success(`${r.data.questions.length} questions generated!`);
    } catch {
      toast.error('Generation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyQuestion = (q, i) => {
    navigator.clipboard.writeText(q);
    setCopied(i);
    setTimeout(() => setCopied(null), 1800);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(questions.join('\n\n'));
    toast.success('All questions copied!');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-signal/10 rounded-xl flex items-center justify-center"><Brain size={20} className="text-signal" /></div>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-ink">AI Interview Generator</h1>
          <p className="text-slate-soft text-sm">Tailored questions in seconds — no API key required</p>
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label">Job Title *</label>
          <input type="text" className="input" placeholder="e.g. Senior React Developer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Key Skills (optional — improves results)</label>
          <SkillTagInput value={skills} onChange={setSkills} placeholder="e.g. React, AWS, Leadership" />
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary w-full">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <><Sparkles size={16} /> Generate Questions</>}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-slate-ink">Generated Questions ({questions.length})</h2>
            <button onClick={copyAll} className="text-sm text-signal flex items-center gap-1 hover:underline"><Copy size={14} /> Copy All</button>
          </div>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl group hover:bg-signal/5 transition-colors">
                <span className="text-xs font-bold text-signal-light mt-0.5 flex-shrink-0 w-5">{i + 1}.</span>
                <p className="text-sm text-slate-ink flex-1">{q}</p>
                <button onClick={() => copyQuestion(q, i)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-signal transition-all flex-shrink-0">
                  {copied === i ? <CheckCheck size={15} className="text-pulse-dark" /> : <Copy size={15} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
