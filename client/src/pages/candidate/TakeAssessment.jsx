import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function TakeAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(Date.now());
  const submittedRef = useRef(false);

  useEffect(() => {
    api
      .get(`/assessments/${id}/take`)
      .then((r) => {
        setAssessment(r.data.assessment);
        setTimeLeft(r.data.assessment.duration * 60);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Could not load assessment');
        navigate('/candidate/assessments');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!assessment || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          if (!submittedRef.current) submit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment]);

  const submit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const answersArr = assessment.questions.map((q) => ({ questionId: q._id, answer: answers[q._id] || '' }));
      const timeTakenMinutes = Math.round((Date.now() - startedAt.current) / 60000);
      const r = await api.post(`/assessments/${id}/submit`, { answers: answersArr, timeTakenMinutes });
      toast.success(`Submitted! Score: ${r.data.result.percentage}%`);
      navigate('/candidate/assessments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) return <LoadingSpinner fullHeight label="Loading assessment…" />;
  if (!assessment) return null;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="card flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-display font-semibold text-slate-ink">{assessment.title}</h1>
          <p className="text-xs text-slate-soft">{assessment.questions.length} questions</p>
        </div>
        <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-600' : 'text-slate-ink'}`}>
          <Clock size={18} /> {formatTime(timeLeft)}
        </div>
      </div>

      {assessment.questions.map((q, i) => (
        <div key={q._id} className="card space-y-3">
          <p className="font-medium text-slate-ink">{i + 1}. {q.question}</p>
          {q.type === 'mcq' ? (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    answers[q._id] === opt ? 'border-signal bg-signal/5' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={q._id}
                    value={opt}
                    checked={answers[q._id] === opt}
                    onChange={() => setAnswers((a) => ({ ...a, [q._id]: opt }))}
                    className="accent-signal"
                  />
                  <span className="text-sm text-slate-ink">{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              rows={4}
              className="input resize-none font-mono text-sm"
              placeholder="Write your answer here…"
              value={answers[q._id] || ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q._id]: e.target.value }))}
            />
          )}
        </div>
      ))}

      <button onClick={submit} disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Submitting…' : 'Submit Assessment'}
      </button>
    </div>
  );
}
