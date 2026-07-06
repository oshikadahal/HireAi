import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Zap, Building2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerHR } from '../../redux/slices/authSlice.js';
import AuthSidePanel from './AuthSidePanel.jsx';

export default function RegisterHR() {
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '', website: '', description: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerHR(form));
    if (registerHR.fulfilled.match(result)) {
      toast.success('HR account created!');
      navigate('/hr');
    }
  };

  return (
    <div className="min-h-screen flex">
      <AuthSidePanel />
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-paper overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md my-8">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-slate-ink mb-8 lg:hidden">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-signal to-pulse flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </span>
            HireAI
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-signal/10 flex items-center justify-center">
              <Building2 size={20} className="text-signal" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-slate-ink">HR Registration</h1>
              <p className="text-slate-soft text-sm">Set up your recruiter account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-slate-soft uppercase tracking-wider mb-3">Your Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" className="input" placeholder="Jane Smith" value={form.name} onChange={update('name')} required />
                </div>
                <div>
                  <label className="label">Work Email</label>
                  <input type="email" className="input" placeholder="hr@company.com" value={form.email} onChange={update('email')} required />
                </div>
              </div>
              <div className="mt-3">
                <label className="label">Password</label>
                <input type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={update('password')} required />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-soft uppercase tracking-wider mb-3">Company Details</p>
              <div className="space-y-3">
                <div>
                  <label className="label">Company Name</label>
                  <input type="text" className="input" placeholder="Acme Corp" value={form.companyName} onChange={update('companyName')} required />
                </div>
                <div>
                  <label className="label">Company Website</label>
                  <input type="url" className="input" placeholder="https://acmecorp.com" value={form.website} onChange={update('website')} />
                </div>
                <div>
                  <label className="label">Company Description</label>
                  <textarea rows={3} className="input resize-none" placeholder="What does your company do?" value={form.description} onChange={update('description')} />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-ember/10 rounded-xl">
              <AlertCircle size={15} className="text-ember mt-0.5 flex-shrink-0" />
              <p className="text-xs text-ember-light text-amber-700">
                New companies need admin approval before posting jobs. This usually happens quickly.
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account…' : 'Create HR Account'}
            </button>
          </form>

          <p className="text-sm text-slate-soft text-center mt-6">
            Looking for a job instead? <Link to="/register/candidate" className="text-signal font-medium hover:underline">Candidate signup</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
