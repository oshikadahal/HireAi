import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, ToggleLeft, ToggleRight, Users, Search, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { avatarFor } from '../../utils/avatar.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

export default function AdminManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get('/admin/jobs', { params: { search: debouncedSearch, page, limit: 15 } })
      .then((r) => { setJobs(r.data.jobs); setTotal(r.data.total); setPages(r.data.pages); })
      .finally(() => setLoading(false));
  }, [debouncedSearch, page]);

  const toggleActive = async (job) => {
    try {
      const r = await api.put(`/admin/jobs/${job._id}`, { isActive: !job.isActive });
      setJobs((prev) => prev.map((j) => (j._id === job._id ? r.data.job : j)));
      toast.success(r.data.job.isActive ? 'Job activated' : 'Job deactivated');
    } catch {
      toast.error('Update failed');
    }
  };

  const deleteJob = async (id) => {
    try {
      await api.delete(`/admin/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j._id !== id));
      toast.success('Job deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setConfirmDelete(null);
    }
  };

  if (loading && jobs.length === 0) return <LoadingSpinner fullHeight label="Loading all jobs…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-ink">Manage Jobs</h1>
          <p className="text-slate-soft text-sm mt-1 font-mono">{total} jobs across the platform</p>
        </div>
        <Link to="/admin/jobs/create" className="btn-primary"><Plus size={16} /> Post Job</Link>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" className="input pl-10" placeholder="Search jobs by title…" value={searchInput} onChange={(e) => { setSearchInput(e.target.value); setPage(1); }} />
      </div>

      {jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs found" action={<Link to="/admin/jobs/create" className="btn-primary"><Plus size={16} /> Post the first job</Link>} />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job._id} className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <img src={avatarFor(job.company?.logo, job.company?.companyName)} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" alt="" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-semibold text-slate-ink">{job.title}</h3>
                      <span className={`badge text-xs ${job.isActive ? 'bg-pulse/10 text-pulse-dark' : 'bg-slate-100 text-slate-500'}`}>{job.isActive ? 'Active' : 'Inactive'}</span>
                      {!job.company?.isApproved && <span className="badge text-xs bg-ember/10 text-ember">Company unapproved</span>}
                    </div>
                    <p className="text-sm text-slate-soft mt-0.5">{job.company?.companyName}</p>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Posted by {job.postedBy?.name} ({job.postedBy?.role}) · {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(job)} title={job.isActive ? 'Deactivate' : 'Activate'} className={`p-2 rounded-lg transition-colors ${job.isActive ? 'text-pulse-dark bg-pulse/10 hover:bg-pulse/20' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}>
                    {job.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <Link to={`/admin/jobs/${job._id}/applicants`} className="p-2 text-signal bg-signal/10 rounded-lg hover:bg-signal/20 transition-colors" title="View Applicants"><Users size={16} /></Link>
                  <Link to={`/admin/jobs/${job._id}/edit`} className="p-2 text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors" title="Edit"><Edit2 size={16} /></Link>
                  <Link to={`/jobs/${job._id}`} target="_blank" className="p-2 text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors" title="Preview"><Eye size={16} /></Link>
                  <button onClick={() => setConfirmDelete(job._id)} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete this job?"
        message="This permanently removes the job and all of its applications."
        danger
        onConfirm={() => deleteJob(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
