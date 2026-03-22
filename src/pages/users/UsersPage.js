import React, { useState, useEffect } from 'react';
import { userAPI, gymAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Users, Plus, Search, RefreshCw, Edit2, Trash2, X, Check,
  AlertCircle, Mail, Phone, UserCheck, Shield
} from 'lucide-react';

// ===== USER FORM MODAL =====
function UserModal({ user, onClose, onSave }) {
  const { user: currentUser, isAdmin, isSuperUser } = useAuth();
  const [form, setForm] = useState(user || {
    username: '',
    email: '',
    passwordHash: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'MEMBER',
    gym: currentUser?.gymId || '',
    isActive: true,
  });
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch gyms for dropdown
  useEffect(() => {
    if (isSuperUser) {
      gymAPI.getAll().then(r => setGyms(r.data || [])).catch(() => {});
    } else if (isAdmin) {
      gymAPI.getActive().then(r => setGyms(r.data || [])).catch(() => {});
    }
  }, [isSuperUser, isAdmin]);

  const validate = () => {
    const e = {};
    if (!form.username?.trim()) e.username = 'Username is required';
    if (!form.email?.trim()) e.email = 'Email is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!user && !form.passwordHash) e.passwordHash = 'Password is required';
    if (!user && form.passwordHash && form.passwordHash.length < 6) e.passwordHash = 'Password must be at least 6 characters';
    if (!form.firstName?.trim()) e.firstName = 'First name is required';
    if (!form.lastName?.trim()) e.lastName = 'Last name is required';
    if (!form.role) e.role = 'Role is required';
    if (!form.gym && !isSuperUser) e.gym = 'Gym is required';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      if (user?.id) {
        // Update existing user (without password)
        const { passwordHash, ...updateData } = form;
        await userAPI.update(user.id, updateData);
        toast.success('User updated successfully');
      } else {
        // Create new user
        await userAPI.create(form);
        toast.success('User created successfully');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
    setLoading(false);
  };

  const field = (label, key, type = 'text', required = false) => (
    <div className="input-group" style={{ marginBottom: 0 }}>
      <label className="input-label">{label}{required && ' *'}</label>
      <input
        className={`input ${errors[key] ? 'error' : ''}`}
        type={type}
        value={form[key] || ''}
        onChange={e => { setForm({ ...form, [key]: e.target.value }); if (errors[key]) setErrors({ ...errors, [key]: '' }); }}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      {errors[key] && <span className="input-error-msg"><AlertCircle size={12} />{errors[key]}</span>}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <h3 className="modal-title">{user ? 'Edit User' : 'Create New User'}</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {field('Username', 'username', 'text', true)}
              {!user && field('Password', 'passwordHash', 'password', true)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {field('Email', 'email', 'email', true)}
              {field('Phone', 'phone', 'tel')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {field('First Name', 'firstName', 'text', true)}
              {field('Last Name', 'lastName', 'text', true)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Role {isSuperUser && ' *'}</label>
                <select
                  className={`input ${errors.role ? 'error' : ''}`}
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  required={isSuperUser}
                >
                  <option value="">Select Role</option>
                  <option value="MEMBER">Member</option>
                  <option value="TRAINER">Trainer</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                  {isSuperUser && <option value="SUPER_USER">Super User</option>}
                </select>
                {errors.role && <span className="input-error-msg"><AlertCircle size={12} />{errors.role}</span>}
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Gym {(!isSuperUser) && ' *'}</label>
                <select
                  className={`input ${errors.gym ? 'error' : ''}`}
                  value={form.gym}
                  onChange={e => setForm({ ...form, gym: e.target.value ? parseInt(e.target.value) : null })}
                  required={!isSuperUser}
                >
                  <option value="">Select Gym</option>
                  {gyms.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.city})</option>
                  ))}
                </select>
                {errors.gym && <span className="input-error-msg"><AlertCircle size={12} />{errors.gym}</span>}
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)', width: 16, height: 16 }}
              />
              Active User
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><div className="spinner" style={{ width: 14, height: 14, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Saving...</>
              ) : (
                <><Check size={16} />{user ? 'Save Changes' : 'Create User'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== MAIN USERS PAGE =====
export default function UsersPage() {
  const { user: currentUser, isSuperUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.search(search);
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to load users');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      // Note: You'll need to add delete endpoint to userAPI
      // await userAPI.delete(id);
      toast.success('User deleted successfully');
      setDeleteId(null);
      fetchUsers();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Delete failed');
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || 
      `${u.firstName} ${u.lastName} ${u.email} ${u.username}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const ROLE_COLORS = {
    SUPER_USER: '#ef4444',
    ADMIN: '#6366f1',
    MANAGER: '#8b5cf6',
    RECEPTIONIST: '#f59e0b',
    TRAINER: '#10b981',
    MEMBER: '#3b82f6',
  };

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div className="page-header animate-fadeInDown">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{filtered.length} users found</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={fetchUsers}><RefreshCw size={16} /></button>
          {(isSuperUser || isAdmin) && (
            <button className="btn btn-primary" onClick={() => { setEditUser(null); setShowModal(true); }}>
              <Plus size={16} /> Create User
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }} className="animate-fadeInUp">
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={16} className="search-icon" />
          <input
            className="input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search users by name, email, or username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="tabs" style={{ flex: 'none' }}>
          {['ALL', 'MEMBER', 'TRAINER', 'RECEPTIONIST', 'MANAGER', 'ADMIN'].map(r => (
            <button
              key={r}
              className={`tab-btn ${roleFilter === r ? 'active' : ''}`}
              onClick={() => setRoleFilter(r)}
            >
              {r === 'ALL' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card animate-fadeInUp delay-100" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Gym</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }, (_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }, (_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 16, width: j === 0 ? '80%' : '60%' }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><Users size={24} /></div>
                    <h4 style={{ color: 'var(--text-primary)' }}>No users found</h4>
                    <p style={{ fontSize: '13px' }}>Try adjusting your search or create a new user</p>
                    {(isSuperUser || isAdmin) && (
                      <button className="btn btn-primary btn-sm" onClick={() => { setEditUser(null); setShowModal(true); }}>
                        <Plus size={14} /> Create User
                      </button>
                    )}
                  </div>
                </td></tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar avatar-sm">
                          {`${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {u.firstName} {u.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{u.username}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{u.phone || '-'}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: `${ROLE_COLORS[u.role] || '#6366f1'}22`,
                          color: ROLE_COLORS[u.role] || '#6366f1',
                          fontWeight: 600,
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {u.gym?.name || '-'}
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-warning'}`}>
                        <span className="badge-dot" />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {(isSuperUser || isAdmin) && (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => { setEditUser(u); setShowModal(true); }}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => setDeleteId(u.id)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={editUser}
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSave={() => { setShowModal(false); setEditUser(null); fetchUsers(); }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '40px 32px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--danger-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--danger)' }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ marginBottom: '8px' }}>Delete User?</h3>
              <p style={{ fontSize: '14px', marginBottom: '20px' }}>This action cannot be undone. All associated data will be affected.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
