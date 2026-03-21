import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { memberAPI, membershipAPI, paymentAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, Heart,
  CreditCard, Activity, Edit2, User, AlertTriangle,
  Clock, CheckCircle, XCircle
} from 'lucide-react';

const STATUS_COLORS = {
  ACTIVE: 'badge-success', INACTIVE: 'badge-warning',
  SUSPENDED: 'badge-danger', EXPIRED: 'badge-info'
};

export default function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isStaff } = useAuth();
  const [member, setMember] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [mRes, memRes] = await Promise.allSettled([
        memberAPI.getById(id),
        membershipAPI.getByMember(id),
      ]);
      if (mRes.status === 'fulfilled') setMember(mRes.value.data);
      if (memRes.status === 'fulfilled') setMemberships(Array.isArray(memRes.value.data) ? memRes.value.data : []);
    } catch { toast.error('Failed to load member'); }
    setLoading(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
      <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />
    </div>
  );

  if (!member) return (
    <div className="empty-state">
      <div className="empty-state-icon"><User size={24} /></div>
      <h4 style={{ color: 'var(--text-primary)' }}>Member not found</h4>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/members')}>
        <ArrowLeft size={14} /> Back to Members
      </button>
    </div>
  );

  const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Back Button */}
      <button className="btn btn-ghost btn-sm animate-fadeInDown" style={{ marginBottom: '20px' }} onClick={() => navigate('/members')}>
        <ArrowLeft size={16} /> Back to Members
      </button>

      {/* Hero Card */}
      <div className="card animate-fadeInUp" style={{ padding: '32px', marginBottom: '20px', background: 'linear-gradient(145deg, var(--bg-card) 0%, var(--bg-elevated) 100%)' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '24px',
            background: 'var(--accent-primary-dim)',
            border: '2px solid var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800,
            color: 'var(--accent-primary-light)',
            flexShrink: 0,
            boxShadow: 'var(--shadow-glow-sm)',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {member.firstName} {member.lastName}
              </h1>
              <span className={`badge ${STATUS_COLORS[member.status] || 'badge-info'}`}>
                <span className="badge-dot" />{member.status}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-primary-light)', background: 'var(--accent-primary-dim)', padding: '3px 10px', borderRadius: '6px', fontWeight: 600 }}>
                {member.memberCode}
              </span>
              {member.gender && <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{member.gender}</span>}
              {member.joinDate && (
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> Joined {new Date(member.joinDate).toLocaleDateString('en-IN')}
                </span>
              )}
            </div>
          </div>
          {isStaff && (
            <button className="btn btn-secondary" onClick={() => navigate(`/members?edit=${member.id}`)}>
              <Edit2 size={16} /> Edit
            </button>
          )}
        </div>

        {/* Contact Info Row */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '24px', flexWrap: 'wrap', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          {member.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <Phone size={14} color="var(--text-tertiary)" /> {member.phone}
            </div>
          )}
          {member.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <Mail size={14} color="var(--text-tertiary)" /> {member.email}
            </div>
          )}
          {member.city && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <MapPin size={14} color="var(--text-tertiary)" /> {member.city}, {member.state}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs animate-fadeInUp delay-100" style={{ marginBottom: '20px', display: 'inline-flex' }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'memberships', label: `Memberships (${memberships.length})` },
          { key: 'health', label: 'Health Info' },
          { key: 'emergency', label: 'Emergency' },
        ].map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid-2 animate-fadeInUp">
          {/* Personal Info */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>Personal Information</h3>
            {[
              { label: 'Full Name', value: `${member.firstName} ${member.lastName}` },
              { label: 'Date of Birth', value: member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('en-IN') : '—' },
              { label: 'Gender', value: member.gender || '—' },
              { label: 'Address', value: member.address || '—' },
              { label: 'Pincode', value: member.pincode || '—' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', maxWidth: '200px', textAlign: 'right' }}>{item.value}</span>
              </div>
            ))}
          </div>
          {/* Fitness Goals */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>Fitness Goals</h3>
            {member.fitnessGoals ? (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{member.fitnessGoals}</p>
            ) : (
              <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>No fitness goals set</p>
            )}
          </div>
        </div>
      )}

      {tab === 'memberships' && (
        <div className="animate-fadeInUp">
          {memberships.length === 0 ? (
            <div className="card">
              <div className="empty-state" style={{ padding: '48px' }}>
                <div className="empty-state-icon"><CreditCard size={24} /></div>
                <h4 style={{ color: 'var(--text-primary)' }}>No memberships</h4>
                <p>This member has no membership plans assigned</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {memberships.map(m => (
                <div key={m.id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{m.planName || `Plan #${m.planId}`}</div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} />
                          {new Date(m.startDate).toLocaleDateString('en-IN')} → {new Date(m.endDate).toLocaleDateString('en-IN')}
                        </span>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>₹{m.amountPaid?.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className={`badge ${m.status === 'ACTIVE' ? 'badge-success' : m.status === 'EXPIRED' ? 'badge-info' : 'badge-warning'}`}>
                      <span className="badge-dot" />{m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'health' && (
        <div className="grid-2 animate-fadeInUp">
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={14} color="var(--danger)" /> Medical Conditions
            </h3>
            <p style={{ fontSize: '14px', color: member.medicalConditions ? 'var(--text-secondary)' : 'var(--text-tertiary)', lineHeight: 1.7 }}>
              {member.medicalConditions || 'None reported'}
            </p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={14} color="var(--warning)" /> Allergies
            </h3>
            <p style={{ fontSize: '14px', color: member.allergies ? 'var(--text-secondary)' : 'var(--text-tertiary)', lineHeight: 1.7 }}>
              {member.allergies || 'None reported'}
            </p>
          </div>
        </div>
      )}

      {tab === 'emergency' && (
        <div className="card animate-fadeInUp">
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={14} color="var(--danger)" /> Emergency Contact
          </h3>
          {[
            { label: 'Name', value: member.emergencyContactName },
            { label: 'Phone', value: member.emergencyContactPhone },
            { label: 'Relation', value: member.emergencyContactRelation },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{item.label}</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
