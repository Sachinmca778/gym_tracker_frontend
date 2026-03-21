import React, { useState, useEffect } from 'react';
import { membershipPlanAPI, membershipAPI, memberAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { CreditCard, Plus, Check, X, Edit2, Trash2, Star, RefreshCw, Calendar } from 'lucide-react';

// ===== PLAN MODAL =====
function PlanModal({ plan, onClose, onSave }) {
  const { user } = useAuth();
  const [form, setForm] = useState(plan || { name: '', description: '', durationMonths: 1, price: '', features: '', gymId: user?.gymId, isActive: true });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (plan?.id) { await membershipPlanAPI.update(plan.id, form); toast.success('Plan updated'); }
      else { await membershipPlanAPI.create(form); toast.success('Plan created'); }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3 className="modal-title">{plan ? 'Edit Plan' : 'Create Membership Plan'}</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Plan Name *</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Gold Membership" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Duration (Months) *</label>
                <input className="input" type="number" min="1" value={form.durationMonths} onChange={e => setForm({ ...form, durationMonths: e.target.value })} required />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Price (₹) *</label>
                <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Description</label>
              <textarea className="input" style={{ minHeight: '80px' }} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Plan description..." />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Features (comma-separated)</label>
              <input className="input" value={form.features || ''} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="Gym access, Locker, Pool..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : <><Check size={16} />{plan ? 'Save' : 'Create Plan'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== ASSIGN MODAL =====
function AssignModal({ onClose, onSave }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ memberId: '', planId: '', startDate: new Date().toISOString().split('T')[0], amountPaid: '', autoRenewal: false, gymId: user?.gymId });
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    memberAPI.getAll().then(r => setMembers(Array.isArray(r.data) ? r.data : r.data?.content || [])).catch(() => {});
    membershipPlanAPI.getActive().then(r => setPlans(r.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.memberId || !form.planId) { toast.error('Member and Plan are required'); return; }
    setLoading(true);
    try {
      await membershipAPI.assign({ ...form, memberId: parseInt(form.memberId), planId: parseInt(form.planId), gymId: parseInt(form.gymId), amountPaid: parseFloat(form.amountPaid) });
      toast.success('Membership assigned!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Assignment failed'); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Assign Membership</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Member *</label>
              <select className="input" value={form.memberId} onChange={e => setForm({ ...form, memberId: e.target.value })} required>
                <option value="">Select member...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.memberCode})</option>)}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Membership Plan *</label>
              <select className="input" value={form.planId} onChange={e => setForm({ ...form, planId: e.target.value, amountPaid: plans.find(p => p.id == e.target.value)?.price || form.amountPaid })} required>
                <option value="">Select plan...</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price} / {p.durationMonths}mo</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Start Date</label>
                <input className="input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Amount Paid (₹)</label>
                <input className="input" type="number" min="0" value={form.amountPaid} onChange={e => setForm({ ...form, amountPaid: e.target.value })} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={form.autoRenewal} onChange={e => setForm({ ...form, autoRenewal: e.target.checked })} style={{ accentColor: 'var(--accent-primary)', width: 16, height: 16 }} />
              Enable Auto-Renewal
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Assigning...' : <><Check size={16} />Assign</>}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====
export default function MembershipsPage() {
  const { isAdmin, isStaff } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await membershipPlanAPI.getAll({ page });
      console.log('Membership Plans API Response:', data);
      setPlans(data?.content || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error('Fetch plans error:', error);
      toast.error('Failed to load plans');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, [page]);

  const handleDelete = async (id) => {
    try { await membershipPlanAPI.delete(id); toast.success('Plan deleted'); setDeleteId(null); fetchPlans(); } catch { toast.error('Delete failed'); }
  };

  const TIER_COLORS = { 1: '#10b981', 3: '#6366f1', 6: '#f59e0b', 12: '#ef4444' };

  return (
    <div>
      <div className="page-header animate-fadeInDown">
        <div>
          <h1 className="page-title">Memberships</h1>
          <p className="page-subtitle">Plans and member subscriptions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={fetchPlans}><RefreshCw size={16} /></button>
          {isStaff && <button className="btn btn-secondary" onClick={() => setShowAssignModal(true)}><Calendar size={16} /> Assign Plan</button>}
          {isAdmin && <button className="btn btn-primary" onClick={() => { setEditPlan(null); setShowPlanModal(true); }}><Plus size={16} /> New Plan</button>}
        </div>
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-secondary)' }}>Membership Plans</h2>

      <div className="card animate-fadeInUp delay-100" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Description</th>
                <th>Features</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }, (_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }, (_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>
                ))
              ) : plans.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><CreditCard size={24} /></div>
                    <h4 style={{ color: 'var(--text-primary)' }}>No plans yet</h4>
                    <p style={{ fontSize: '13px' }}>Create membership plans for your gym</p>
                    {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => { setEditPlan(null); setShowPlanModal(true); }}><Plus size={14} /> Create Plan</button>}
                  </div>
                </td></tr>
              ) : (
                plans.map((p, i) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--accent-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                          <CreditCard size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-primary-light)', background: 'var(--accent-primary-dim)', padding: '2px 8px', borderRadius: '4px' }}>{p.durationMonths} month{p.durationMonths > 1 ? 's' : ''}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--success)' }}>₹{(p.price || 0).toLocaleString()}</span></td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description || '-'}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.features ? p.features.split(',').slice(0, 2).join(', ') + (p.features.split(',').length > 2 ? '...' : '') : '-'}
                    </td>
                    <td><span className={`badge ${p.isActive ? 'badge-success' : 'badge-warning'}`}><span className="badge-dot" />{p.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditPlan(p); setShowPlanModal(true); }} title="Edit"><Edit2 size={14} /></button>
                          <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteId(p.id)} title="Delete"><Trash2 size={14} /></button>
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
              Showing page <strong style={{ color: 'var(--text-primary)' }}>{page + 1}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalPages}</strong> • <strong style={{ color: 'var(--accent-primary)' }}>10</strong> plans per page
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

      {showPlanModal && <PlanModal plan={editPlan} onClose={() => { setShowPlanModal(false); setEditPlan(null); }} onSave={() => { setShowPlanModal(false); setEditPlan(null); fetchPlans(); }} />}
      {showAssignModal && <AssignModal onClose={() => setShowAssignModal(false)} onSave={() => setShowAssignModal(false)} />}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '360px' }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '36px' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--danger)' }}><Trash2 size={22} /></div>
              <h3 style={{ marginBottom: '8px' }}>Delete Plan?</h3>
              <p style={{ fontSize: '14px', marginBottom: '20px' }}>This will remove the membership plan.</p>
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
