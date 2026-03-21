import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, LogOut, Building2, Hash, Mail } from 'lucide-react';

const ROLE_INFO = {
  SUPER_USER: { label: 'Super Administrator', color: '#ef4444', icon: Shield, desc: 'Full system access across all gyms' },
  ADMIN: { label: 'Gym Administrator', color: '#6366f1', icon: Shield, desc: 'Full access to your gym' },
  MANAGER: { label: 'Manager', color: '#f59e0b', icon: User, desc: 'Operational access' },
  RECEPTIONIST: { label: 'Receptionist', color: '#10b981', icon: User, desc: 'Front desk operations' },
  TRAINER: { label: 'Fitness Trainer', color: '#3b82f6', icon: User, desc: 'Training and client management' },
  MEMBER: { label: 'Gym Member', color: '#8b5cf6', icon: User, desc: 'Personal access' },
  GUEST: { label: 'Guest', color: '#6b7280', icon: User, desc: 'View only' },
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleInfo = ROLE_INFO[user?.role] || ROLE_INFO.GUEST;
  const RoleIcon = roleInfo.icon;

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div style={{ maxWidth: '600px' }}>
      <div className="page-header animate-fadeInDown">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Your account information</p>
        </div>
      </div>

      <div className="card animate-fadeInUp" style={{ padding: '40px', textAlign: 'center', marginBottom: '20px' }}>
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: `${roleInfo.color}22`,
          border: `3px solid ${roleInfo.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontFamily: 'var(--font-display)',
          fontSize: '32px', fontWeight: 800,
          color: roleInfo.color,
          boxShadow: `0 0 30px ${roleInfo.color}30`,
          animation: 'glow-pulse 3s ease-in-out infinite',
        }}>
          {initials}
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>{user?.name || user?.username}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>@{user?.username}</p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '99px', background: `${roleInfo.color}22`, border: `1px solid ${roleInfo.color}44`, color: roleInfo.color, fontWeight: 700, fontSize: '13px' }}>
          <RoleIcon size={14} />
          {roleInfo.label}
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '8px' }}>{roleInfo.desc}</p>
      </div>

      <div className="card animate-fadeInUp delay-100" style={{ padding: '28px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>Account Details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { icon: Hash, label: 'User ID', value: `#${user?.id}` },
            { icon: User, label: 'Username', value: user?.username },
            { icon: Shield, label: 'Role', value: user?.role?.replace('_', ' ') },
            { icon: Building2, label: 'Gym ID', value: user?.gymId ? `#${user.gymId}` : 'All Gyms (Super User)' },
            ...(user?.memberId ? [{ icon: Hash, label: 'Member ID', value: `#${user.memberId}` }] : []),
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: '10px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--accent-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                <item.icon size={16} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{item.value || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleLogout} className="btn btn-danger btn-full animate-fadeInUp delay-200" style={{ height: '48px', fontSize: '15px' }}>
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}
