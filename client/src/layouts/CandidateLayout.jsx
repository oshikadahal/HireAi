import { Outlet, Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, User, FileText, Code2, Calendar,
  LogOut, Briefcase, Menu, X, Zap,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { avatarFor } from '../utils/avatar.js';
import NotificationBell from '../components/NotificationBell.jsx';

const NAV_ITEMS = [
  { to: '/candidate', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/candidate/profile', icon: User, label: 'My Profile' },
  { to: '/candidate/applications', icon: FileText, label: 'Applications' },
  { to: '/candidate/assessments', icon: Code2, label: 'Assessments' },
  { to: '/candidate/interviews', icon: Calendar, label: 'Interviews' },
];

export default function CandidateLayout() {
  const { user, handleLogout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const Sidebar = () => (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-slate-ink">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-signal to-pulse flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </span>
          HireAI
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-signal text-white shadow-card' : 'text-slate-soft hover:bg-slate-50 hover:text-slate-ink'
              }`
            }
          >
            <Icon size={17} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <img src={avatarFor(user?.avatar, user?.name)} className="w-9 h-9 rounded-full" alt="" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-ink truncate">{user?.name}</p>
            <p className="text-xs text-slate-soft">Candidate</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-soft hover:text-red-500 transition-colors w-full">
          <LogOut size={15} /> Log Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <div className="hidden md:flex flex-shrink-0"><Sidebar /></div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileOpen(false)} />
          <div className="relative flex-shrink-0"><Sidebar /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <button className="md:hidden text-slate-ink" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <Link to="/jobs" className="hidden sm:flex btn-secondary text-sm">
              <Briefcase size={14} /> Browse Jobs
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
