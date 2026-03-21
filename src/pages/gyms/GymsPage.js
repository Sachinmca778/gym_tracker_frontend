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
  const [showModal, setShowModal] = useState(false);
  const [editGym, setEditGym] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchGyms = async () => {
    setLoading(true);
    try { const { data } = await gymAPI.getAll(); setGyms(Array.isArray(data) ? data : []); } catch { toast.error('Failed to load gyms'); }
    setLoading(false);
  };

  useEffect(() => { fetchGyms(); }, []);

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

      <div className="grid-3 animate-fadeInUp">
        {loading ? Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="card" style={{ padding: '28px' }}>
            <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 14, width: '100%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '80%' }} />
          </div>
        )) : gyms.map((g, i) => (
          <div key={g.id} className="card card-interactive animate-fadeInUp" style={{ animationDelay: `${i * 80}ms`, padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'var(--accent-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                <Building2 size={22} />
              </div>
              <span className={`badge ${g.isActive ? 'badge-success' : 'badge-warning'}`}>
                <span className="badge-dot" />{g.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{g.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-primary-light)', background: 'var(--accent-primary-dim)', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', marginBottom: '16px' }}>{g.gymCode}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {g.city && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}><MapPin size={13} color="var(--text-tertiary)" />{g.city}, {g.state}</div>}
              {g.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}><Phone size={13} color="var(--text-tertiary)" />{g.phone}</div>}
              {g.email && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}><Mail size={13} color="var(--text-tertiary)" />{g.email}</div>}
            </div>
            {isAdmin && (
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => { setEditGym(g); setShowModal(true); }}><Edit2 size={13} /> Edit</button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteId(g.id)}><Trash2 size={14} /></button>
              </div>
            )}
          </div>
        ))}
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
