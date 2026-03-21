import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Dumbbell, Eye, EyeOff, AlertCircle, Zap } from 'lucide-react';

// ===== 3D PARTICLE CANVAS =====
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const hexagons = Array.from({ length: 8 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 40 + 20,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.005,
      opacity: Math.random() * 0.06 + 0.02,
    }));

    const drawHex = (x, y, size, rotation, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = size * Math.cos(angle);
        const py = size * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(99,102,241,${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Hexagons
      hexagons.forEach(hex => {
        hex.rotation += hex.rotSpeed;
        hex.y -= 0.1;
        if (hex.y < -hex.size) hex.y = h + hex.size;
        drawHex(hex.x, hex.y, hex.size, hex.rotation, hex.opacity);
      });

      // Particles
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.opacity})`;
        ctx.fill();
      });

      // Connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.6 }} />;
}

// ===== FLOATING STAT PILLS =====
const STATS = [
  { label: 'Active Members', value: '2,847', color: '#6366f1' },
  { label: 'Daily Revenue', value: '₹48,290', color: '#10b981' },
  { label: 'Attendance Today', value: '312', color: '#f59e0b' },
];

export default function LoginPage() {
  const { login, error, clearError, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  useEffect(() => { clearError(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return;
    setLocalLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <ParticleCanvas />

      {/* Glow effects */}
      <div style={{ position: 'fixed', top: '-20%', left: '30%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Left Panel - Branding */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        zIndex: 1,
        display: window.innerWidth < 900 ? 'none' : 'flex',
      }} className="animate-fadeInUp">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '60px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            background: 'var(--grad-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            animation: 'glow-pulse 3s ease-in-out infinite',
          }}>
            <Dumbbell size={24} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', letterSpacing: '-0.03em' }}>GYM CRM</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Premium Management Suite</div>
          </div>
        </div>

        <h1 style={{ fontSize: '52px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '24px' }}>
          Manage Your<br />
          <span style={{ background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Fitness Empire
          </span>
        </h1>

        <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '420px', marginBottom: '48px' }}>
          Complete gym management — members, trainers, payments, attendance & more. All in one powerful dashboard.
        </p>

        {/* Stats Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {STATS.map((s, i) => (
            <div key={s.label} className="animate-fadeInUp" style={{
              animationDelay: `${(i + 1) * 150}ms`,
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 18px',
              background: 'var(--bg-card)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              maxWidth: '320px',
              transition: 'all var(--transition-normal)',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, boxShadow: `0 0 8px ${s.color}`, flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>{s.label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: s.color, fontSize: '15px' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{
        width: '480px',
        minWidth: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        position: 'relative',
        zIndex: 1,
        borderLeft: '1px solid var(--border-subtle)',
        background: 'rgba(14,14,26,0.8)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div className="animate-fadeInDown" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.03em' }}>Welcome back</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
                animation: shakeError ? 'shake 0.4s ease' : 'fadeIn 200ms ease',
              }}>
                <AlertCircle size={16} color="var(--danger)" />
                <span style={{ fontSize: '13px', color: 'var(--danger)' }}>{error}</span>
              </div>
            )}

            {/* Username */}
            <div className="input-group animate-fadeInUp delay-100">
              <label className="input-label">Username or Email</label>
              <input
                className="input"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="input-group animate-fadeInUp delay-200">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center',
                    padding: '4px',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full animate-fadeInUp delay-300"
              disabled={localLoading || isLoading || !form.username || !form.password}
              style={{ marginTop: '8px' }}
            >
              {(localLoading || isLoading) ? (
                <><div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white', width: 16, height: 16 }} /> Signing in...</>
              ) : (
                <><Zap size={16} /> Sign In</>
              )}
            </button>

            {/* Demo credentials */}
            <div style={{
              marginTop: '24px', padding: '14px', borderRadius: '10px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.7,
            }} className="animate-fadeInUp delay-400">
              <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={12} color="var(--accent-primary)" /> Quick Access
              </div>
              Configure your backend at <span style={{ color: 'var(--accent-primary-light)', fontFamily: 'var(--font-mono)' }}>localhost:8080</span> then login with your credentials
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
