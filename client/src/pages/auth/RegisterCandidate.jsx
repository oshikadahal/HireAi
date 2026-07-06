import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Zap, User, Mail, Phone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerCandidate } from '../../redux/slices/authSlice.js';
import AuthSidePanel from './AuthSidePanel.jsx';

const FIELDS = [
  { field: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', icon: User },
  { field: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', icon: Mail },
  { field: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 234 567 8900', icon: Phone },
  { field: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters', icon: Lock },
];

export default function RegisterCandidate() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerCandidate(form));
    if (registerCandidate.fulfilled.match(result)) {
      toast.success('Account created! Welcome to HireAI.');
      navigate('/candidate');
    }
  };

  return (
    <div className="min-h-screen flex">
      <AuthSidePanel />
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-paper">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-slate-ink mb-10 lg:hidden">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-signal to-pulse flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </span>
            HireAI
          </Link>

          <h1 className="text-2xl font-display font-bold text-slate-ink">Create your account</h1>
          <p className="text-slate-soft text-sm mt-1 mb-8">Find roles matched to your real skills.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {FIELDS.map(({ field, label, type, placeholder, icon: Icon }) => (
              <div key={field}>
                <label className="label">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={type}
                    className="input pl-10"
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    required={field !== 'phone'}
                  />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create Candidate Account'}
            </button>
          </form>

          <p className="text-sm text-slate-soft text-center mt-6">
            Already have an account? <Link to="/login" className="text-signal font-medium hover:underline">Sign in</Link>
          </p>
          <p className="text-sm text-slate-soft text-center mt-2">
            Hiring instead? <Link to="/register/hr" className="text-signal font-medium hover:underline">HR registration</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
