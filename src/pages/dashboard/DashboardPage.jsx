import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, UserCheck, CreditCard,
  Award, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Activity, Calendar, Dumbbell, Building2,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { membersAPI, paymentsAPI, trainersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';

// ── Sample charts data (replace with real API data) ──
const AREA_DATA = [
  { month: 'Jan', revenue: 42000, members: 120 },
  { month: 'Feb', revenue: 48000, members: 135 },
  { month: 'Mar', revenue: 55000, members: 148 },
  { month: 'Apr', revenue: 51000, members: 142 },
  { month: 'May', revenue: 63000, members: 167 },
  { month: 'Jun', revenue: 71000, members: 183 },
  { month: 'Jul', revenue: 68000, members: 178 },
];

const PIE_DATA = [
  { name: 'Active',    value: 68, color: '#10b981' },
  { name: 'Expiring',  value: 15, color: '#f59e0b' },
  { name: 'Expired',   value: 12, color: '#ef4444' },
  { name: 'Suspended', value: 5,  color: '#8b8b9e' },
];

const BAR_DATA = [
  { day: 'Mon', checkins: 48 }, { day: 'Tue', checkins: 62 },
  { day: 'Wed', checkins: 71 }, { day: 'Thu', checkins: 55 },
  { day: 'Fri', checkins: 83 }, { day: 'Sat', checkins: 91 },
  { day: 'Sun', checkins: 44 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      fontSize: '0.8125rem', boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>{p.name}:</span>
          <strong>{typeof p.value === 'number' && p.name.toLowerCase().includes('revenue')
            ? `₹${p.value.toLocaleString()}` : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user, isManager } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary]     = useState(null);
  const [expiring, setExpiring]   = useState([]);
  const [topTrainers, setTopTrainers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pendingAmt, setPendingAmt] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, expRes, trainRes, pendRes] = await Promise.allSettled([
        membersAPI.getDashboardSummary(),
        membersAPI.getExpiring(7),
        trainersAPI.getTopRated(),
        paymentsAPI.getPendingAmount(),
      ]);
      if (sumRes.status === 'fulfilled')   setSummary(sumRes.value.data);
      if (expRes.status === 'fulfilled')   setExpiring(expRes.value.data?.slice(0, 5) || []);
      if (trainRes.status === 'fulfilled') setTopTrainers(trainRes.value.data?.slice(0, 5) || []);
      if (pendRes.status === 'fulfilled')  setPendingAmt(pendRes.value.data || 0);
    } catch { /* data stays null */ }
    finally { setLoading(false); }
  };

  const STATS = [
    {
      label: 'Total Members',
      value: summary?.memberCount ?? '—',
      icon: Users,
      color: 'var(--accent)',
      bg: 'var(--accent-dim)',
      change: '+12%',
      up: true,
      onClick: () => navigate('/members'),
    },
    {
      label: 'Active Members',
      value: summary?.activeUsers ?? '—',
      icon: Activity,
      color: 'var(--success)',
      bg: 'var(--success-dim)',
      change: '+5%',
      up: true,
      onClick: () => navigate('/members'),
    },
    {
      label: 'Monthly Revenue',
      value: summary?.totalPaymentsCurrentMonth
        ? `₹${Number(summary.totalPaymentsCurrentMonth).toLocaleString()}` : '—',
      icon: TrendingUp,
      color: 'var(--purple)',
      bg: 'var(--purple-dim)',
      change: '+18%',
      up: true,
      onClick: () => navigate('/payments'),
    },
    {
      label: 'Pending Amount',
      value: pendingAmt ? `₹${Number(pendingAmt).toLocaleString()}` : '₹0',
      icon: CreditCard,
      color: 'var(--warning)',
      bg: 'var(--warning-dim)',
      change: '-3%',
      up: false,
      onClick: () => navigate('/payments'),
    },
    {
      label: 'Trainers',
      value: summary?.trainerCount ?? '—',
      icon: Award,
      color: 'var(--info)',
      bg: 'var(--info-dim)',
      change: '+2',
      up: true,
      onClick: () => navigate('/trainers'),
    },
    {
      label: 'Expiring Soon',
      value: expiring.length,
      icon: AlertTriangle,
      color: 'var(--danger)',
      bg: 'var(--danger-dim)',
      change: 'Next 7 days',
      up: false,
      onClick: () => navigate('/memberships'),
    },
  ];

  return (
    <div>
      <Header
        title={`Good ${getGreeting()}, ${user?.name?.split(' ')[0] || user?.username} 👋`}
        subtitle="Here's what's happening at your gym today"
      />

      <div className="page-content">
        {/* Stats Grid */}
        <div className="grid grid-3 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))' }}>
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`stat-card animate-up stagger-${i + 1}`}
              onClick={s.onClick}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon" style={{ background: s.bg }}>
                <s.icon size={22} color={s.color} />
              </div>
              <div className="stat-value">
                {loading ? <div className="skeleton" style={{ height: 32, width: 80 }} /> : s.value}
              </div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-change ${s.up ? 'up' : 'down'}`}>
                {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {s.change}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
          {/* Area Chart */}
          <div className="card animate-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: 2 }}>Revenue & Members</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Last 7 months performance</p>
              </div>
              <div className="tabs">
                <div className="tab-item active">Revenue</div>
                <div className="tab-item">Members</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={AREA_DATA}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="membersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card animate-up stagger-2">
            <div className="mb-6">
              <h3 style={{ fontSize: '1rem', marginBottom: 2 }}>Membership Status</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Distribution overview</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {PIE_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PIE_DATA.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Weekly Attendance Bar Chart */}
          <div className="card animate-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: 2 }}>Weekly Attendance</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Check-ins this week</p>
              </div>
              <Calendar size={17} color="var(--text-muted)" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={BAR_DATA} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="checkins" name="Check-ins" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Expiring Memberships */}
          <div className="card animate-up stagger-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: 2 }}>Expiring Memberships</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Next 7 days</p>
              </div>
              <AlertTriangle size={17} color="var(--warning)" />
            </div>

            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8, borderRadius: 10 }} />
              ))
            ) : expiring.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <div className="empty-icon" style={{ width: 48, height: 48 }}>
                  <UserCheck size={20} />
                </div>
                <p style={{ fontSize: '0.875rem', marginTop: 8 }}>No expiring memberships</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {expiring.map((m, i) => (
                  <div
                    key={m.id || i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                    onClick={() => navigate('/members')}
                  >
                    <div className="avatar avatar-sm" style={{ background: 'var(--warning-dim)', color: 'var(--warning)', fontSize: '0.7rem' }}>
                      {getInitials(m.firstName, m.lastName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.firstName} {m.lastName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.memberCode}</div>
                    </div>
                    <span className="badge badge-warning">{m.daysUntilExpiry ?? '?'}d</span>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm w-full mt-2" onClick={() => navigate('/memberships')}>
                  View all expiring →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getInitials(first = '', last = '') {
  return `${first[0] || ''}${last[0] || ''}`.toUpperCase() || '?';
}
