import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, User, AlertTriangle, ArrowRight, Car } from 'lucide-react';
import LiquidEnergyBackground from '../components/LiquidEnergyBackground';
import logo from '../logo.png';

const POPULAR_EVS = [
  { model: 'Tata Nexon EV Max', capacity: 40.5 },
  { model: 'Tata Nexon EV Prime', capacity: 30.2 },
  { model: 'MG ZS EV', capacity: 50.3 },
  { model: 'Tata Tiago EV', capacity: 24.0 },
  { model: 'Tata Punch EV', capacity: 35.0 },
  { model: 'BYD Atto 3', capacity: 60.5 },
  { model: 'Hyundai Kona Electric', capacity: 39.2 },
  { model: 'Mahindra XUV400', capacity: 39.4 },
  { model: 'Citroen eC3', capacity: 29.2 },
  { model: 'MG Comet EV', capacity: 17.3 },
  { model: 'Hyundai Ioniq 5', capacity: 72.6 },
  { model: 'BYD E6', capacity: 71.7 },
  { model: 'Kia EV6', capacity: 77.4 },
  { model: 'BMW i4 eDrive40', capacity: 83.9 },
  { model: 'Tata Tigor EV', capacity: 26.0 },
];

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [selectedEvIndex, setSelectedEvIndex] = useState('');
  const [customEvName, setCustomEvName] = useState('');
  const [customEvCapacity, setCustomEvCapacity] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleEvChange = (e) => {
    const val = e.target.value;
    setSelectedEvIndex(val);
    if (val !== 'other') {
      setCustomEvName('');
      setCustomEvCapacity('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    let finalCarModel = '';
    let finalBatteryCapacity = 0;

    if (role === 'user') {
      if (selectedEvIndex === 'other') {
        finalCarModel = customEvName || 'Custom EV';
        finalBatteryCapacity = Number(customEvCapacity) || 30;
      } else if (selectedEvIndex !== '') {
        const ev = POPULAR_EVS[Number(selectedEvIndex)];
        finalCarModel = ev.model;
        finalBatteryCapacity = ev.capacity;
      }
    }

    setError('');
    setIsSubmitting(true);

    const result = await register({
      name, email, password, role,
      carModel: finalCarModel,
      batteryCapacityKwh: finalBatteryCapacity,
    });

    setIsSubmitting(false);
    if (result.success) {
      navigate(result.role === 'merchant' ? '/merchant' : '/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--deep-navy)', minHeight: '100vh' }}>
      <LiquidEnergyBackground />
      <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(57,255,20,0.07) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)' }} />

      <div className="w-full max-w-lg relative z-10 my-8 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4 p-2.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-2xl backdrop-blur-sm">
            <img src={logo} className="h-16 w-16 object-contain" alt="EV Nest Logo" />
          </div>
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse" />
            <span className="text-xs font-semibold" style={{ color: '#39ff14' }}>Free to join</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            Join <span className="neon-text">EV Nest</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            India's crowdsourced home EV charging marketplace
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8 scanlines">
          {error && (
            <div className="mb-5 flex items-start space-x-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)', color: '#ff4d6d' }}>
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: 'rgba(10,14,15,0.8)', border: '1px solid rgba(57,255,20,0.1)' }}>
              <button
                type="button"
                id="role-driver-btn"
                onClick={() => setRole('user')}
                className="py-2.5 rounded-lg text-sm font-bold transition-all duration-200"
                style={role === 'user' ? {
                  background: '#39ff14', color: '#0a0e0f',
                  boxShadow: '0 0 16px rgba(57,255,20,0.4)',
                } : {
                  color: 'var(--text-secondary)',
                }}
              >
                ⚡ I'm a Driver
              </button>
              <button
                type="button"
                id="role-host-btn"
                onClick={() => setRole('merchant')}
                className="py-2.5 rounded-lg text-sm font-bold transition-all duration-200"
                style={role === 'merchant' ? {
                  background: '#39ff14', color: '#0a0e0f',
                  boxShadow: '0 0 16px rgba(57,255,20,0.4)',
                } : {
                  color: 'var(--text-secondary)',
                }}
              >
                🏠 I'm a Host
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center" style={{ color: '#39ff14', opacity: 0.5 }}>
                  <User className="h-4 w-4" />
                </span>
                <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rajesh Kumar" className="cs-input pl-10" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center" style={{ color: '#39ff14', opacity: 0.5 }}>
                  <Mail className="h-4 w-4" />
                </span>
                <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rajesh@example.com" className="cs-input pl-10" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center" style={{ color: '#39ff14', opacity: 0.5 }}>
                  <Lock className="h-4 w-4" />
                </span>
                <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="cs-input pl-10" required />
              </div>
            </div>

            {/* Driver EV Setup */}
            {role === 'user' && (
              <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(57,255,20,0.04)', border: '1px solid rgba(57,255,20,0.12)' }}>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest" style={{ color: '#39ff14' }}>
                  <Car className="h-4 w-4" />
                  <span>EV Profile (Optional)</span>
                </div>
                <div>
                  <label className="block text-[10px] mb-1.5" style={{ color: 'var(--text-secondary)' }}>Select Car Model</label>
                  <select id="reg-ev-select" value={selectedEvIndex} onChange={handleEvChange} className="cs-input text-sm">
                    <option value="">-- Choose EV Model --</option>
                    {POPULAR_EVS.map((ev, index) => (
                      <option key={index} value={index}>{ev.model} ({ev.capacity} kWh)</option>
                    ))}
                    <option value="other">Other / Custom</option>
                  </select>
                </div>
                {selectedEvIndex === 'other' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] mb-1" style={{ color: 'var(--text-secondary)' }}>Model Name</label>
                      <input type="text" value={customEvName} onChange={(e) => setCustomEvName(e.target.value)} placeholder="e.g. Audi e-tron" className="cs-input text-xs py-2" />
                    </div>
                    <div>
                      <label className="block text-[9px] mb-1" style={{ color: 'var(--text-secondary)' }}>Battery (kWh)</label>
                      <input type="number" value={customEvCapacity} onChange={(e) => setCustomEvCapacity(e.target.value)} placeholder="e.g. 95" className="cs-input text-xs py-2" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              id="register-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="neon-btn w-full py-3 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-black">Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center pt-5" style={{ borderTop: '1px solid rgba(57,255,20,0.06)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Already registered?{' '}
              <Link to="/login" className="font-bold transition-colors" style={{ color: '#39ff14' }}>
                Sign In →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
