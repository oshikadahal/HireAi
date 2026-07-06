import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import JobForm from '../../components/JobForm.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/jobs/${id}`)
      .then((r) => {
        const job = r.data.job;
        setForm({
          title: job.title,
          description: job.description,
          skillsRequired: job.skillsRequired || [],
          salaryMin: job.salaryMin || '',
          salaryMax: job.salaryMax || '',
          experience: job.experience || '',
          location: job.location || '',
          jobType: job.jobType || 'full-time',
          category: job.category || 'Engineering',
          deadline: job.deadline ? job.deadline.split('T')[0] : '',
          isActive: job.isActive,
        });
      })
      .catch(() => {
        toast.error('Job not found');
        navigate('/hr/jobs');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/jobs/${id}`, { ...form, salaryMin: Number(form.salaryMin) || 0, salaryMax: Number(form.salaryMax) || 0 });
      toast.success('Job updated successfully!');
      navigate('/hr/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <LoadingSpinner fullHeight label="Loading job…" />;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-slate-ink">Edit Job</h1>
        <p className="text-slate-soft text-sm mt-1">Update your job posting</p>
      </div>
      <JobForm form={form} setForm={setForm} onSubmit={handleSubmit} submitting={saving} submitLabel="Save Changes" onCancel={() => navigate('/hr/jobs')} showActiveToggle />
    </div>
  );
}
