import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import AuthSidePanel from './AuthSidePanel.jsx';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      localStorage.setItem('hireai_token', data.token);
      localStorage.setItem('hireai_user', JSON.stringify(data.user));
      toast.success('Password reset! Redirecting…');
      const role = data.user.role;
      navigate(role === 'hr' ? '/hr' : role === 'admin' ? '/admin' : '/candidate');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AuthSidePanel />
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-paper">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-slate-ink mb-10 lg:hidden">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-signal to-pulse flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </span>
            HireAI
          </Link>
          <div className="w-11 h-11 rounded-xl bg-signal/10 flex items-center justify-center mb-4">
            <Lock size={20} className="text-signal" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-ink">Set a new password</h1>
          <p className="text-slate-soft text-sm mt-1 mb-8">Choose something secure you haven't used before.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className="input" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              {confirm && password !== confirm && <p className="text-xs text-red-500 mt-1">Passwords don't match</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
