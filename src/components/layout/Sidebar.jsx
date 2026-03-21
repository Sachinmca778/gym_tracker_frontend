import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, CreditCard,
  Calendar, Dumbbell, Building2, User, LogOut,
  TrendingUp, Award, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/members',     icon: Users,       label: 'Members',      roles: ['SUPER_USER','ADMIN','MANAGER','RECEPTIONIST'] },
      { to: '/trainers',    icon: Award,       label: 'Trainers',     roles: ['SUPER_USER','ADMIN','MANAGER'] },
      { to: '/memberships', icon: CreditCard,  label: 'Memberships',  roles: ['SUPER_USER','ADMIN','MANAGER','RECEPTIONIST'] },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/attendance',  icon: UserCheck,   label: 'Attendance',   roles: ['SUPER_USER','ADMIN','MANAGER','RECEPTIONIST'] },
      { to: '/payments',    icon: TrendingUp,  label: 'Payments',     roles: ['SUPER_USER','ADMIN','MANAGER','RECEPTIONIST'] },
      { to: '/progress',    icon: Dumbbell,    label: 'Progress',     roles: ['SUPER_USER','ADMIN','MANAGER','TRAINER'] },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/gyms',    icon: Building2, label: 'Gyms', roles: ['SUPER_USER','ADMIN'] },
      { to: '/profile', icon: User,      label: 'Profile' },
    ],
  },
];

function getRoleBadgeColor(role) {
  const map = {
    SUPER_USER:    '#a855f7',
    ADMIN:         '#3b82f6',
    MANAGER:       '#10b981',
    RECEPTIONIST:  '#f59e0b',
    TRAINER:       '#06b6d4',
    MEMBER:        '#8b8b9e',
    GUEST:         '#4a4a5a',
  };
  return map[role] || '#8b8b9e';
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Sidebar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const canSeeItem = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Dumbbell size={20} color="#fff" />
        </div>
        <div>
          <div className="sidebar-logo-text">Gym<span>CRM</span></div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 1 }}>
            Management Suite
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(canSeeItem);
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <item.icon size={17} className="nav-icon" />
                  <span style={{ flex: 1 }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* User Footer */}
      {isAuthenticated && user && (
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => navigate('/profile')}>
            <div
              className="avatar"
              style={{
                background: `linear-gradient(135deg, ${getRoleBadgeColor(user.role)}55, ${getRoleBadgeColor(user.role)}22)`,
                border: `1px solid ${getRoleBadgeColor(user.role)}44`,
                color: getRoleBadgeColor(user.role),
              }}
            >
              {getInitials(user.name || user.username)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name || user.username}
              </div>
              <div style={{ fontSize: '0.6875rem', color: getRoleBadgeColor(user.role), fontWeight: 600, marginTop: 1 }}>
                {user.role?.replace('_', ' ')}
              </div>
            </div>
            <ChevronRight size={14} color="var(--text-muted)" />
          </div>
          <button
            className="btn btn-ghost btn-sm w-full mt-2"
            onClick={handleLogout}
            style={{ justifyContent: 'flex-start', gap: 8, paddingLeft: 12 }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
