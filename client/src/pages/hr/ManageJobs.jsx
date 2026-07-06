import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, ToggleLeft, ToggleRight, MapPin, Users, Calendar, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    api.get('/jobs/my-jobs').then((r) => setJobs(r.data.jobs)).finally(() => setLoading(false));
  }, []);

  const deleteJob = async (id) => {
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j._id !== id));
      toast.success('Job deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setConfirmDelete(null);
    }
  };

  const toggleActive = async (job) => {
    try {
      const r = await api.put(`/jobs/${job._id}`, { isActive: !job.isActive });
      setJobs((prev) => prev.map((j) => (j._id === job._id ? r.data.job : j)));
      toast.success(r.data.job.isActive ? 'Job activated' : 'Job deactivated');
    } catch {
      toast.error('Update failed');
    }
  };

  const filtered = jobs.filter((j) => j.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingSpinner fullHeight label="Loading your jobs…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-ink">Manage Jobs</h1>
          <p className="text-slate-soft text-sm mt-1">{jobs.length} total jobs posted</p>
        </div>
        <Link to="/hr/jobs/create" className="btn-primary"><Plus size={16} /> Post New Job</Link>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" className="input pl-10" placeholder="Search your jobs…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={search ? 'No jobs match your search' : 'No jobs posted yet'}
          action={!search && <Link to="/hr/jobs/create" className="btn-primary"><Plus size={16} /> Post Your First Job</Link>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <div key={job._id} className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-semibold text-slate-ink">{job.title}</h3>
                    <span className={`badge text-xs ${job.isActive ? 'bg-pulse/10 text-pulse-dark' : 'bg-slate-100 text-slate-500'}`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="badge bg-signal/10 text-signal-dark text-xs">{job.jobType}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-soft">
                    {job.location && <span className="flex items-center gap-1"><MapPin size={13} />{job.location}</span>}
                    <span className="flex items-center gap-1 font-mono"><Users size={13} />{job.applicantCount || 0} applicants</span>
                    <span className="flex items-center gap-1 font-mono"><Calendar size={13} />{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.skillsRequired?.slice(0, 4).map((s) => <span key={s} className="badge bg-slate-100 text-slate-600 text-xs">{s}</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(job)} title={job.isActive ? 'Deactivate' : 'Activate'} className={`p-2 rounded-lg transition-colors ${job.isActive ? 'text-pulse-dark bg-pulse/10 hover:bg-pulse/20' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}>
                    {job.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <Link to={`/hr/jobs/${job._id}/applicants`} className="p-2 text-signal bg-signal/10 rounded-lg hover:bg-signal/20 transition-colors" title="View Applicants"><Users size={16} /></Link>
                  <Link to={`/hr/jobs/${job._id}/edit`} className="p-2 text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors" title="Edit"><Edit2 size={16} /></Link>
                  <Link to={`/jobs/${job._id}`} target="_blank" className="p-2 text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors" title="Preview"><Eye size={16} /></Link>
                  <button onClick={() => setConfirmDelete(job._id)} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete this job?"
        message="This will permanently remove the job and all of its applications. This cannot be undone."
        danger
        onConfirm={() => deleteJob(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
