import { useState } from 'react';
import { X, Loader2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api.js';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Media', 'Other'];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

const BLANK = { companyName: '', website: '', description: '', industry: '', size: '', location: '' };

/** onCreated(company) is called with the newly created company after a successful submit. */
export default function CreateCompanyModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/admin/companies', form);
      toast.success(`${data.company.companyName} created!`);
      onCreated(data.company);
      setForm(BLANK);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create company');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50">
      <div className="bg-white rounded-2xl shadow-lifted w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-display font-semibold text-slate-ink flex items-center gap-2">
            <Building2 size={18} className="text-signal" /> New Company
          </h2>
          <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-ink" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <p className="text-xs text-slate-soft bg-slate-50 p-3 rounded-lg">
            This creates a company directly — no HR account or approval step needed. Approved automatically.
          </p>
          <div>
            <label className="label">Company Name *</label>
            <input type="text" className="input" placeholder="Acme Corp" value={form.companyName} onChange={update('companyName')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Industry</label>
              <select className="input" value={form.industry} onChange={update('industry')}>
                <option value="">Select</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Size</label>
              <select className="input" value={form.size} onChange={update('size')}>
                <option value="">Select</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <input type="text" className="input" placeholder="City, Country" value={form.location} onChange={update('location')} />
          </div>
          <div>
            <label className="label">Website</label>
            <input type="url" className="input" placeholder="https://acmecorp.com" value={form.website} onChange={update('website')} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input resize-none" placeholder="What does this company do?" value={form.description} onChange={update('description')} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Building2 size={16} />}
              {saving ? 'Creating…' : 'Create Company'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
