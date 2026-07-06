import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Briefcase, Users, Calendar, TrendingUp, Plus, ArrowRight, ClipboardList, Brain } from 'lucide-react';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const COLORS = ['#5B5BF6', '#2DD4BF', '#FB923C', '#A78BFA', '#F472B6', '#34D399'];

export default function HRDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/companies/dashboard').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullHeight label="Loading dashboard…" />;

  const statCards = [
    { label: 'Total Jobs', value: data.stats.totalJobs, icon: Briefcase, tone: 'signal' },
    { label: 'Active Jobs', value: data.stats.activeJobs, icon: TrendingUp, tone: 'pulse' },
    { label: 'Applications', value: data.stats.totalApplications, icon: Users, tone: 'signal' },
    { label: 'Interviews', value: data.stats.totalInterviews, icon: Calendar, tone: 'ember' },
  ];
  const TONE = { signal: 'text-signal bg-signal/10', pulse: 'text-pulse-dark bg-pulse/10', ember: 'text-ember bg-ember/10' };

  const pieData = (data.applicationsByStatus || []).map((item) => ({ name: item._id, value: item.count }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-ink">HR Dashboard</h1>
          <p className="text-slate-soft text-sm mt-1">{data.company?.companyName}</p>
        </div>
        <Link to="/hr/jobs/create" className="btn-primary"><Plus size={16} /> Post Job</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${TONE[tone]}`}><Icon size={21} /></div>
            <div>
              <p className="text-2xl font-bold text-slate-ink font-mono">{value}</p>
              <p className="text-xs text-slate-soft">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card">
          <h2 className="font-display font-semibold text-slate-ink mb-4">Applications by Status</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={9} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center py-16">No applications yet</p>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h2 className="font-display font-semibold text-slate-ink mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Post a New Job', to: '/hr/jobs/create', icon: Plus },
                { label: 'View All Jobs', to: '/hr/jobs', icon: Briefcase },
                { label: 'Schedule Interview', to: '/hr/interviews', icon: Calendar },
                { label: 'Create Assessment', to: '/hr/assessments', icon: ClipboardList },
                { label: 'AI Question Generator', to: '/hr/ai-tools', icon: Brain },
              ].map(({ label, to, icon: Icon }) => (
                <Link key={to} to={to} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-signal/5 border border-transparent hover:border-signal/20 transition-colors">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-ink"><Icon size={15} className="text-signal" />{label}</span>
                  <ArrowRight size={14} className="text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
          {!data.company?.isApproved && (
            <div className="p-4 bg-ember/10 border border-ember/20 rounded-xl">
              <p className="text-sm font-medium text-amber-800">⏳ Pending Approval</p>
              <p className="text-xs text-amber-700 mt-1">Your company is awaiting admin approval before you can post jobs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
