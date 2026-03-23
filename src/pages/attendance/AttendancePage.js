import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { attendanceAPI, userAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useDebounce } from 'use-debounce';
import { 
  Clock, LogIn, LogOut, Search, Calendar, Timer, CheckCircle, XCircle,
  Users, TrendingUp, Activity, BarChart3, UserCheck, AlertCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AttendancePage() {
  const { user, isAdmin, isStaff, isSuperUser, isMember } = useAuth();
  const [userId, setUserId] = useState(user?.id || '');
  const [gymId, setGymId] = useState(user?.gymId || 1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [users, setUsers] = useState([]);
  const [current, setCurrent] = useState(null);
  const [todayHistory, setTodayHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('MANUAL');

  // Check if current user can mark attendance (SUPER_USER cannot, MEMBER can only view own)
  const canMarkAttendance = !isSuperUser && !isMember;
  const isOwnAttendance = isMember || (user && userId === user.id);
  // Member's attendance history
  const [memberAttendanceHistory, setMemberAttendanceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);

  // Statistics
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [currentlyPresent, setCurrentlyPresent] = useState([]);
  const [todayList, setTodayList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch statistics on mount
  useEffect(() => {
    if (gymId) {
      fetchStatistics();
      fetchWeeklyData();
      fetchCurrentlyPresent();
      fetchTodayList();
    }
  }, [gymId, page]);
  
  // Fetch member's own attendance history if logged in as member
  useEffect(() => {
    if (isMember && user?.id) {
      fetchMemberAttendanceHistory();
    }
  }, [isMember, user?.id, historyPage]);

  const fetchMemberAttendanceHistory = async () => {
    if (!user?.id) return;
    setHistoryLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const { data } = await attendanceAPI.getByDateRange(
        user.gymId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        historyPage,
        20
      );
      
      setMemberAttendanceHistory(data.content || []);
      setHistoryTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Member attendance history fetch error:', error);
    }
    setHistoryLoading(false);
  };

  // Fetch attendance when user selected
  useEffect(() => {
    if (userId && gymId) {
      fetchAttendance();
    }
  }, [userId, gymId]);

  const fetchStatistics = async () => {
    try {
      const { data } = await attendanceAPI.getStatistics(gymId);
      setStats(data);
      
      // Transform peak hours data for chart
      if (data.peakHours) {
        const peakData = Object.entries(data.peakHours).map(([hour, count]) => ({
          hour: `${hour}:00`,
          checkIns: count
        })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
        setWeeklyData(peakData);
      }
    } catch (error) {
      console.error('Statistics fetch error:', error);
    }
  };

  const fetchWeeklyData = async () => {
    try {
      const { data } = await attendanceAPI.getWeekly(gymId);
      const chartData = Object.entries(data).map(([day, count]) => ({
        day: day === 'MON' ? 'Mon' : day === 'TUE' ? 'Tue' : day === 'WED' ? 'Wed' : 
               day === 'THU' ? 'Thu' : day === 'FRI' ? 'Fri' : day === 'SAT' ? 'Sat' : 'Sun',
        checkIns: count
      }));
      // Store for weekly chart (separate from peak hours)
    } catch (error) {
      console.error('Weekly data fetch error:', error);
    }
  };

  const fetchCurrentlyPresent = async () => {
    try {
      const { data } = await attendanceAPI.getCurrentlyPresent(gymId);
      setCurrentlyPresent(data);
    } catch (error) {
      console.error('Currently present fetch error:', error);
    }
  };

  const fetchTodayList = async () => {
    try {
      const { data } = await attendanceAPI.getTodayList(gymId, page, 20);
      setTodayList(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Today list fetch error:', error);
    }
  };

  const fetchAttendance = async () => {
    if (!userId || !gymId) return;
    try {
      const [currentRes, historyRes] = await Promise.allSettled([
        attendanceAPI.getCurrent(gymId, userId),
        attendanceAPI.getToday(gymId, userId),
      ]);
      if (currentRes.status === 'fulfilled') setCurrent(currentRes.value.data);
      if (historyRes.status === 'fulfilled') setTodayHistory(historyRes.value.data || []);
    } catch (error) {
      console.error('Attendance fetch error:', error);
      toast.error('Failed to load attendance data');
    }
  };

  const searchUsers = async () => {
    if (!debouncedSearch.trim()) return;
    try {
      const { data } = await userAPI.search(debouncedSearch);
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('User search failed:', error);
    }
  };

  useEffect(() => {
    if (debouncedSearch) {
      searchUsers();
    }
  }, [debouncedSearch]);

  const handleCheckIn = async () => {
    if (!userId || !gymId) { 
      toast.error('Please select a user first'); 
      return; 
    }
    setLoading(true);
    try {
      await attendanceAPI.checkIn(gymId, userId, { method });
      toast.success('Checked in successfully! 🎉');
      fetchAttendance();
      fetchStatistics();
      fetchCurrentlyPresent();
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
      fetchStatistics();
      fetchCurrentlyPresent();
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

  const StatCard = ({ icon: Icon, label, value, subtext, color, bg }) => (
    <div className="stat-card animate-fadeInUp" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ width: 48, height: 48, borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          <Icon size={24} />
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{label}</div>
      {subtext && <div style={{ fontSize: '11px', color: color, marginTop: '4px', fontWeight: 600 }}>{subtext}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div className="page-header animate-fadeInDown">
        <div>
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">Track gym check-ins, check-outs, and view analytics</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={() => {
            fetchStatistics();
            fetchCurrentlyPresent();
            fetchTodayList();
          }}>
            <Clock size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard 
          icon={UserCheck} 
          label="Total Check-ins Today" 
          value={stats?.totalCheckIns || 0}
          color="var(--accent-primary)"
          bg="var(--accent-primary-dim)"
        />
        <StatCard 
          icon={Users} 
          label="Currently Present" 
          value={stats?.currentlyPresent || 0}
          subtext={`${currentlyPresent.length} members in gym`}
          color="var(--success)"
          bg="var(--success-dim)"
        />
        <StatCard 
          icon={Timer} 
          label="Avg. Duration" 
          value={formatDuration(stats?.averageDuration || 0)}
          color="var(--info)"
          bg="var(--info-dim)"
        />
        <StatCard 
          icon={Activity} 
          label="Peak Hour" 
          value={stats?.peakHours ? `${Object.keys(stats.peakHours)[0] || 'N/A'}:00` : '-'}
          subtext="Busiest time today"
          color="var(--warning)"
          bg="var(--warning-dim)"
        />
      </div>

      {/* Main Content - Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

        {/* Left Column - Check-in/out Panel */}
        <div className="card animate-fadeInUp" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--success-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <LogIn size={18} />
            </div>
            Mark Attendance
          </h3>

          {/* SUPER_USER Restriction Message */}
          {!canMarkAttendance && (
            <div style={{
              padding: '16px',
              background: 'var(--warning-dim)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '10px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertCircle size={20} color="var(--warning)" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--warning)', marginBottom: '4px' }}>
                  Super Users Cannot Mark Attendance
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Super Users have view-only access to attendance. They cannot check in or check out.
                </div>
              </div>
            </div>
          )}

          {canMarkAttendance && (
            <>

          {/* User Select */}
          <div className="input-group">
            <label className="input-label">Search Member</label>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input 
                className="input" 
                style={{ paddingLeft: '36px' }} 
                placeholder="Search by name or email..." 
                value={search}
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            {users.length > 0 && (
              <div style={{ 
                background: 'var(--bg-elevated)', 
                border: '1px solid var(--border-normal)', 
                borderRadius: '8px', 
                marginTop: '4px', 
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {users.slice(0, 5).map(u => (
                  <div key={u.id} 
                    onClick={() => {
                      setUserId(u.id);
                      setGymId(u.gymId || 1);
                      setSearch(`${u.firstName} ${u.lastName}`);
                      setUsers([]);
                    }}
                    style={{ 
                      padding: '10px 14px', 
                      cursor: 'pointer', 
                      fontSize: '14px',
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{u.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Method Selection */}
          <div className="input-group">
            <label className="input-label">Check-in Method</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['MANUAL', 'QR'].map(m => (
                <button 
                  key={m} 
                  type="button"
                  className={method === m ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                  onClick={() => setMethod(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Current Status */}
          {current && (
            <div style={{ 
              padding: '16px', 
              background: 'var(--success-dim)', 
              border: '1px solid rgba(16,185,129,0.3)', 
              borderRadius: '10px', 
              marginBottom: '16px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 600, marginBottom: '8px' }}>
                <CheckCircle size={18} /> Currently Checked In
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Since {formatTime(current.checkIn)}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleCheckIn}
              disabled={loading || !!current}
            >
              {loading ? (
                <div className="spinner" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
              ) : (
                <><LogIn size={16} /> Check In</>
              )}
            </button>
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={handleCheckOut}
              disabled={loading || !current}
            >
              <LogOut size={16} /> Check Out
            </button>
          </div>
            </>
          )}
        </div>

        {/* Right Column - Currently Present */}
        <div className="card animate-fadeInUp delay-100" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--success-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <Users size={18} />
            </div>
            Currently Present ({currentlyPresent.length})
          </h3>

          {currentlyPresent.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏋️</div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No members currently working out</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
              {currentlyPresent.map((a, i) => (
                <div key={a.id || i} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px', 
                  background: 'var(--bg-elevated)', 
                  borderRadius: '10px', 
                  border: '1px solid var(--border-subtle)' 
                }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: '10px', 
                    background: 'var(--success-dim)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: 'var(--success)', flexShrink: 0 
                  }}>
                    <UserCheck size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {a.userName || `User #${a.userId}`}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={11} /> Since {formatTime(a.checkIn)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row - Charts and Today's List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Today's Attendance List */}
        <div className="card animate-fadeInUp delay-200" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--info-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
              <Calendar size={18} />
            </div>
            Today's Attendance
          </h3>

          {todayList.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No attendance records today</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayList.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.userName || `User #${a.userId}`}</div>
                      </td>
                      <td>{formatTime(a.checkIn)}</td>
                      <td>{formatTime(a.checkOut)}</td>
                      <td>{formatDuration(a.durationMinutes)}</td>
                      <td>
                        {a.checkOut ? (
                          <span className="badge badge-success">
                            <CheckCircle size={10} /> Completed
                          </span>
                        ) : (
                          <span className="badge badge-warning">
                            <Clock size={10} /> Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                  <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>Page {page + 1} of {totalPages}</span>
                  <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User's Today History */}
        <div className="card animate-fadeInUp delay-300" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--accent-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <BarChart3 size={18} />
            </div>
            {userId ? 'Today\'s History' : 'Select a Member'}
          </h3>

          {!userId ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>👆</div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>Select a member to view their attendance history</p>
            </div>
          ) : todayHistory.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No completed sessions today</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todayHistory.map((a, i) => (
                <div key={a.id || i} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px', 
                  background: 'var(--bg-elevated)', 
                  borderRadius: '10px', 
                  border: '1px solid var(--border-subtle)' 
                }}>
                  <div style={{ 
                    width: 36, height: 36, borderRadius: '8px', 
                    background: a.checkOut ? 'var(--success-dim)' : 'var(--warning-dim)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: a.checkOut ? 'var(--success)' : 'var(--warning)', flexShrink: 0 
                  }}>
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

      {/* MEMBER'S ATTENDANCE HISTORY - Last 30 Days */}
      {isMember && memberAttendanceHistory.length > 0 && (
        <div className="card animate-fadeInUp delay-400" style={{ padding: '24px', marginTop: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--success-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <Calendar size={18} />
            </div>
            My Attendance History (Last 30 Days)
          </h3>

          {historyLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="spinner" style={{ width: 32, height: 32, borderColor: 'rgba(16,185,129,0.3)', borderTopColor: 'var(--success)', margin: '0 auto' }} />
              <p style={{ color: 'var(--text-tertiary)', marginTop: '12px' }}>Loading your attendance...</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Duration</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {memberAttendanceHistory.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {new Date(a.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {new Date(a.checkIn).toLocaleDateString('en-IN', { weekday: 'short' })}
                        </div>
                      </td>
                      <td style={{ fontSize: '13px' }}>{formatTime(a.checkIn)}</td>
                      <td style={{ fontSize: '13px' }}>{formatTime(a.checkOut)}</td>
                      <td style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>
                        {formatDuration(a.durationMinutes)}
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: '11px' }}>
                          {a.method || 'MANUAL'}
                        </span>
                      </td>
                      <td>
                        {a.checkOut ? (
                          <span className="badge badge-success">
                            <CheckCircle size={10} /> Completed
                          </span>
                        ) : (
                          <span className="badge badge-warning">
                            <Clock size={10} /> Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              {historyTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    disabled={historyPage === 0} 
                    onClick={() => setHistoryPage(p => p - 1)}
                  >
                    Previous
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                    Page {historyPage + 1} of {historyTotalPages}
                  </span>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    disabled={historyPage >= historyTotalPages - 1} 
                    onClick={() => setHistoryPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

AttendancePage.propTypes = {
  // No props - top level page
};
