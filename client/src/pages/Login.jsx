import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import LiquidEnergyBackground from '../components/LiquidEnergyBackground';
import logo from '../logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (result.success) {
      navigate(result.role === 'merchant' ? '/merchant' : '/');
    } else {
      setError(result.error);
    }
  };

  const handleDemoLogin = async (demoRole) => {
    setError('');
    setIsSubmitting(true);
    try {
      const result = await login(null, null, demoRole);
      setIsSubmitting(false);
      if (result.success) {
        navigate(result.role === 'merchant' ? '/merchant' : '/');
      } else {
        setError(result.error || 'Demo login failed. Please try again.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setError('Demo login failed. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--deep-navy)', minHeight: '100vh' }}>
      <LiquidEnergyBackground />

      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(57,255,20,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Header badge */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4 p-2.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-2xl backdrop-blur-sm">
            <img src={logo} className="h-16 w-16 object-contain" alt="EV Nest Logo" />
          </div>
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse" />
            <span className="text-xs font-semibold" style={{ color: '#39ff14' }}>EV Nest Network Live</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            Welcome to <span className="neon-text neon-flicker">EV Nest</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            India's first crowdsourced EV charging marketplace
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-8 scanlines">
          {error && (
            <div className="mb-6 flex items-start space-x-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)', color: '#ff4d6d' }}>
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center" style={{ color: '#39ff14', opacity: 0.5 }}>
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@example.com or host@example.com"
                  className="cs-input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center" style={{ color: '#39ff14', opacity: 0.5 }}>
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="cs-input pl-10"
                  required
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="neon-btn w-full py-3 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-black">Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center">
            <div className="flex-grow border-t" style={{ borderColor: 'rgba(57,255,20,0.08)' }} />
            <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Quick Access</span>
            <div className="flex-grow border-t" style={{ borderColor: 'rgba(57,255,20,0.08)' }} />
          </div>

          {/* Demo Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              id="demo-driver-btn"
              type="button"
              onClick={() => handleDemoLogin('user')}
              disabled={isSubmitting}
              className="py-3 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105"
              style={{
                background: 'rgba(57,255,20,0.06)',
                border: '1px solid rgba(57,255,20,0.2)',
                color: '#39ff14',
              }}
            >
              ⚡ Enter as Driver
            </button>
            <button
              id="demo-host-btn"
              type="button"
              onClick={() => handleDemoLogin('merchant')}
              disabled={isSubmitting}
              className="py-3 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105"
              style={{
                background: 'rgba(0,229,255,0.06)',
                border: '1px solid rgba(0,229,255,0.2)',
                color: '#00e5ff',
              }}
            >
              🏠 Enter as Host
            </button>
          </div>

          {/* Register link */}
          <div className="mt-6 text-center pt-5" style={{ borderTop: '1px solid rgba(57,255,20,0.06)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No account?{' '}
              <Link to="/register" className="font-bold transition-colors" style={{ color: '#39ff14' }}>
                Join EV Nest →
              </Link>
            </p>
          </div>
        </div>

        {/* Footer stats */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[['120+', 'Home Chargers'], ['18', 'Cities'], ['$0.30/kWh', 'Avg Price']].map(([val, label]) => (
            <div key={label} className="py-3 px-2 rounded-xl" style={{ background: 'rgba(57,255,20,0.04)', border: '1px solid rgba(57,255,20,0.08)' }}>
              <div className="text-base font-black" style={{ color: '#39ff14' }}>{val}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
