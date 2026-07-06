import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Award, ClipboardList } from 'lucide-react';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function Assessments() {
  const [available, setAvailable] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [appsRes, resultsRes] = await Promise.all([
        api.get('/applications/my'),
        api.get('/assessments/my-results'),
      ]);

      const jobIds = [...new Set(appsRes.data.applications.map((a) => a.job?._id).filter(Boolean))];
      const completedAssessmentIds = new Set(resultsRes.data.results.map((r) => r.assessment?._id));

      const assessmentLists = await Promise.all(
        jobIds.map((jobId) =>
          api.get(`/assessments/job/${jobId}`).then((r) => r.data.assessments).catch(() => [])
        )
      );

      const flatAvailable = assessmentLists.flat().filter((a) => !completedAssessmentIds.has(a._id));

      setAvailable(flatAvailable);
      setResults(resultsRes.data.results);
    }
    load().finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullHeight label="Loading assessments…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-ink">Assessments</h1>
        <p className="text-slate-soft text-sm mt-1">Tests from jobs you've applied to</p>
      </div>

      <div className="card">
        <h2 className="font-display font-semibold text-slate-ink mb-4">Available Tests</h2>
        {available.length === 0 ? (
          <p className="text-slate-soft text-sm">No pending assessments right now. They'll appear here once a recruiter assigns one for a job you've applied to.</p>
        ) : (
          <div className="space-y-3">
            {available.map((a) => (
              <div key={a._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-ink">{a.title}</p>
                  <p className="text-xs text-slate-soft flex items-center gap-1 mt-0.5"><Clock size={11} />{a.duration} minutes · {a.questions?.length || 0} questions</p>
                </div>
                <Link to={`/candidate/assessments/take/${a._id}`} className="btn-primary text-sm">Take Test</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="font-display font-semibold text-slate-ink mb-4">Past Results</h2>
        {results.length === 0 ? (
          <EmptyState icon={Award} title="No completed assessments yet" description="Your results will show up here." />
        ) : (
          <div className="space-y-3">
            {results.map((r) => (
              <div key={r._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-ink">{r.assessment?.title}</p>
                  <p className="text-xs text-slate-400 font-mono">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold font-mono ${r.percentage >= 70 ? 'text-pulse-dark' : r.percentage >= 50 ? 'text-ember' : 'text-red-500'}`}>
                    {r.percentage}%
                  </p>
                  <p className="text-xs text-slate-400 font-mono">{r.score}/{r.totalPoints} pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
