import { useEffect, useState } from 'react';
import { Search, ShieldOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { avatarFor } from '../../utils/avatar.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import Pagination from '../../components/Pagination.jsx';

const ROLE_COLORS = {
  candidate: 'bg-signal/10 text-signal-dark',
  hr: 'bg-pulse/10 text-pulse-dark',
  admin: 'bg-ember/10 text-ember',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    api
      .get('/admin/users', { params: { role: roleFilter, search: debouncedSearch, page, limit: 20 } })
      .then((r) => { setUsers(r.data.users); setTotal(r.data.total); setPages(r.data.pages); })
      .finally(() => setLoading(false));
  }, [roleFilter, debouncedSearch, page]);

  const toggle = async (id) => {
    try {
      const r = await api.put(`/admin/users/${id}/toggle-status`);
      setUsers((prev) => prev.map((u) => (u._id === id ? r.data.user : u)));
      toast.success(r.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-ink">User Management</h1>
        <p className="text-slate-soft text-sm mt-1 font-mono">{total} total users</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" className="input pl-9" placeholder="Search name or email…" value={searchInput} onChange={(e) => { setSearchInput(e.target.value); setPage(1); }} />
        </div>
        {['', 'candidate', 'hr', 'admin'].map((r) => (
          <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${roleFilter === r ? 'bg-signal text-white' : 'bg-white border border-slate-200 text-slate-soft hover:bg-slate-50'}`}>
            {r || 'All Roles'}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-soft uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No users found</td></tr>
              ) : users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={avatarFor(user.avatar, user.name)} className="w-8 h-8 rounded-full" alt="" />
                      <span className="text-sm font-medium text-slate-ink">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-soft">{user.email}</td>
                  <td className="px-4 py-3"><span className={`badge text-xs ${ROLE_COLORS[user.role]}`}>{user.role}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-400 font-mono">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className={`badge text-xs ${user.isActive ? 'bg-pulse/10 text-pulse-dark' : 'bg-red-100 text-red-600'}`}>{user.isActive ? 'Active' : 'Banned'}</span></td>
                  <td className="px-4 py-3">
                    {user.role !== 'admin' && (
                      <button onClick={() => toggle(user._id)} title={user.isActive ? 'Ban user' : 'Restore user'} className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-pulse-dark hover:bg-pulse/10'}`}>
                        {user.isActive ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />
    </div>
  );
}
