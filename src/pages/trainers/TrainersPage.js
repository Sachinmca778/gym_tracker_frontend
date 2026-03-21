// ===== TRAINERS PAGE =====
import React, { useState, useEffect } from 'react';
import { trainerAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Dumbbell, Plus, Star, RefreshCw, X, Check, AlertCircle, Edit2, Trash2, Phone, Mail } from 'lucide-react';

function TrainerModal({ trainer, onClose, onSave }) {
  const { user } = useAuth();
  const [form, setForm] = useState(trainer || {
    firstName: '', lastName: '', email: '', phone: '',
    specialization: '', experienceYears: '', hourlyRate: '',
    bio: '', location: '', gymId: user?.gymId,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (trainer?.id) {
        await trainerAPI.update(trainer.id, form);
        toast.success('Trainer updated');
      } else {
        await trainerAPI.create(form);
        toast.success('Trainer added');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
    setLoading(false);
  };

  const f = (label, key, type = 'text') => (
    <div className="input-group" style={{ marginBottom: 0 }}>
      <label className="input-label">{label}</label>
      <input className="input" type={type} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={`Enter ${label.toLowerCase()}`} />
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <h3 className="modal-title">{trainer ? 'Edit Trainer' : 'Add Trainer'}</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>{f('First Name', 'firstName')}{f('Last Name', 'lastName')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>{f('Email', 'email', 'email')}{f('Phone', 'phone', 'tel')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>{f('Specialization', 'specialization')}{f('Experience (Years)', 'experienceYears', 'number')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>{f('Hourly Rate (₹)', 'hourlyRate', 'number')}{f('Location', 'location')}</div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Bio</label>
              <textarea className="input" style={{ minHeight: '80px' }} value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Trainer bio..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : <><Check size={16} />{trainer ? 'Save' : 'Add Trainer'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TrainersPage() {
  const { isStaff } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await trainerAPI.getAll({ page });
      console.log('Trainers API Response:', data);
      setTrainers(data?.content || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error('Fetch trainers error:', error);
      toast.error('Failed to load trainers');
    }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [page]);

  const handleDelete = async (id) => {
    try { await trainerAPI.delete(id); toast.success('Trainer removed'); setDeleteId(null); fetch(); } catch { toast.error('Delete failed'); }
  };

  const filtered = filter === 'ACTIVE' ? trainers.filter(t => t.isActive) : trainers;

  return (
    <div>
      <div className="page-header animate-fadeInDown">
        <div>
          <h1 className="page-title">Trainers</h1>
          <p className="page-subtitle">{trainers.length} trainers registered</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={fetch}><RefreshCw size={16} /></button>
          {isStaff && <button className="btn btn-primary" onClick={() => { setEditTrainer(null); setShowModal(true); }}><Plus size={16} /> Add Trainer</button>}
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '20px', display: 'inline-flex' }}>
        <button className={`tab-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>All</button>
        <button className={`tab-btn ${filter === 'ACTIVE' ? 'active' : ''}`} onClick={() => setFilter('ACTIVE')}>Active</button>
      </div>

      <div className="card animate-fadeInUp delay-100" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Trainer</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Rate/Hr</th>
                <th>Rating</th>
                <th>Contact</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }, (_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }, (_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><Dumbbell size={24} /></div>
                    <h4 style={{ color: 'var(--text-primary)' }}>No trainers found</h4>
                    <p style={{ fontSize: '13px' }}>Add trainers to your gym</p>
                    {isStaff && <button className="btn btn-primary btn-sm" onClick={() => { setEditTrainer(null); setShowModal(true); }}><Plus size={14} /> Add Trainer</button>}
                  </div>
                </td></tr>
              ) : (
                filtered.map((t, i) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar avatar-sm">{`${t.firstName?.[0] || ''}${t.lastName?.[0] || ''}`.toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.firstName} {t.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: '13px', color: 'var(--accent-primary-light)', fontWeight: 600 }}>{t.specialization || 'General'}</span></td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t.experienceYears ? `${t.experienceYears} yrs` : '-'}</td>
                    <td><span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>₹{t.hourlyRate || 0}/hr</span></td>
                    <td>
                      {t.rating > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                          <Star size={12} color="#f59e0b" fill="#f59e0b" />
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.rating.toFixed(1)}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t.email || '-'}</td>
                    <td><span className={`badge ${t.isActive ? 'badge-success' : 'badge-warning'}`}><span className="badge-dot" />{t.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {isStaff && (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditTrainer(t); setShowModal(true); }} title="Edit"><Edit2 size={14} /></button>
                          <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteId(t.id)} title="Delete"><Trash2 size={14} /></button>
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
              Showing page <strong style={{ color: 'var(--text-primary)' }}>{page + 1}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalPages}</strong> • <strong style={{ color: 'var(--accent-primary)' }}>10</strong> trainers per page
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

      {showModal && <TrainerModal trainer={editTrainer} onClose={() => { setShowModal(false); setEditTrainer(null); }} onSave={() => { setShowModal(false); setEditTrainer(null); fetch(); }} />}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '380px' }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '36px' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--danger)' }}><Trash2 size={22} /></div>
              <h3 style={{ marginBottom: '8px' }}>Remove Trainer?</h3>
              <p style={{ fontSize: '14px', marginBottom: '20px' }}>This will permanently delete the trainer.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainersPage;
