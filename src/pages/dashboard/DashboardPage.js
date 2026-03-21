import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { memberAPI, paymentAPI, trainerAPI, membershipAPI } from '../../api';
import {
  Users, Dumbbell, CreditCard, TrendingUp, TrendingDown,
  Calendar, ArrowRight, AlertTriangle, Activity, Clock,
  ChevronUp, ChevronDown, Zap, BarChart2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

// ===== ANIMATED COUNTER =====
function Counter({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = typeof value === 'number' ? value : parseInt(value) || 0;
    const duration = 1200;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

// ===== STAT CARD =====
function StatCard({ icon: Icon, label, value, prefix = '', suffix = '', change, changeLabel, color, delay = 0, loading }) {
  return (
    <div className="stat-card animate-fadeInUp" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div className="stat-icon" style={{ background: `${color}22`, color }}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <div className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>
            {change >= 0 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      {loading ? (
        <div>
          <div className="skeleton" style={{ height: '36px', width: '60%', marginBottom: '8px' }} />
          <div className="skeleton" style={{ height: '14px', width: '80%' }} />
        </div>
      ) : (
        <>
          <div className="stat-value">
            <Counter value={typeof value === 'number' ? value : parseInt(value) || 0} prefix={prefix} suffix={suffix} />
          </div>
          <div className="stat-label">{label}</div>
          {changeLabel && (
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px' }}>{changeLabel}</div>
          )}
        </>
      )}
    </div>
  );
}

// ===== CUSTOM TOOLTIP =====
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-normal)', borderRadius: '8px', padding: '10px 14px' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ fontSize: '14px', fontWeight: 600, color: p.color }}>
          {p.name}: ₹{p.value?.toLocaleString()}
        </div>
      ))}
    </div>
  );
};

// ===== MOCK CHART DATA (will be replaced with real data) =====
const CHART_DATA = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    day: d.toLocaleDateString('en', { weekday: 'short' }),
    revenue: Math.floor(Math.random() * 50000) + 20000,
    members: Math.floor(Math.random() * 30) + 10,
  };
});

export default function DashboardPage() {
  const { user, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expiring, setExpiring] = useState([]);
  const [revenueData] = useState(CHART_DATA);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, expiringRes] = await Promise.allSettled([
        memberAPI.getDashboardSummary(),
        memberAPI.getExpiring(7),
      ]);
      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
      if (expiringRes.status === 'fulfilled') setExpiring(expiringRes.value.data || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  const stats = [
    {
      icon: Users, label: 'Total Members', value: summary?.memberCount || 0,
      color: '#6366f1', change: 12, changeLabel: 'vs last month', delay: 0
    },
    {
      icon: Activity, label: 'Active Users', value: summary?.activeUsers || 0,
      color: '#10b981', change: 8, changeLabel: 'currently active', delay: 100
    },
    {
      icon: CreditCard, label: 'Monthly Revenue', value: Math.round(summary?.totalPaymentsCurrentMonth || 0),
      prefix: '₹', color: '#f59e0b', change: 15, changeLabel: 'this month', delay: 200
    },
    {
      icon: Dumbbell, label: 'Trainers', value: summary?.trainerCount || 0,
      color: '#3b82f6', delay: 300
    },
  ];

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div className="page-header animate-fadeInDown">
        <div>
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},
            <span style={{ color: 'var(--accent-primary-light)' }}> {user?.name?.split(' ')[0] || user?.username}</span> 👋
          </h1>
          <p className="page-subtitle">Here's what's happening at your gym today</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={fetchData}>
            <Activity size={16} /> Refresh
          </button>
          {isStaff && (
            <button className="btn btn-primary" onClick={() => navigate('/members/new')}>
              <Users size={16} /> Add Member
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        {stats.map(s => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '32px' }}>
        {/* Revenue Chart */}
        <div className="card animate-fadeInUp delay-200">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '2px' }}>Revenue Overview</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Last 7 days</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
                Revenue
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-tertiary)" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--text-tertiary)" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGrad)" dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#818cf8' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Member Additions */}
        <div className="card animate-fadeInUp delay-300">
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '2px' }}>New Members</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Daily additions</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-tertiary)" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--text-tertiary)" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-normal)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px' }}>
                  <div style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ color: '#10b981', fontWeight: 600 }}>{payload[0]?.value} new members</div>
                </div>
              ) : null} />
              <Bar dataKey="members" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Expiring Memberships */}
        <div className="card animate-fadeInUp delay-300">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="var(--warning)" />
                Expiring Soon
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Next 7 days</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/members?filter=expiring')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {loading ? (
            Array.from({ length: 3 }, (_, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 12, width: '40%' }} />
                </div>
              </div>
            ))
          ) : expiring.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
              <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>No memberships expiring soon</p>
            </div>
          ) : (
            expiring.slice(0, 5).map((m, i) => (
              <div key={m.id || i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px', borderRadius: '8px', cursor: 'pointer',
                transition: 'background var(--transition-fast)',
                marginBottom: '4px',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => navigate(`/members/${m.id}`)}
              >
                <div className="avatar avatar-sm">
                  {`${m.firstName?.[0] || ''}${m.lastName?.[0] || ''}`.toUpperCase() || 'M'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.firstName} {m.lastName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    Code: {m.memberCode}
                  </div>
                </div>
                <span className="badge badge-warning">
                  <span className="badge-dot" />
                  Expiring
                </span>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="card animate-fadeInUp delay-400">
          <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="var(--accent-primary)" /> Quick Actions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Add Member', icon: Users, path: '/members/new', color: '#6366f1', show: isStaff },
              { label: 'Record Payment', icon: CreditCard, path: '/payments/new', color: '#10b981', show: isStaff },
              { label: 'Check In', icon: Clock, path: '/attendance', color: '#f59e0b', show: true },
              { label: 'Add Trainer', icon: Dumbbell, path: '/trainers/new', color: '#3b82f6', show: isAdmin },
              { label: 'New Plan', icon: BarChart2, path: '/memberships/new-plan', color: '#8b5cf6', show: isAdmin },
              { label: 'Assign Plan', icon: Calendar, path: '/memberships/assign', color: '#ef4444', show: isStaff },
            ].filter(a => a.show).map(action => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '16px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.background = `${action.color}15`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: `${action.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color }}>
                  <action.icon size={16} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
