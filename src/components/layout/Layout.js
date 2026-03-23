import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.jpeg';
import {
  LayoutDashboard, Users, UserCheck, CreditCard,
  Calendar, Dumbbell, Building2, BarChart3, LogOut,
  Menu, X, Bell, Search, ChevronRight, Activity,
  Settings, User, Shield,UserCog
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_USER','ADMIN','MANAGER','RECEPTIONIST','TRAINER','MEMBER'] },
  { path: '/members', label: 'Members', icon: Users, roles: ['SUPER_USER','ADMIN','MANAGER','RECEPTIONIST','TRAINER'] },
  { path: '/trainers', label: 'Trainers', icon: Dumbbell, roles: ['SUPER_USER','ADMIN','MANAGER','RECEPTIONIST'] },
  { path: '/memberships', label: 'Memberships', icon: CreditCard, roles: ['SUPER_USER','ADMIN','MANAGER','RECEPTIONIST'] },
  { path: '/attendance', label: 'Attendance', icon: Calendar, roles: ['SUPER_USER','ADMIN','MANAGER','RECEPTIONIST','TRAINER','MEMBER'] },
  { path: '/payments', label: 'Payments', icon: BarChart3, roles: ['SUPER_USER','ADMIN','MANAGER','RECEPTIONIST'] },
  { path: '/gyms', label: 'Gyms', icon: Building2, roles: ['SUPER_USER','ADMIN'] },
  { path: '/profile', label: 'Profile', icon: User, roles: ['SUPER_USER','ADMIN','MANAGER','RECEPTIONIST','TRAINER','MEMBER'] },
  { path: '/users', label: 'User', icon: UserCog, roles: ['SUPER_USER','ADMIN'] },
];

const ROLE_COLORS = {
  SUPER_USER: '#ef4444',
  ADMIN: '#6366f1',
  MANAGER: '#f59e0b',
  RECEPTIONIST: '#10b981',
  TRAINER: '#3b82f6',
  MEMBER: '#8b5cf6',
  GUEST: '#6b7280',
};

function RoleBadge({ role }) {
  const color = ROLE_COLORS[role] || '#6b7280';
  return (
    <span style={{
      background: `${color}22`,
      color,
      border: `1px solid ${color}44`,
      fontSize: '10px',
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: '999px',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    }}>
      {role?.replace('_', ' ')}
    </span>
  );
}

export default function Layout({ children }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(item =>
    item.roles.some(r => hasRole(r))
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99, backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: sidebarOpen ? '260px' : '72px',
        minWidth: sidebarOpen ? '260px' : '72px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 300ms cubic-bezier(0.4,0,0.2,1), min-width 300ms',
        overflow: 'hidden',
        zIndex: 100,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid var(--border-subtle)',
          minHeight: '72px',
        }}>
          <img src={logo} alt="Gym Tracker Logo" style={{
            width: '42px',
            height: '42px',
            objectFit: 'contain',
            flexShrink: 0,
          }} />
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }} className="animate-fadeIn">
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>
                Gym Tracker
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>Management Suite</div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 8px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {visibleItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }} className="animate-fadeIn">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-subtle)' }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', marginBottom: '8px', background: 'var(--bg-elevated)' }} className="animate-fadeIn">
              <div className="avatar avatar-sm" style={{ width: 36, height: 36, fontSize: 13, flexShrink: 0 }}>{initials}</div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || user?.username}
                </div>
                <RoleBadge role={user?.role} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <div className="avatar avatar-sm" style={{ width: 36, height: 36, fontSize: 13 }}>{initials}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="nav-item btn-ghost"
            style={{
              width: '100%', border: 'none', background: 'none', cursor: 'pointer',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              color: 'var(--danger)', padding: '8px 12px',
            }}
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="animate-fadeIn">Logout</span>}
          </button>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            top: '22px',
            right: '-12px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-normal)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            transition: 'all var(--transition-fast)',
            zIndex: 101,
          }}
        >
          <ChevronRight size={12} style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 300ms' }} />
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{
          height: '64px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: '16px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ flex: 1 }} />

          <ThemeToggle />
          {/* Notification Bell */}
          <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
            <Bell size={18} />
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '7px',
              height: '7px',
              background: 'var(--danger)',
              borderRadius: '50%',
              border: '2px solid var(--bg-secondary)',
            }} />
          </button>

          {/* User Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            <div className="avatar avatar-sm" style={{ width: 34, height: 34, fontSize: 12 }}>{initials}</div>
            <div style={{ display: 'none' }} className="sm-show">
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name || user?.username}</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          flex: 1,
          padding: '32px',
          overflow: 'auto',
          background: 'var(--bg-primary)',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
