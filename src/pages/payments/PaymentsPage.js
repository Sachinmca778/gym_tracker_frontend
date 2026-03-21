import React, { useState, useEffect } from 'react';
import { paymentAPI, userAPI, membershipPlanAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  CreditCard, Plus, Search, RefreshCw, Check, X,
  AlertCircle, TrendingUp, Clock, AlertTriangle, DollarSign
} from 'lucide-react';

const PAYMENT_STATUS = {
  COMPLETED: { label: 'Completed', class: 'badge-success' },
  PENDING: { label: 'Pending', class: 'badge-warning' },
  FAILED: { label: 'Failed', class: 'badge-danger' },
  REFUNDED: { label: 'Refunded', class: 'badge-info' },
};

const PAYMENT_METHODS = ['CASH', 'CARD', 'UPI', 'ONLINE', 'BANK_TRANSFER'];

// ===== CREATE PAYMENT MODAL =====
function PaymentModal({ onClose, onSave }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    userId: '', amount: '', paymentMethod: 'CASH',
    membershipPlanId: '', notes: '', dueDate: '',
  });
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    membershipPlanAPI.getActive().then(r => setPlans(r.data || [])).catch(() => {});
  }, []);

  const searchUsers = async (q) => {
    if (!q.trim()) return;
    try {
      const { data } = await userAPI.search(q);
      setUsers(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userId || !form.amount) { toast.error('User and Amount are required'); return; }
    setLoading(true);
    try {
      await paymentAPI.create({ ...form, amount: parseFloat(form.amount), userId: parseInt(form.userId), membershipPlanId: form.membershipPlanId ? parseInt(form.membershipPlanId) : null });
      toast.success('Payment recorded!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Record Payment</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* User Search */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Search User *</label>
              <div style={{ position: 'relative' }}>
                <input className="input" placeholder="Search by name or email..." value={userSearch}
                  onChange={e => { setUserSearch(e.target.value); searchUsers(e.target.value); }} />
              </div>
              {users.length > 0 && (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-normal)', borderRadius: '8px', maxHeight: '150px', overflow: 'auto', marginTop: '4px' }}>
                  {users.map(u => (
                    <div key={u.id} onClick={() => { setForm({ ...form, userId: u.id }); setUserSearch(`${u.firstName} ${u.lastName}`); setUsers([]); }}
                      style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', transition: 'background var(--transition-fast)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</span>
                      <span style={{ color: 'var(--text-tertiary)', marginLeft: '8px' }}>{u.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Amount (₹) *</label>
                <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Payment Method *</label>
                <select className="input" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Membership Plan (Optional)</label>
              <select className="input" value={form.membershipPlanId} onChange={e => setForm({ ...form, membershipPlanId: e.target.value })}>
                <option value="">No plan</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price}/{p.durationMonths}mo</option>)}
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Due Date</label>
              <input className="input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Notes</label>
              <textarea className="input" style={{ minHeight: '70px' }} placeholder="Payment notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Recording...</> : <><Check size={16} /> Record Payment</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====
export default function PaymentsPage() {
  const { isStaff } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('RECENT');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchPayments(); }, [filter, page]);
  useEffect(() => { fetchSummary(); }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await paymentAPI.getAll({ filter, page, size: 10 });
      setPayments(data?.content || data?.payments || []);
      setTotalPages(data?.totalPages || 1);
    } catch { toast.error('Failed to load payments'); }
    setLoading(false);
  };

  const fetchSummary = async () => {
    try {
      const [sumRes, pendRes, dailyRes] = await Promise.allSettled([
        paymentAPI.getSummary(),
        paymentAPI.getPendingAmount(),
        paymentAPI.getDailyRevenue(),
      ]);
      setSummary({
        total: sumRes.status === 'fulfilled' ? sumRes.value.data : null,
        pending: pendRes.status === 'fulfilled' ? pendRes.value.data : 0,
        daily: dailyRes.status === 'fulfilled' ? dailyRes.value.data : 0,
      });
    } catch { /* silent */ }
  };

  const FILTERS = [
    { key: 'RECENT', label: 'Recent' },
    { key: 'TODAY_EXPIRES', label: 'Expiring Today' },
    { key: 'UPCOMING_7_DAYS', label: 'Next 7 Days' },
    { key: 'OVERDUES', label: 'Overdue' },
  ];

  const summaryCards = [
    { icon: TrendingUp, label: 'Monthly Revenue', value: `₹${(summary?.total?.currentMonthRevenue || 0).toLocaleString()}`, color: '#10b981', bg: 'var(--success-dim)' },
    { icon: Clock, label: 'Pending Amount', value: `₹${(summary?.pending || 0).toLocaleString()}`, color: '#f59e0b', bg: 'var(--warning-dim)' },
    { icon: DollarSign, label: "Today's Revenue", value: `₹${(summary?.daily || 0).toLocaleString()}`, color: '#6366f1', bg: 'var(--accent-primary-dim)' },
    { icon: AlertTriangle, label: 'Overdue', value: summary?.total?.overdueCount || 0, color: '#ef4444', bg: 'var(--danger-dim)' },
  ];

  return (
    <div>
      <div className="page-header animate-fadeInDown">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Track and manage all payment transactions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={() => { fetchPayments(); fetchSummary(); }}><RefreshCw size={16} /></button>
          {isStaff && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {summaryCards.map((c, i) => (
          <div key={c.label} className="stat-card animate-fadeInUp" style={{ animationDelay: `${i * 80}ms` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                <c.icon size={18} />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{c.value}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="tabs" style={{ marginBottom: '20px', display: 'inline-flex' }} >
        {FILTERS.map(f => (
          <button key={f.key} className={`tab-btn ${filter === f.key ? 'active' : ''}`} onClick={() => { setFilter(f.key); setPage(0); }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card animate-fadeInUp delay-100" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Plan</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }, (_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>
                ))
              ) : payments.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><CreditCard size={24} /></div>
                    <h4 style={{ color: 'var(--text-primary)' }}>No payments found</h4>
                    <p style={{ fontSize: '13px' }}>Try a different filter or record a new payment</p>
                  </div>
                </td></tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="table-cell-primary">{p.userName || p.user?.firstName || `User #${p.userId}`}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{p.userEmail || ''}</div>
                    </td>
                    <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--success)', fontSize: '15px' }}>₹{(p.amount || 0).toLocaleString()}</span></td>
                    <td>
                      <span style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', fontWeight: 600 }}>
                        {p.paymentMethod?.replace('_', ' ')}
                      </span>
                    </td>
                    <td><span className={`badge ${PAYMENT_STATUS[p.status]?.class || 'badge-info'}`}><span className="badge-dot" />{PAYMENT_STATUS[p.status]?.label || p.status}</span></td>
                    <td style={{ fontSize: '13px' }}>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '-'}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{p.membershipPlanName || p.membershipPlan?.name || '-'}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>Page {page + 1} of {totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>

      {showModal && <PaymentModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchPayments(); fetchSummary(); }} />}
    </div>
  );
}
