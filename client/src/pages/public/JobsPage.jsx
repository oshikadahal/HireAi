import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, X } from 'lucide-react';
import api from '../../services/api.js';
import { avatarFor } from '../../utils/avatar.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import Pagination from '../../components/Pagination.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'remote', 'internship'];
const CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations', 'Other'];

export default function JobsPage() {
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 450);

  const [filters, setFilters] = useState({ location: '', jobType: '', category: '' });
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/jobs', { params: { ...filters, search: debouncedSearch, page, limit: 12 } })
      .then((r) => {
        setJobs(r.data.jobs);
        setTotal(r.data.total);
        setPages(r.data.pages);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, filters, page]);

  const clearFilter = (key) => setFilters((f) => ({ ...f, [key]: '' }));
  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search job title, skill, keyword…"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
          />
        </div>
        <div className="relative md:w-44">
          <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input pl-9"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => { setFilters((f) => ({ ...f, location: e.target.value })); setPage(1); }}
          />
        </div>
        <select
          className="input md:w-40"
          value={filters.jobType}
          onChange={(e) => { setFilters((f) => ({ ...f, jobType: e.target.value })); setPage(1); }}
        >
          <option value="">All Types</option>
          {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="input md:w-44"
          value={filters.category}
          onChange={(e) => { setFilters((f) => ({ ...f, category: e.target.value })); setPage(1); }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map(([k, v]) => (
            <span key={k} className="badge bg-signal text-white gap-1.5 pr-1.5">
              {v}
              <button onClick={() => clearFilter(k)}><X size={12} /></button>
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-slate-soft mb-4 font-mono">{total} job{total !== 1 ? 's' : ''} found</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-44 skeleton" />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs found" description="Try adjusting your filters or search terms." />
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {jobs.map((job) => (
            <motion.div key={job._id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
              <Link
                to={`/jobs/${job._id}`}
                className="card h-full flex flex-col hover:shadow-lifted hover:border-signal/20 border border-transparent transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <img src={avatarFor(job.company?.logo, job.company?.companyName)} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" alt="" />
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-slate-ink group-hover:text-signal transition-colors truncate">{job.title}</h3>
                    <p className="text-sm text-slate-soft truncate">{job.company?.companyName}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {job.skillsRequired?.slice(0, 3).map((s) => (
                    <span key={s} className="badge bg-slate-100 text-slate-600 text-xs">{s}</span>
                  ))}
                  {job.skillsRequired?.length > 3 && (
                    <span className="badge bg-slate-100 text-slate-400 text-xs">+{job.skillsRequired.length - 3}</span>
                  )}
                </div>
                <div className="mt-auto flex items-center justify-between text-xs text-slate-400 pt-2">
                  <span className="flex items-center gap-1"><MapPin size={11} />{job.location || 'Remote'}</span>
                  {job.salaryMin > 0 && (
                    <span className="font-mono">${Math.round(job.salaryMin / 1000)}k–${Math.round(job.salaryMax / 1000)}k</span>
                  )}
                  <span className="badge bg-signal/10 text-signal-dark">{job.jobType}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />
    </div>
  );
}
