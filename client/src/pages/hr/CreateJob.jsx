import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import JobForm from '../../components/JobForm.jsx';

const BLANK_FORM = {
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

export default function CreateJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState(BLANK_FORM);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.skillsRequired.length === 0) {
      toast.error('Add at least one required skill');
      return;
    }
    setLoading(true);
    try {
      await api.post('/jobs', {
        ...form,
        salaryMin: Number(form.salaryMin) || 0,
        salaryMax: Number(form.salaryMax) || 0,
      });
      toast.success('Job posted successfully!');
      navigate('/hr/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-slate-ink">Post a New Job</h1>
        <p className="text-slate-soft text-sm mt-1">Fill in the details to attract the best candidates</p>
      </div>
      <JobForm form={form} setForm={setForm} onSubmit={handleSubmit} submitting={loading} submitLabel="Post Job" onCancel={() => navigate('/hr/jobs')} />
    </div>
  );
}
