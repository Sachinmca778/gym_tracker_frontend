import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Header({ title, subtitle, actions }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/members?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="header">
      <div>
        <div className="header-title">{title || 'Dashboard'}</div>
        {subtitle && <div className="header-subtitle">{subtitle}</div>}
      </div>

      <div className="header-spacer" />

      <div className="header-actions">
        {/* Search */}
        <form onSubmit={handleSearch} className="header-search">
          <Search size={15} color="var(--text-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members..."
          />
        </form>

        <ThemeToggle />

        {/* Notifications */}
        <div className="icon-btn relative" style={{ position: 'relative' }}>
          <Bell size={17} />
          <span className="notif-dot" />
        </div>

        {/* Custom Actions */}
        {actions}
      </div>
    </header>
  );
}
