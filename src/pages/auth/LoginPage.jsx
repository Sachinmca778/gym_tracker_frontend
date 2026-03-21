import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Dumbbell, Zap, Users, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: Users,      title: 'Member Management',    desc: 'Track members, memberships & more' },
  { icon: TrendingUp, title: 'Revenue Analytics',     desc: 'Real-time payment & revenue insights' },
  { icon: Zap,        title: 'Attendance Tracking',   desc: 'Fast check-in/out system' },
  { icon: Shield,     title: 'Role-Based Access',     desc: '7 roles with granular permissions' },
];

export default function LoginPage() {
  const [form, setForm]               = useState({ username: '', password: '' });
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
  useEffect(() => { clearError(); }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back! 💪');
      navigate('/dashboard');
    } catch {
      // error already set in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div style={{ maxWidth: 480 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 48, height: 48,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-bright))',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-accent)',
            }}>
              <Dumbbell size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
                Gym<span style={{ color: 'var(--accent-bright)' }}>CRM</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Management Suite</div>
            </div>
          </div>

          <h1 style={{ fontSize: '2.25rem', marginBottom: 12, lineHeight: 1.1 }}>
            The gym you deserve,<br/>
            <span className="gradient-text">managed effortlessly.</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: 48, lineHeight: 1.7 }}>
            A complete CRM solution for modern gym operations — members, trainers, payments, and more.
          </p>

          <div className="auth-feature-list">
            {FEATURES.map(f => (
              <div key={f.title} className="auth-feature-item animate-up">
                <div className="auth-feature-icon">
                  <f.icon size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{f.title}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 1 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel – Form */}
      <div className="auth-right">
        <div className="auth-form-box animate-up">
          <div className="auth-heading">Sign in</div>
          <div className="auth-subheading">Welcome back. Enter your credentials.</div>

          {error && (
            <div style={{
              background: 'var(--danger-dim)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: 24,
              color: 'var(--danger)',
              fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Shield size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="input-group">
              <label className="input-label">Username or Email</label>
              <input
                className="input"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username or email"
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg btn-full${loading ? ' opacity-50' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <><span className="loading-spinner" style={{ width: 18, height: 18 }} /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-bright)', fontWeight: 600 }}>
              Create one
            </Link>
          </div>

          {/* Demo hint */}
          <div style={{
            marginTop: 24,
            padding: '12px 16px',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
          }}>
            <strong style={{ color: 'var(--accent-bright)' }}>Backend:</strong> Connecting to{' '}
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              localhost:8080
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
