import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Clock, Briefcase, CheckCircle2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { avatarFor } from '../../utils/avatar.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then((r) => setJob(r.data.job)).catch(() => setJob(null)).finally(() => setLoading(false));
    if (user?.role === 'candidate') {
      api.get('/applications/my').then((r) => {
        setApplied(r.data.applications.some((a) => a.job?._id === id));
      }).catch(() => {});
    }
  }, [id, user]);

  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    setApplying(true);
    try {
      await api.post('/applications', { jobId: id, coverLetter });
      setApplied(true);
      setShowForm(false);
      toast.success('Application submitted!');
    } catch (err) {
      const message = err?.userMessage || err?.response?.data?.message || 'We could not submit your application. Please try again in a moment.';
      toast.error(message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner fullHeight label="Loading job…" />;
  if (!job) return <div className="text-center py-20"><p className="text-slate-soft">Job not found.</p></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-3 gap-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-6">
        <div className="card">
          <div className="flex items-start gap-4 flex-wrap">
            <img src={avatarFor(job.company?.logo, job.company?.companyName)} className="w-16 h-16 rounded-2xl object-cover" alt="" />
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-ink">{job.title}</h1>
              <Link to={`/company/${job.company?._id}`} className="text-signal font-medium mt-0.5 hover:underline">
                {job.company?.companyName}
              </Link>
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-soft">
                <span className="flex items-center gap-1"><MapPin size={14} />{job.location || 'Remote'}</span>
                {job.salaryMin > 0 && (
                  <span className="flex items-center gap-1 font-mono"><DollarSign size={14} />{job.salaryMin.toLocaleString()}–{job.salaryMax.toLocaleString()}</span>
                )}
                <span className="flex items-center gap-1 capitalize"><Clock size={14} />{job.jobType}</span>
                {job.experience && <span className="flex items-center gap-1"><Briefcase size={14} />{job.experience}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display font-semibold text-slate-ink mb-3 text-lg">Job Description</h2>
          <p className="text-slate-soft text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card space-y-4">
            <h2 className="font-display font-semibold text-slate-ink">Cover Letter (optional)</h2>
            <textarea
              rows={5}
              className="input resize-none"
              placeholder="Tell the recruiter why you're a great fit…"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={handleApply} disabled={applying} className="btn-primary">
                {applying ? 'Submitting…' : 'Submit Application'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
        <div className="card text-center">
          {applied ? (
            <div className="space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-pulse" />
              <p className="font-display font-semibold text-slate-ink">Application Submitted</p>
              <p className="text-sm text-slate-soft">We'll notify you of any updates.</p>
            </div>
          ) : user?.role === 'candidate' ? (
            <button onClick={() => setShowForm(true)} className="btn-primary w-full">Apply Now</button>
          ) : user?.role === 'hr' ? (
            <p className="text-sm text-slate-soft">Log in as a candidate to apply.</p>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-primary w-full">Login to Apply</button>
          )}
        </div>

        <div className="card">
          <h3 className="font-display font-semibold text-slate-ink mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skillsRequired?.map((s) => (
              <span key={s} className="badge bg-signal/10 text-signal-dark">{s}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-display font-semibold text-slate-ink mb-3">About {job.company?.companyName}</h3>
          <p className="text-sm text-slate-soft line-clamp-4">{job.company?.description || 'No description provided.'}</p>
          {job.company?.website && (
            <a href={job.company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-signal text-sm mt-2 hover:underline">
              <Globe size={13} /> Visit Website
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
}
