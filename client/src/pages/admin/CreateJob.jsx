import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { avatarFor } from '../../utils/avatar.js';
import JobForm from '../../components/JobForm.jsx';
import CreateCompanyModal from '../../components/CreateCompanyModal.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const BLANK_FORM = {
  companyId: '',
  title: '',
  description: '',
  skillsRequired: [],
  salaryMin: '',
  salaryMax: '',
  experience: '',
  location: '',
  jobType: 'full-time',
  category: 'Engineering',
  deadline: '',
};

export default function AdminCreateJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState(BLANK_FORM);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/admin/companies').then((r) => setCompanies(r.data.companies)).finally(() => setLoadingCompanies(false));
  }, []);

  const handleCompanyCreated = (company) => {
    setCompanies((prev) => [company, ...prev]);
    setForm((f) => ({ ...f, companyId: company._id }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyId) { toast.error('Select or create a company first'); return; }
    if (form.skillsRequired.length === 0) { toast.error('Add at least one required skill'); return; }
    setLoading(true);
    try {
      await api.post('/admin/jobs', { ...form, salaryMin: Number(form.salaryMin) || 0, salaryMax: Number(form.salaryMax) || 0 });
      toast.success('Job posted successfully!');
      navigate('/admin/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCompanies) return <LoadingSpinner fullHeight label="Loading companies…" />;

  const companySection = (
    <div className="card space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="font-display font-semibold text-slate-ink">Company</h2>
        <button type="button" onClick={() => setShowCompanyModal(true)} className="btn-ghost text-sm">
          <Plus size={15} /> New Company
        </button>
      </div>
      {companies.length === 0 ? (
        <p className="text-sm text-slate-soft">No companies yet — create one to attach this job to.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2">
          {companies.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => setForm((f) => ({ ...f, companyId: c._id }))}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                form.companyId === c._id ? 'border-signal bg-signal/5' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <img src={avatarFor(c.logo, c.companyName)} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-ink truncate">{c.companyName}</p>
                {!c.isApproved && <p className="text-xs text-ember">Not yet approved (ok for admin posting)</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-signal/10 rounded-xl flex items-center justify-center"><Building2 size={20} className="text-signal" /></div>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-ink">Post a Job (Admin)</h1>
          <p className="text-slate-soft text-sm mt-1">Post on behalf of any company — no approval gate</p>
        </div>
      </div>
      <JobForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={loading}
        submitLabel="Post Job"
        onCancel={() => navigate('/admin/jobs')}
        companySection={companySection}
      />
      <CreateCompanyModal open={showCompanyModal} onClose={() => setShowCompanyModal(false)} onCreated={handleCompanyCreated} />
    </div>
  );
}
