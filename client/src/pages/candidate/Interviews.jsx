import { useEffect, useState } from 'react';
import { Calendar, Clock, Video, Phone, MapPin, ExternalLink, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const STATUS_META = {
  scheduled: { icon: Clock, color: 'text-blue-600 bg-blue-50', label: 'Scheduled' },
  completed: { icon: CheckCircle2, color: 'text-pulse-dark bg-pulse/10', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Cancelled' },
  'no-show': { icon: AlertCircle, color: 'text-ember bg-ember/10', label: 'No Show' },
};
const TYPE_ICONS = { video: Video, phone: Phone, 'in-person': MapPin };

export default function CandidateInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    api.get('/interviews/candidate').then((r) => setInterviews(r.data.interviews)).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = interviews.filter((i) => new Date(i.date) >= now && i.status === 'scheduled');
  const past = interviews.filter((i) => new Date(i.date) < now || i.status !== 'scheduled');
  const displayed = tab === 'upcoming' ? upcoming : past;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <LoadingSpinner fullHeight label="Loading interviews…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-ink">My Interviews</h1>
        <p className="text-slate-soft text-sm mt-1">{upcoming.length} upcoming · {past.length} past</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {[{ key: 'upcoming', label: `Upcoming (${upcoming.length})` }, { key: 'past', label: `Past (${past.length})` }].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === key ? 'border-signal text-signal' : 'border-transparent text-slate-soft hover:text-slate-ink'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <EmptyState icon={Calendar} title={tab === 'upcoming' ? 'No upcoming interviews' : 'No past interviews'} />
      ) : (
        <div className="space-y-4">
          {displayed.map((interview) => {
            const StatusIcon = STATUS_META[interview.status]?.icon || Clock;
            const TypeIcon = TYPE_ICONS[interview.type] || Video;
            const isUpcoming = new Date(interview.date) >= now;
            return (
              <div key={interview._id} className={`card border-l-4 ${isUpcoming ? 'border-l-signal' : 'border-l-slate-200'}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-semibold text-slate-ink">{interview.job?.title}</h3>
                      <span className={`badge ${STATUS_META[interview.status]?.color}`}>
                        <StatusIcon size={11} className="mr-1" />{STATUS_META[interview.status]?.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-soft">with {interview.recruiter?.name}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="text-signal" />{formatDate(interview.date)}</span>
                      <span className="flex items-center gap-1.5 font-mono"><Clock size={14} className="text-signal" />{formatTime(interview.date)} · {interview.duration}min</span>
                      <span className="flex items-center gap-1.5 capitalize"><TypeIcon size={14} className="text-signal" />{interview.type}</span>
                    </div>
                  </div>
                  {interview.meetingLink && isUpcoming && (
                    <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="btn-primary text-sm flex-shrink-0">
                      <Video size={15} /> Join <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                {interview.aiQuestions?.length > 0 && isUpcoming && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-signal mb-2">🤖 Prepare for these AI-suggested questions:</p>
                    <ul className="space-y-1">
                      {interview.aiQuestions.slice(0, 4).map((q, i) => (
                        <li key={i} className="text-sm text-slate-soft flex gap-2">
                          <span className="text-signal-light font-medium">{i + 1}.</span>{q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {interview.feedback && !isUpcoming && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-soft mb-1">Interviewer Feedback</p>
                    <p className="text-sm text-slate-soft bg-slate-50 p-3 rounded-xl">{interview.feedback}</p>
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
