import { Link } from 'react-router-dom';
import { Home, Search, Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-signal to-pulse flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </span>
          <span className="font-display font-bold text-slate-ink">HireAI</span>
        </div>
        <div className="text-8xl font-display font-black text-signal/10 mb-2 font-mono">404</div>
        <h1 className="text-2xl font-display font-bold text-slate-ink mb-2">Page not found</h1>
        <p className="text-slate-soft mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary"><Home size={16} /> Go Home</Link>
          <Link to="/jobs" className="btn-secondary"><Search size={16} /> Browse Jobs</Link>
        </div>
      </div>
    </div>
  );
}
