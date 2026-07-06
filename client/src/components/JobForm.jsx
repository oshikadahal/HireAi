import { Loader2, Save } from 'lucide-react';
import SkillTagInput from './SkillTagInput.jsx';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'remote', 'internship'];
const CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations', 'Other'];
const EXPERIENCE = ['Fresher', '1-2 years', '2-5 years', '5-10 years', '10+ years'];

export default function JobForm({ form, setForm, onSubmit, submitting, submitLabel, onCancel, showActiveToggle, companySection }) {
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {companySection}

      {showActiveToggle && (
        <div className="card flex items-center justify-between p-4">
          <div>
            <p className="font-medium text-slate-ink">Job Status</p>
            <p className="text-sm text-slate-soft">{form.isActive ? 'Visible to candidates' : 'Hidden from candidates'}</p>
          </div>
          <button
            type="button"
            onClick={() => update('isActive', !form.isActive)}
            className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? 'bg-pulse' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      )}

      <div className="card space-y-4">
        <h2 className="font-display font-semibold text-slate-ink border-b border-slate-100 pb-3">Job Details</h2>
        <div>
          <label className="label">Job Title *</label>
          <input type="text" className="input" placeholder="e.g. Senior React Developer" value={form.title} onChange={(e) => update('title', e.target.value)} required />
        </div>
        <div>
          <label className="label">Job Description *</label>
          <textarea rows={6} className="input resize-none" placeholder="Responsibilities, requirements, and what you offer…" value={form.description} onChange={(e) => update('description', e.target.value)} required minLength={30} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Job Type</label>
            <select className="input" value={form.jobType} onChange={(e) => update('jobType', e.target.value)}>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => update('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input type="text" className="input" placeholder="e.g. Remote, New York" value={form.location} onChange={(e) => update('location', e.target.value)} />
          </div>
          <div>
            <label className="label">Experience Required</label>
            <select className="input" value={form.experience} onChange={(e) => update('experience', e.target.value)}>
              <option value="">Select</option>
              {EXPERIENCE.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Min Salary (USD/yr)</label>
            <input type="number" className="input" placeholder="e.g. 50000" value={form.salaryMin} onChange={(e) => update('salaryMin', e.target.value)} />
          </div>
          <div>
            <label className="label">Max Salary (USD/yr)</label>
            <input type="number" className="input" placeholder="e.g. 90000" value={form.salaryMax} onChange={(e) => update('salaryMax', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Application Deadline</label>
          <input type="date" className="input" value={form.deadline} onChange={(e) => update('deadline', e.target.value)} />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-display font-semibold text-slate-ink border-b border-slate-100 pb-3">Required Skills</h2>
        <SkillTagInput value={form.skillsRequired} onChange={(skills) => update('skillsRequired', skills)} placeholder="Add a required skill" />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
      </div>
    </form>
  );
}
