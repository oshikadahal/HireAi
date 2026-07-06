import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Globe, MapPin, Users, Briefcase } from 'lucide-react';
import api from '../../services/api.js';
import { avatarFor } from '../../utils/avatar.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function CompanyPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/companies/${id}/public`)
      .then((r) => { setCompany(r.data.company); setJobs(r.data.jobs); })
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullHeight label="Loading company…" />;
  if (!company) return <div className="text-center py-20"><p className="text-slate-soft">Company not found.</p></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="card mb-6">
        <div className="flex items-start gap-6 flex-wrap">
          <img src={avatarFor(company.logo, company.companyName)} className="w-20 h-20 rounded-2xl object-cover" alt="" />
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-slate-ink">{company.companyName}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-soft">
              {company.location && <span className="flex items-center gap-1.5"><MapPin size={14} />{company.location}</span>}
              {company.size && <span className="flex items-center gap-1.5"><Users size={14} />{company.size} employees</span>}
              {company.industry && <span className="flex items-center gap-1.5"><Briefcase size={14} />{company.industry}</span>}
            </div>
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm text-signal hover:underline">
                <Globe size={13} /> {company.website}
              </a>
            )}
            {company.description && <p className="mt-3 text-slate-soft text-sm leading-relaxed">{company.description}</p>}
          </div>
        </div>
      </div>

      <h2 className="text-lg font-display font-semibold text-slate-ink mb-4">Open Positions ({jobs.length})</h2>
      {jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No open positions right now" description="Check back later for new openings." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <Link key={job._id} to={`/jobs/${job._id}`} className="card hover:shadow-lifted hover:border-signal/20 border border-transparent transition-all">
              <h3 className="font-display font-semibold text-slate-ink">{job.title}</h3>
              <div className="flex gap-3 mt-1 text-xs text-slate-400">
                <span>{job.location}</span><span>·</span><span className="capitalize">{job.jobType}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {job.skillsRequired?.slice(0, 3).map((s) => (
                  <span key={s} className="badge bg-slate-100 text-slate-600 text-xs">{s}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
