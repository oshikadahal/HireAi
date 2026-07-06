import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, LogOut, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

export default function PublicLayout() {
  const { user, isLoggedIn, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath = user?.role === 'hr' ? '/hr' : user?.role === 'admin' ? '/admin' : '/candidate';

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-display font-bold text-slate-ink">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-signal to-pulse flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </span>
            HireAI
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-soft">
            <Link to="/jobs" className="hover:text-slate-ink transition-colors">Browse Jobs</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link to={dashboardPath} className="btn-secondary text-sm">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-ghost text-sm">
                  <LogOut size={15} /> Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">Log In</Link>
                <Link to="/register/candidate" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>

          <button className="md:hidden text-slate-ink" onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2">
            <Link to="/jobs" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-ink">
              Browse Jobs
            </Link>
            {isLoggedIn ? (
              <>
                <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-signal">
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="block py-2 text-sm font-medium text-red-500 w-full text-left"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-ink">
                  Log In
                </Link>
                <Link to="/register/candidate" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-signal">
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-ink text-slate-400 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="font-display font-bold text-white text-lg flex items-center gap-2">
              <Zap size={16} className="text-pulse" /> HireAI
            </p>
            <p className="text-sm mt-2 max-w-xs">AI-powered recruitment that matches the right people to the right roles, faster.</p>
          </div>
          <div className="flex gap-10 text-sm">
            <div className="space-y-2">
              <p className="text-white font-medium">Product</p>
              <Link to="/jobs" className="block hover:text-white">Browse Jobs</Link>
              <Link to="/register/hr" className="block hover:text-white">Post a Job</Link>
            </div>
            <div className="space-y-2">
              <p className="text-white font-medium">Company</p>
              <button onClick={() => navigate('/')} className="block hover:text-white text-left">About</button>
              <button onClick={() => navigate('/')} className="block hover:text-white text-left">Contact</button>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-10 text-center">© {new Date().getFullYear()} HireAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
