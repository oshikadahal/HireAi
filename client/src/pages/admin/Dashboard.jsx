import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Building2, Briefcase, AlertCircle, GraduationCap, Plus, ArrowRight } from 'lucide-react';
import api from '../../services/api.js';
import { avatarFor } from '../../utils/avatar.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullHeight label="Loading admin dashboard…" />;

  const statCards = [
    { label: 'Total Users', value: data.stats.totalUsers, icon: Users, tone: 'signal' },
    { label: 'Candidates', value: data.stats.totalCandidates, icon: GraduationCap, tone: 'pulse' },
    { label: 'Companies', value: data.stats.totalCompanies, icon: Building2, tone: 'signal' },
    { label: 'Jobs Posted', value: data.stats.totalJobs, icon: Briefcase, tone: 'pulse' },
    { label: 'Pending Approvals', value: data.stats.pendingCompanies, icon: AlertCircle, tone: 'ember' },
  ];
  const TONE = { signal: 'text-signal bg-signal/10', pulse: 'text-pulse-dark bg-pulse/10', ember: 'text-ember bg-ember/10' };

  const chartData = data.monthlyRegistrations.map((m) => ({
    name: new Date(0, m._id.month - 1).toLocaleString('default', { month: 'short' }),
    users: m.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold text-slate-ink">Admin Dashboard</h1>
        <Link to="/admin/jobs/create" className="btn-primary"><Plus size={16} /> Post Job</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card flex flex-col items-center text-center gap-2 py-5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${TONE[tone]}`}><Icon size={19} /></div>
            <p className="text-2xl font-bold text-slate-ink font-mono">{value}</p>
            <p className="text-xs text-slate-soft">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="font-display font-semibold text-slate-ink mb-4">Monthly Registrations</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="users" fill="#5B5BF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center py-16">Not enough data yet</p>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-ink">Recent Jobs</h2>
            <Link to="/admin/jobs" className="text-xs text-signal hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {data.recentJobs.length === 0 ? (
            <p className="text-sm text-slate-soft">No jobs posted yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentJobs.map((job) => (
                <div key={job._id} className="p-2 rounded-lg hover:bg-slate-50">
                  <p className="text-sm font-medium text-slate-ink truncate">{job.title}</p>
                  <p className="text-xs text-slate-400 truncate">{job.company?.companyName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="font-display font-semibold text-slate-ink mb-4">Recent Users</h2>
          <div className="space-y-3">
            {data.recentUsers.map((u) => (
              <div key={u._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <img src={avatarFor(null, u.name)} className="w-8 h-8 rounded-full" alt="" />
                  <div>
                    <p className="text-sm font-medium text-slate-ink">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>
                <span className={`badge text-xs ${u.role === 'hr' ? 'bg-pulse/10 text-pulse-dark' : u.role === 'admin' ? 'bg-ember/10 text-ember' : 'bg-signal/10 text-signal-dark'}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
