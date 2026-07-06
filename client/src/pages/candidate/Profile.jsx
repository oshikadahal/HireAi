import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, CheckCircle2, Sparkles, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { avatarFor, fileUrl } from '../../utils/avatar.js';
import { fetchMe } from '../../redux/slices/authSlice.js';
import SkillTagInput from '../../components/SkillTagInput.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function CandidateProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [parsedPreview, setParsedPreview] = useState(null);

  useEffect(() => {
    api.get('/candidates/profile').then((r) => setProfile(r.data.profile)).finally(() => setLoading(false));
  }, []);

  const { getRootProps: getResumeProps, getInputProps: getResumeInputProps, isDragActive: resumeDrag } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: async (files) => {
      if (!files[0]) return;
      setResumeUploading(true);
      const fd = new FormData();
      fd.append('resume', files[0]);
      try {
        const r = await api.post('/candidates/upload-resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setProfile(r.data.profile);
        setParsedPreview(r.data.parsed);
        toast.success(`Resume parsed — found ${r.data.parsed.skills.length} skills!`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Upload failed');
      } finally {
        setResumeUploading(false);
      }
    },
  });

  const { getRootProps: getAvatarProps, getInputProps: getAvatarInputProps } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    onDrop: async (files) => {
      if (!files[0]) return;
      setAvatarUploading(true);
      const fd = new FormData();
      fd.append('avatar', files[0]);
      try {
        await api.post('/auth/upload-avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        await dispatch(fetchMe());
        toast.success('Avatar updated!');
      } catch {
        toast.error('Avatar upload failed');
      } finally {
        setAvatarUploading(false);
      }
    },
  });

  const save = async () => {
    setSaving(true);
    try {
      const r = await api.put('/candidates/profile', {
        headline: profile.headline,
        bio: profile.bio,
        skills: profile.skills,
        education: profile.education,
        experience: profile.experience,
        github: profile.github,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
        location: profile.location,
      });
      setProfile(r.data.profile);
      toast.success('Profile saved!');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => setProfile((p) => ({ ...p, [field]: value }));

  const addEducation = () =>
    setProfile((p) => ({ ...p, education: [...(p.education || []), { institution: '', degree: '', field: '', startYear: '', endYear: '' }] }));
  const updateEducation = (i, key, value) =>
    setProfile((p) => ({ ...p, education: p.education.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)) }));
  const removeEducation = (i) => setProfile((p) => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }));

  const addExperience = () =>
    setProfile((p) => ({ ...p, experience: [...(p.experience || []), { company: '', position: '', description: '', current: false }] }));
  const updateExperience = (i, key, value) =>
    setProfile((p) => ({ ...p, experience: p.experience.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)) }));
  const removeExperience = (i) => setProfile((p) => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));

  if (loading || !profile) return <LoadingSpinner fullHeight label="Loading profile…" />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold text-slate-ink">My Profile</h1>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Avatar */}
      <div className="card flex items-center gap-6">
        <div className="relative">
          <img src={avatarFor(user?.avatar, user?.name)} className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100" alt="" />
          {avatarUploading && (
            <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
              <Loader2 size={18} className="animate-spin text-signal" />
            </div>
          )}
        </div>
        <div {...getAvatarProps()} className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-signal/50 transition-colors">
          <input {...getAvatarInputProps()} />
          <Upload size={17} className="mx-auto text-slate-400 mb-1" />
          <p className="text-sm text-slate-soft">Upload profile photo</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card space-y-4">
        <h2 className="font-display font-semibold text-slate-ink border-b border-slate-100 pb-3">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Headline</label>
            <input type="text" className="input" placeholder="e.g. Frontend Developer" value={profile.headline || ''} onChange={(e) => updateField('headline', e.target.value)} />
          </div>
          <div>
            <label className="label">Location</label>
            <input type="text" className="input" placeholder="City, Country" value={profile.location || ''} onChange={(e) => updateField('location', e.target.value)} />
          </div>
          <div>
            <label className="label">GitHub</label>
            <input type="url" className="input" placeholder="https://github.com/username" value={profile.github || ''} onChange={(e) => updateField('github', e.target.value)} />
          </div>
          <div>
            <label className="label">LinkedIn</label>
            <input type="url" className="input" placeholder="https://linkedin.com/in/username" value={profile.linkedin || ''} onChange={(e) => updateField('linkedin', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea rows={3} className="input resize-none" placeholder="Tell recruiters about yourself…" value={profile.bio || ''} onChange={(e) => updateField('bio', e.target.value)} />
        </div>
      </div>

      {/* Resume */}
      <div className="card space-y-4">
        <h2 className="font-display font-semibold text-slate-ink border-b border-slate-100 pb-3">Resume</h2>
        <div
          {...getResumeProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            resumeDrag ? 'border-signal bg-signal/5' : 'border-slate-200 hover:border-signal/50 hover:bg-slate-50'
          }`}
        >
          <input {...getResumeInputProps()} />
          {resumeUploading ? (
            <div className="space-y-2">
              <Loader2 size={28} className="animate-spin mx-auto text-signal" />
              <p className="text-sm text-slate-soft">Parsing your resume…</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={28} className="mx-auto text-slate-400" />
              <p className="text-sm font-medium text-slate-ink">Drop your PDF resume here, or click to browse</p>
              <p className="text-xs text-slate-400">PDF only, up to 5MB</p>
            </div>
          )}
        </div>
        {profile.resumeUrl && (
          <div className="flex items-center gap-2 p-3 bg-pulse/10 border border-pulse/20 rounded-xl">
            <CheckCircle2 size={16} className="text-pulse-dark" />
            <span className="text-sm text-pulse-dark">Resume on file</span>
            <a href={fileUrl(profile.resumeUrl)} target="_blank" rel="noreferrer" className="ml-auto text-xs text-signal hover:underline">View PDF</a>
          </div>
        )}
        {parsedPreview?.skills?.length > 0 && (
          <div className="p-4 bg-signal/5 border border-signal/10 rounded-xl">
            <p className="text-xs font-medium text-signal-dark mb-2 flex items-center gap-1.5">
              <Sparkles size={13} /> AI extracted these skills from your resume:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {parsedPreview.skills.map((s) => <span key={s} className="badge bg-signal/10 text-signal-dark">{s}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="card space-y-4">
        <h2 className="font-display font-semibold text-slate-ink border-b border-slate-100 pb-3">Skills</h2>
        <SkillTagInput value={profile.skills || []} onChange={(skills) => updateField('skills', skills)} placeholder="Add a skill (e.g. React, Python)" />
      </div>

      {/* Education */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-display font-semibold text-slate-ink">Education</h2>
          <button onClick={addEducation} className="btn-ghost text-sm"><Plus size={15} /> Add</button>
        </div>
        {(profile.education || []).map((edu, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl relative">
            <button onClick={() => removeEducation(i)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
            <input className="input col-span-2" placeholder="Institution" value={edu.institution || ''} onChange={(e) => updateEducation(i, 'institution', e.target.value)} />
            <input className="input" placeholder="Degree" value={edu.degree || ''} onChange={(e) => updateEducation(i, 'degree', e.target.value)} />
            <input className="input" placeholder="Field of Study" value={edu.field || ''} onChange={(e) => updateEducation(i, 'field', e.target.value)} />
            <input className="input" type="number" placeholder="Start Year" value={edu.startYear || ''} onChange={(e) => updateEducation(i, 'startYear', e.target.value)} />
            <input className="input" type="number" placeholder="End Year" value={edu.endYear || ''} onChange={(e) => updateEducation(i, 'endYear', e.target.value)} />
          </div>
        ))}
      </div>

      {/* Experience */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-display font-semibold text-slate-ink">Experience</h2>
          <button onClick={addExperience} className="btn-ghost text-sm"><Plus size={15} /> Add</button>
        </div>
        {(profile.experience || []).map((exp, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl relative">
            <button onClick={() => removeExperience(i)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
            <input className="input" placeholder="Company" value={exp.company || ''} onChange={(e) => updateExperience(i, 'company', e.target.value)} />
            <input className="input" placeholder="Position" value={exp.position || ''} onChange={(e) => updateExperience(i, 'position', e.target.value)} />
            <textarea className="input col-span-2 resize-none" rows={2} placeholder="Description" value={exp.description || ''} onChange={(e) => updateExperience(i, 'description', e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
}
