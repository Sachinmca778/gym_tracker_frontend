import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { memberAPI, userAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useDebounce } from 'use-debounce';
import {
  Users, Search, Plus, Edit2, Trash2, Eye,
  Filter, MoreVertical, Phone, Mail, Calendar,
  RefreshCw, UserCheck, X, Check, AlertCircle
} from 'lucide-react';

const STATUS_MAP = {
  ACTIVE: { label: 'Active', class: 'badge-success' },
  INACTIVE: { label: 'Inactive', class: 'badge-warning' },
  SUSPENDED: { label: 'Suspended', class: 'badge-danger' },
  EXPIRED: { label: 'Expired', class: 'badge-info' },
};

// ===== MEMBER FORM MODAL =====
function MemberFormModal({ member, onClose, onSave }) {
  const { user, isAdmin, isStaff } = useAuth();
  const [form, setForm] = useState(member || {
    userId: '',
    firstName: '', lastName: '', email: '', phone: '',
    gender: 'MALE', dateOfBirth: '', address: '', city: '',
    state: '', pincode: '', emergencyContactName: '',
    emergencyContactPhone: '', emergencyContactRelation: '',
    fitnessGoals: '', medicalConditions: '', status: 'ACTIVE',
    gymId: user?.gymId,
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  // Fetch users for dropdown (only if creating new member, not editing)
  useEffect(() => {
    if (!member && isAdmin) {
      fetchUsers();
    }
  }, []);

  // Search users when search term changes
  useEffect(() => {
    if (debouncedSearch && !member) {
      searchUsers(debouncedSearch);
    }
  }, [debouncedSearch, member]);

  const fetchUsers = async () => {
    try {
      const { data } = await userAPI.search('');
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const searchUsers = async (term) => {
    try {
      const { data } = await userAPI.search(term);
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('User search failed:', error);
    }
  };

  // Handle user selection
  const handleUserSelect = (userId) => {
    const user = users.find(u => u.id === parseInt(userId));
    if (user) {
      setSelectedUser(user);
      setForm(prev => ({
        ...prev,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender || 'MALE',
      }));
    }
  };

  const validate = () => {
    const e = {};
    
    // User ID is REQUIRED for new members
    if (!member && !form.userId) {
      e.userId = 'User selection is required';
    }
    
    // Required fields
    if (!form.firstName?.trim()) e.firstName = 'First name is required';
    if (!form.lastName?.trim()) e.lastName = 'Last name is required';
    if (!form.phone?.trim()) e.phone = 'Phone number is required';
    if (!form.emergencyContactName?.trim()) e.emergencyContactName = 'Emergency contact name is required';
    if (!form.emergencyContactPhone?.trim()) e.emergencyContactPhone = 'Emergency contact phone is required';
    
    // Email format validation
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Invalid email format';
    }
    
    // Phone format validation (10 digits)
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/[-\s]/g, ''))) {
      e.phone = 'Phone must be 10 digits';
    }
    
    // Pincode validation (6 digits for India)
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      e.pincode = 'Pincode must be 6 digits';
    }
    
    // Date of birth validation (should not be in future)
    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        e.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (member?.id) {
        await memberAPI.update(member.id, form);
        toast.success('Member updated successfully');
      } else {
        await memberAPI.create(form);
        toast.success('Member created successfully');
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
          <h3 className="modal-title">{member ? 'Edit Member' : 'Add New Member'}</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* User Selection (Only for new members, not editing) */}
            {!member ? (
              <div style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  <UserCheck size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Select User (Required)
                </h4>
                
                {/* Search Box */}
                <div className="search-input-wrapper" style={{ marginBottom: '12px' }}>
                  <Search size={16} className="search-icon" />
                  <input
                    className="input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* User Dropdown */}
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Select User *</label>
                  <select
                    className={`input ${errors.userId ? 'error' : ''}`}
                    value={form.userId || ''}
                    onChange={e => handleUserSelect(e.target.value)}
                    required
                  >
                    <option value="">-- Select a User --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} - {u.username} ({u.email})
                      </option>
                    ))}
                  </select>
                  {errors.userId && (
                    <span className="input-error-msg">
                      <AlertCircle size={12} /> User selection is required
                    </span>
                  )}
                </div>

                {/* Info Message */}
                {form.userId && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '10px', 
                    background: 'var(--success-dim)', 
                    borderRadius: '8px',
                    border: '1px solid rgba(16,185,129,0.2)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)'
                  }}>
                    <Check size={14} style={{ marginRight: '6px', verticalAlign: 'text-bottom', color: 'var(--success)' }} />
                    User selected: <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>
                  </div>
                )}
              </div>
            ) : null}

            {/* Auto-populated User Info (Read-only) */}
            {form.userId && (
              <div style={{ 
                marginBottom: '16px', 
                padding: '16px', 
                background: 'var(--info-dim)', 
                borderRadius: '10px',
                border: '1px solid rgba(59,130,246,0.2)'
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  User Information (Auto-populated)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="input-label" style={{ fontSize: '12px' }}>First Name</label>
                    <input className="input" value={form.firstName} readOnly style={{ background: 'rgba(255,255,255,0.5)' }} />
                  </div>
                  <div>
                    <label className="input-label" style={{ fontSize: '12px' }}>Last Name</label>
                    <input className="input" value={form.lastName} readOnly style={{ background: 'rgba(255,255,255,0.5)' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                  <div>
                    <label className="input-label" style={{ fontSize: '12px' }}>Email</label>
                    <input className="input" value={form.email} readOnly style={{ background: 'rgba(255,255,255,0.5)' }} />
                  </div>
                  <div>
                    <label className="input-label" style={{ fontSize: '12px' }}>Phone</label>
                    <input className="input" value={form.phone} readOnly style={{ background: 'rgba(255,255,255,0.5)' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Member Details */}
            <div style={{ opacity: form.userId || member ? 1 : 0.5, pointerEvents: form.userId || member ? 'auto' : 'none' }}>
              {!form.userId && !member && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' }}>
                  <AlertCircle size={24} style={{ marginBottom: '8px' }} />
                  <p>Please select a user first to add member details</p>
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {field('Date of Birth', 'dateOfBirth', 'date')}
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Gender</label>
                  <select className="input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>{field('Address', 'address')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {field('City', 'city')}
                {field('State', 'state')}
                {field('Pincode', 'pincode')}
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emergency Contact</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  {field('Contact Name', 'emergencyContactName', 'text', true)}
                  {field('Contact Phone', 'emergencyContactPhone', 'tel', true)}
                </div>
                {field('Relation', 'emergencyContactRelation')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Fitness Goals</label>
                  <textarea className="input" style={{ minHeight: '80px' }} value={form.fitnessGoals || ''} onChange={e => setForm({ ...form, fitnessGoals: e.target.value })} placeholder="Weight loss, muscle gain..." />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Medical Conditions</label>
                  <textarea className="input" style={{ minHeight: '80px' }} value={form.medicalConditions || ''} onChange={e => setForm({ ...form, medicalConditions: e.target.value })} placeholder="Any medical conditions..." />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Saving...</> : <><Check size={16} /> {member ? 'Save Changes' : 'Create Member'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====
export default function MembersPage() {
  const { isStaff } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300); // 300ms debounce
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await memberAPI.getAll();
      setMembers(Array.isArray(data) ? data : data?.content || data?.members || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast.error(error.response?.data?.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, []);

  const handleDelete = async (id) => {
    try {
      await memberAPI.delete(id);
      toast.success('Member deleted successfully');
      setDeleteId(null);
      fetchMembers();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(error.response?.data?.message || 'Failed to delete member');
    }
  };

  const filtered = members.filter(m => {
    const q = debouncedSearch.toLowerCase();
    const matchSearch = !debouncedSearch || `${m.firstName} ${m.lastName} ${m.email} ${m.phone} ${m.memberCode}`.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header animate-fadeInDown">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">{members.length} total members</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={fetchMembers}><RefreshCw size={16} /></button>
          {isStaff && (
            <button className="btn btn-primary" onClick={() => { setEditMember(null); setShowModal(true); }}>
              <Plus size={16} /> Add Member
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }} className="animate-fadeInUp">
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={16} className="search-icon" />
          <input className="input" style={{ paddingLeft: '36px' }} placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs" style={{ flex: 'none' }}>
          {['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXPIRED'].map(s => (
            <button key={s} className={`tab-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s === 'ALL' ? 'All' : STATUS_MAP[s]?.label || s}
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
                <th>Member</th>
                <th>Code</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Join Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }, (_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }, (_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 16, width: j === 0 ? '80%' : '60%' }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><Users size={24} /></div>
                    <h4 style={{ color: 'var(--text-primary)' }}>No members found</h4>
                    <p style={{ fontSize: '13px' }}>Try adjusting your search or add a new member</p>
                    {isStaff && <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={14} /> Add Member</button>}
                  </div>
                </td></tr>
              ) : (
                filtered.map(m => (
                  <tr key={m.id} style={{ cursor: 'pointer' }}>
                    <td onClick={() => navigate(`/members/${m.id}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar avatar-sm">
                          {`${m.firstName?.[0] || ''}${m.lastName?.[0] || ''}`.toUpperCase() || 'M'}
                        </div>
                        <div>
                          <div className="table-cell-primary">{m.firstName} {m.lastName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{m.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-primary-light)', background: 'var(--accent-primary-dim)', padding: '2px 8px', borderRadius: '4px' }}>
                        {m.memberCode}
                      </span>
                    </td>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13} color="var(--text-tertiary)" />{m.phone}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_MAP[m.status]?.class || 'badge-info'}`}>
                        <span className="badge-dot" />{STATUS_MAP[m.status]?.label || m.status}
                      </span>
                    </td>
                    <td>{m.joinDate ? new Date(m.joinDate).toLocaleDateString('en-IN') : '-'}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate(`/members/${m.id}`)}><Eye size={15} /></button>
                        {isStaff && (
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditMember(m); setShowModal(true); }}>
                            <Edit2 size={15} />
                          </button>
                        )}
                        {isStaff && (
                          <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteId(m.id)}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Form Modal */}
      {showModal && (
        <MemberFormModal
          member={editMember}
          onClose={() => { setShowModal(false); setEditMember(null); }}
          onSave={() => { setShowModal(false); setEditMember(null); fetchMembers(); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '40px 32px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--danger-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--danger)' }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ marginBottom: '8px' }}>Delete Member?</h3>
              <p style={{ fontSize: '14px', marginBottom: '24px' }}>This action cannot be undone. All member data will be permanently deleted.</p>
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

// ===== PROP TYPES =====
MemberFormModal.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.number,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    gender: PropTypes.string,
    dateOfBirth: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    pincode: PropTypes.string,
    emergencyContactName: PropTypes.string,
    emergencyContactPhone: PropTypes.string,
    emergencyContactRelation: PropTypes.string,
    fitnessGoals: PropTypes.string,
    medicalConditions: PropTypes.string,
    status: PropTypes.string,
    gymId: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

MembersPage.propTypes = {
  // No props - top level page component
};
