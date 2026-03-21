import React, { useState, useEffect } from 'react';
import { attendanceAPI, userAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Clock, LogIn, LogOut, Search, Calendar, Timer, CheckCircle, XCircle } from 'lucide-react';

export default function AttendancePage() {
  const { user } = useAuth();
  const [userId, setUserId] = useState(user?.id || '');
  const [gymId, setGymId] = useState(user?.gymId || '');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [current, setCurrent] = useState(null);
  const [today, setToday] = useState([]);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('MANUAL');

  useEffect(() => {
    if (userId && gymId) {
      fetchAttendance();
    }
  }, [userId, gymId]);

  const searchUsers = async (q) => {
    if (!q.trim()) return;
    try {
      const { data } = await userAPI.search(q);
      setUsers(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  };

  const fetchAttendance = async () => {
    if (!userId || !gymId) return;
    try {
      const [curRes, todayRes] = await Promise.allSettled([
        attendanceAPI.getCurrent(gymId, userId),
        attendanceAPI.getToday(gymId, userId),
      ]);
      if (curRes.status === 'fulfilled') setCurrent(curRes.value.data);
      if (todayRes.status === 'fulfilled') setToday(Array.isArray(todayRes.value.data) ? todayRes.value.data : []);
    } catch { /* silent */ }
  };

  const handleCheckIn = async () => {
    if (!userId || !gymId) { toast.error('Please select a user first'); return; }
    setLoading(true);
    try {
      await attendanceAPI.checkIn(gymId, userId, { method });
      toast.success('Checked in successfully! 🎉');
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    if (!userId || !gymId) return;
    setLoading(true);
    try {
      await attendanceAPI.checkOut(gymId, userId);
      toast.success('Checked out successfully!');
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    }
    setLoading(false);
  };

  const formatTime = (ts) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (mins) => {
    if (!mins) return '-';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div className="page-header animate-fadeInDown">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track gym check-ins and check-outs</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Check-In Panel */}
        <div className="card animate-fadeInUp" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--success-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <Clock size={18} />
            </div>
            Mark Attendance
          </h3>

          {/* User Select */}
          <div className="input-group">
            <label className="input-label">Search User</label>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input className="input" style={{ paddingLeft: '36px' }} placeholder="Search by name..." value={search}
                onChange={e => { setSearch(e.target.value); searchUsers(e.target.value); }} />
            </div>
            {users.length > 0 && (
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-normal)', borderRadius: '8px', marginTop: '4px', overflow: 'hidden' }}>
                {users.slice(0, 5).map(u => (
                  <div key={u.id} onClick={() => {
                    setUserId(u.id);
                    setGymId(u.gymId || user?.gymId);
                    setSearch(`${u.firstName} ${u.lastName}`);
                    setUsers([]);
                  }}
                    style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', transition: 'background var(--transition-fast)', borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{u.role} — {u.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gym ID */}
          <div className="input-group">
            <label className="input-label">Gym ID</label>
            <input className="input" type="number" placeholder="Gym ID" value={gymId} onChange={e => setGymId(e.target.value)} />
          </div>

          {/* Method */}
          <div className="input-group">
            <label className="input-label">Method</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['MANUAL', 'QR'].map(m => (
                <button key={m} type="button"
                  className={method === m ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                  onClick={() => setMethod(m)}>{m}</button>
              ))}
            </div>
          </div>

          {/* Status */}
          {current && (
            <div style={{ padding: '14px', background: 'var(--success-dim)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 600, marginBottom: '4px' }}>
                <CheckCircle size={16} /> Currently Checked In
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Since {formatTime(current.checkIn)}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCheckIn} disabled={loading || !!current}>
              {loading ? <div className="spinner" style={{ width: 14, height: 14, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : <LogIn size={16} />}
              Check In
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleCheckOut} disabled={loading || !current}>
              <LogOut size={16} /> Check Out
            </button>
          </div>
        </div>

        {/* Today's Records */}
        <div className="card animate-fadeInUp delay-100" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--info-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
              <Calendar size={18} />
            </div>
            Today's Records
          </h3>

          {today.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No attendance records today</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {today.map((a, i) => (
                <div key={a.id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: a.checkOut ? 'var(--success-dim)' : 'var(--warning-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.checkOut ? 'var(--success)' : 'var(--warning)', flexShrink: 0 }}>
                    {a.checkOut ? <CheckCircle size={16} /> : <Clock size={16} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatTime(a.checkIn)} — {a.checkOut ? formatTime(a.checkOut) : 'Active'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Timer size={11} />
                      {a.durationMinutes ? formatDuration(a.durationMinutes) : 'In Progress'} · {a.method || 'MANUAL'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
