import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, ExternalLink, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { avatarFor } from '../../utils/avatar.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import CreateCompanyModal from '../../components/CreateCompanyModal.jsx';

export default function CompanyApproval() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/companies').then((r) => setCompanies(r.data.companies)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleApproval = async (id) => {
    try {
      const r = await api.put(`/admin/companies/${id}/toggle-approval`);
      setCompanies((prev) => prev.map((c) => (c._id === id ? r.data.company : c)));
      toast.success(r.data.message);
    } catch {
      toast.error('Action failed');
    }
  };

  const pendingCount = companies.filter((c) => !c.isApproved).length;
  const filtered = filter === 'pending' ? companies.filter((c) => !c.isApproved) : companies;

  if (loading) return <LoadingSpinner fullHeight label="Loading companies…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-ink">Manage Companies</h1>
          <p className="text-slate-soft text-sm mt-1 font-mono">{companies.length} total · {pendingCount} pending</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> New Company</button>
      </div>

      <div className="flex gap-2">
        {[{ key: 'all', label: `All (${companies.length})` }, { key: 'pending', label: `Pending (${pendingCount})` }].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === key ? 'bg-signal text-white' : 'bg-white border border-slate-200 text-slate-soft hover:bg-slate-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CheckCircle2} title={filter === 'pending' ? 'No pending approvals' : 'No companies yet'} action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> Create one</button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c._id} className="card flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 min-w-0">
                <img src={avatarFor(c.logo, c.companyName)} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt="" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-ink">{c.companyName}</p>
                    {c.createdByAdmin && <span className="badge bg-slate-100 text-slate-500 text-xs">House listing</span>}
                  </div>
                  <p className="text-sm text-slate-400">{c.user?.email || 'No linked HR account'}</p>
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noreferrer" className="text-xs text-signal flex items-center gap-1 hover:underline">
                      <ExternalLink size={10} /> {c.website}
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleApproval(c._id)}
                className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl transition-colors flex-shrink-0 ${
                  c.isApproved ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-pulse/10 text-pulse-dark hover:bg-pulse/20'
                }`}
              >
                {c.isApproved ? <><XCircle size={15} /> Revoke Approval</> : <><CheckCircle2 size={15} /> Approve</>}
              </button>
            </div>
          ))}
        </div>
      )}

      <CreateCompanyModal open={showModal} onClose={() => setShowModal(false)} onCreated={(company) => setCompanies((prev) => [company, ...prev])} />
    </div>
  );
}
