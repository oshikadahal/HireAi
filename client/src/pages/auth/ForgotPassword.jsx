import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import AuthSidePanel from './AuthSidePanel.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (data.devResetUrl) setDevUrl(data.devResetUrl);
    } catch {
      toast.error('Something went wrong. Try again.');
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

          {sent ? (
            <div>
              <CheckCircle size={40} className="text-pulse mb-4" />
              <h2 className="text-xl font-display font-bold text-slate-ink mb-2">Check your email</h2>
              <p className="text-slate-soft text-sm mb-2">
                If an account exists for <strong>{email}</strong>, a reset link has been sent. It expires in 1 hour.
              </p>
              {devUrl && (
                <div className="text-xs bg-slate-100 rounded-lg p-3 mt-3 break-all">
                  <p className="font-medium text-slate-ink mb-1">Dev mode (no email configured) — use this link:</p>
                  <Link to={devUrl.replace(window.location.origin, '')} className="text-signal font-mono">{devUrl}</Link>
                </div>
              )}
              <Link to="/login" className="btn-secondary mt-6 inline-flex">
                <ArrowLeft size={15} /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-slate-ink">Forgot password?</h1>
              <p className="text-slate-soft text-sm mt-1 mb-8">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" className="input pl-10" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login" className="flex items-center gap-1 text-sm text-slate-soft hover:text-signal mt-6">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
