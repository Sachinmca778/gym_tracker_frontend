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
  const [showModal, setShowModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await trainerAPI.getAll();
      setTrainers(Array.isArray(data) ? data : data?.trainers || []);
    } catch { toast.error('Failed to load trainers'); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

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

      <div className="grid-3 animate-fadeInUp">
        {loading ? Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="card" style={{ animationDelay: `${i * 80}ms` }}>
            <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
              <div className="skeleton" style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '50%' }} />
              </div>
            </div>
          </div>
        )) : filtered.map((t, i) => (
          <div key={t.id} className="card card-interactive animate-fadeInUp" style={{ animationDelay: `${i * 60}ms` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="avatar avatar-lg">{`${t.firstName?.[0] || ''}${t.lastName?.[0] || ''}`.toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{t.firstName} {t.lastName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--accent-primary-light)', fontWeight: 600 }}>{t.specialization || 'General'}</div>
                </div>
              </div>
              <span className={`badge ${t.isActive ? 'badge-success' : 'badge-warning'}`} style={{ height: 'fit-content' }}>
                <span className="badge-dot" />{t.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {t.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                  <Star size={13} color="#f59e0b" fill="#f59e0b" />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.rating?.toFixed(1)}</span>
                  <span style={{ color: 'var(--text-tertiary)' }}>({t.totalRatings})</span>
                </div>
              )}
              {t.experienceYears && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t.experienceYears} yrs exp</div>}
              {t.hourlyRate && <div style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>₹{t.hourlyRate}/hr</div>}
            </div>

            {t.bio && <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.bio}</p>}

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {t.email && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={11} />{t.email}</div>}
            </div>

            {isStaff && (
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => { setEditTrainer(t); setShowModal(true); }}><Edit2 size={13} /> Edit</button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteId(t.id)}><Trash2 size={14} /></button>
              </div>
            )}
          </div>
        ))}
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
