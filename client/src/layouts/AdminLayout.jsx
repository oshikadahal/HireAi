import { Outlet, Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Users, Building2, Briefcase, LogOut, Menu, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { avatarFor } from '../utils/avatar.js';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/jobs', icon: Briefcase, label: 'Manage Jobs' },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/companies', icon: Building2, label: 'Manage Companies' },
];

export default function AdminLayout() {
  const { user, handleLogout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const Sidebar = () => (
    <aside className="w-64 bg-ink flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-white/10 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-white">
          <Shield size={18} className="text-ember" /> HireAI Admin
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
                isActive ? 'bg-ember text-white shadow-card' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={17} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <img src={avatarFor(user?.avatar, user?.name, 'FB923C')} className="w-9 h-9 rounded-full" alt="" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-ember">Administrator</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors w-full">
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
          <span className="ml-auto badge bg-ember/10 text-ember">Admin Panel</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
