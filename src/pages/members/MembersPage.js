import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
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
  const { user } = useAuth();
  const [form, setForm] = useState(member || {
    firstName: '', lastName: '', email: '', phone: '',
    gender: 'MALE', dateOfBirth: '', address: '', city: '',
    state: '', pincode: '', emergencyContactName: '',
    emergencyContactPhone: '', emergencyContactRelation: '',
    fitnessGoals: '', medicalConditions: '', status: 'ACTIVE',
    gymId: user?.gymId,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.emergencyContactName.trim()) e.emergencyContactName = 'Required';
    if (!form.emergencyContactPhone.trim()) e.emergencyContactPhone = 'Required';
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {field('First Name', 'firstName', 'text', true)}
              {field('Last Name', 'lastName', 'text', true)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {field('Email', 'email', 'email')}
              {field('Phone', 'phone', 'tel', true)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Gender</label>
                <select className="input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              {field('Date of Birth', 'dateOfBirth', 'date')}
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
    } catch { toast.error('Failed to load members'); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMembers(); }, []);

  const handleDelete = async (id) => {
    try {
      await memberAPI.delete(id);
      toast.success('Member deleted');
      setDeleteId(null);
      fetchMembers();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !search || `${m.firstName} ${m.lastName} ${m.email} ${m.phone} ${m.memberCode}`.toLowerCase().includes(q);
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
