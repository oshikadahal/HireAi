import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, CheckCircle2, Building2, Globe, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { avatarFor } from '../../utils/avatar.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Media', 'Other'];

export default function CompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/companies/profile').then((r) => setProfile(r.data.company)).finally(() => setLoading(false));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    onDrop: async (files) => {
      if (!files[0]) return;
      setUploading(true);
      const fd = new FormData();
      fd.append('logo', files[0]);
      try {
        const r = await api.put('/companies/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setProfile(r.data.company);
        toast.success('Logo updated!');
      } catch {
        toast.error('Logo upload failed');
      } finally {
        setUploading(false);
      }
    },
  });

  const save = async () => {
    setSaving(true);
    try {
      const r = await api.put('/companies/profile', {
        companyName: profile.companyName,
        website: profile.website,
        description: profile.description,
        industry: profile.industry,
        size: profile.size,
        location: profile.location,
      });
      setProfile(r.data.company);
      toast.success('Profile saved!');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const update = (field) => (e) => setProfile((p) => ({ ...p, [field]: e.target.value }));

  if (loading || !profile) return <LoadingSpinner fullHeight label="Loading company profile…" />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold text-slate-ink">Company Profile</h1>
        <div className="flex items-center gap-3">
          <span className={`badge ${profile.isApproved ? 'bg-pulse/10 text-pulse-dark' : 'bg-ember/10 text-ember'}`}>
            {profile.isApproved ? '✅ Approved' : '⏳ Pending Approval'}
          </span>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="font-display font-semibold text-slate-ink mb-4 border-b border-slate-100 pb-3">Company Logo</h2>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center flex-shrink-0">
            <img src={avatarFor(profile.logo, profile.companyName)} className="w-full h-full object-cover" alt="" />
          </div>
          <div {...getRootProps()} className={`flex-1 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-signal bg-signal/5' : 'border-slate-200 hover:border-signal/50'}`}>
            <input {...getInputProps()} />
            {uploading ? <Loader2 size={22} className="animate-spin mx-auto text-signal" /> : (
              <div>
                <Upload size={22} className="mx-auto text-slate-400 mb-1" />
                <p className="text-sm text-slate-soft">Drop logo image here or click to browse</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-display font-semibold text-slate-ink border-b border-slate-100 pb-3">Company Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Company Name *</label>
            <div className="relative"><Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" className="input pl-9" value={profile.companyName || ''} onChange={update('companyName')} /></div>
          </div>
          <div>
            <label className="label">Website</label>
            <div className="relative"><Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="url" className="input pl-9" placeholder="https://yourcompany.com" value={profile.website || ''} onChange={update('website')} /></div>
          </div>
          <div>
            <label className="label">Industry</label>
            <select className="input" value={profile.industry || ''} onChange={update('industry')}>
              <option value="">Select Industry</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Company Size</label>
            <select className="input" value={profile.size || ''} onChange={update('size')}>
              <option value="">Select Size</option>
              {SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Location</label>
            <div className="relative"><MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" className="input pl-9" placeholder="City, Country" value={profile.location || ''} onChange={update('location')} /></div>
          </div>
        </div>
        <div>
          <label className="label">Company Description</label>
          <textarea rows={5} className="input resize-none" placeholder="Tell candidates about your company…" value={profile.description || ''} onChange={update('description')} />
        </div>
      </div>
    </div>
  );
}
