import React, { useState, useEffect } from 'react';
import { gymAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Building2, Plus, Check, X, Edit2, Trash2, MapPin, Phone, Mail, RefreshCw } from 'lucide-react';

// ===== GYM MODAL =====
function GymModal({ gym, onClose, onSave }) {
  const [form, setForm] = useState(gym || { gymCode: '', name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', isActive: true });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (gym?.id) { await gymAPI.update(gym.id, form); toast.success('Gym updated'); }
      else { await gymAPI.create(form); toast.success('Gym created'); }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  const f = (label, key, type = 'text', req = false) => (
    <div className="input-group" style={{ marginBottom: 0 }}>
      <label className="input-label">{label}{req && ' *'}</label>
      <input className="input" type={type} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={`Enter ${label.toLowerCase()}`} required={req} />
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h3 className="modal-title">{gym ? 'Edit Gym' : 'Add New Gym'}</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>{f('Gym Code', 'gymCode', 'text', true)}{f('Gym Name', 'name', 'text', true)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>{f('Email', 'email', 'email')}{f('Phone', 'phone', 'tel')}</div>
            {f('Address', 'address')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>{f('City', 'city')}{f('State', 'state')}{f('Pincode', 'pincode')}</div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : <><Check size={16} />{gym ? 'Save' : 'Create Gym'}</>}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== GYMS PAGE =====
export function GymsPage() {
  const { isAdmin } = useAuth();
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editGym, setEditGym] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchGyms = async () => {
    setLoading(true);
    try {
      const { data } = await gymAPI.getAll({ page });
      console.log('Gyms API Response:', data);
      setGyms(data?.content || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error('Fetch gyms error:', error);
      toast.error('Failed to load gyms');
    }
    setLoading(false);
  };

  useEffect(() => { fetchGyms(); }, [page]);

  const handleDelete = async (id) => {
    try { await gymAPI.delete(id); toast.success('Gym deleted'); setDeleteId(null); fetchGyms(); } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header animate-fadeInDown">
        <div>
          <h1 className="page-title">Gyms</h1>
          <p className="page-subtitle">Manage your gym locations</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={fetchGyms}><RefreshCw size={16} /></button>
          {isAdmin && <button className="btn btn-primary" onClick={() => { setEditGym(null); setShowModal(true); }}><Plus size={16} /> Add Gym</button>}
        </div>
      </div>

      <div className="card animate-fadeInUp delay-100" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Gym Name</th>
                <th>Code</th>
                <th>City</th>
                <th>State</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }, (_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }, (_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>
                ))
              ) : gyms.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><Building2 size={24} /></div>
                    <h4 style={{ color: 'var(--text-primary)' }}>No gyms found</h4>
                    <p style={{ fontSize: '13px' }}>Add your first gym location</p>
                    {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => { setEditGym(null); setShowModal(true); }}><Plus size={14} /> Add Gym</button>}
                  </div>
                </td></tr>
              ) : (
                gyms.map(g => (
                  <tr key={g.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--accent-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.name}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-primary-light)', background: 'var(--accent-primary-dim)', padding: '2px 8px', borderRadius: '4px' }}>{g.gymCode}</span></td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{g.city || '-'}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{g.state || '-'}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{g.phone || '-'}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{g.email || '-'}</td>
                    <td><span className={`badge ${g.isActive ? 'badge-success' : 'badge-warning'}`}><span className="badge-dot" />{g.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditGym(g); setShowModal(true); }} title="Edit"><Edit2 size={14} /></button>
                          <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteId(g.id)} title="Delete"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)'
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
              Showing page <strong style={{ color: 'var(--text-primary)' }}>{page + 1}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalPages}</strong> • <strong style={{ color: 'var(--accent-primary)' }}>10</strong> gyms per page
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-secondary btn-sm" 
                disabled={page === 0} 
                onClick={() => setPage(0)}
                style={{ opacity: page === 0 ? 0.5 : 1 }}
              >
                First
              </button>
              <button 
                className="btn btn-secondary btn-sm" 
                disabled={page === 0} 
                onClick={() => setPage(p => p - 1)}
                style={{ opacity: page === 0 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '13px', 
                color: 'var(--text-secondary)',
                padding: '0 12px'
              }}>
                Page {page + 1} of {totalPages}
              </span>
              <button 
                className="btn btn-secondary btn-sm" 
                disabled={page >= totalPages - 1} 
                onClick={() => setPage(p => p + 1)}
                style={{ opacity: page >= totalPages - 1 ? 0.5 : 1 }}
              >
                Next
              </button>
              <button 
                className="btn btn-secondary btn-sm" 
                disabled={page >= totalPages - 1} 
                onClick={() => setPage(totalPages - 1)}
                style={{ opacity: page >= totalPages - 1 ? 0.5 : 1 }}
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && <GymModal gym={editGym} onClose={() => { setShowModal(false); setEditGym(null); }} onSave={() => { setShowModal(false); setEditGym(null); fetchGyms(); }} />}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '360px' }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '36px' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--danger)' }}><Trash2 size={22} /></div>
              <h3 style={{ marginBottom: '8px' }}>Delete Gym?</h3>
              <p style={{ fontSize: '14px', marginBottom: '20px' }}>All data associated with this gym will be affected.</p>
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

export default GymsPage;
