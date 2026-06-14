import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, Clock, Battery, CheckCircle, XCircle,
  ArrowRight, Calculator, Edit, Check, Zap, MapPin,
  User, Activity
} from 'lucide-react';
import LiquidEnergyBackground from '../components/LiquidEnergyBackground';

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
];

const StatusBadge = ({ status }) => {
  const map = {
    confirmed:  { label: 'Confirmed',  cls: 'badge-confirmed',  icon: <CheckCircle className="h-3 w-3 mr-1 shrink-0" /> },
    completed:  { label: 'Completed',  cls: 'badge-completed',  icon: <CheckCircle className="h-3 w-3 mr-1 shrink-0" /> },
    cancelled:  { label: 'Cancelled',  cls: 'badge-cancelled',  icon: <XCircle className="h-3 w-3 mr-1 shrink-0" /> },
    pending:    { label: 'Pending',    cls: 'badge-pending',    icon: <Clock className="h-3 w-3 mr-1 shrink-0 animate-spin" style={{ animationDuration: '3s' }} /> },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full flex items-center w-fit ${s.cls}`}>
      {s.icon}<span>{s.label}</span>
    </span>
  );
};

/* ── Animated battery ring ─────────────────────────────────────────────── */
const BatteryRing = ({ capacity }) => {
  const maxKwh = 80;
  const pct = Math.min((capacity / maxKwh) * 100, 100);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} stroke="rgba(57,255,20,0.08)" strokeWidth="6" fill="none" />
          <circle
            cx="44" cy="44" r={r}
            stroke="#39ff14"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 6px rgba(57,255,20,0.6))', transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black" style={{ color: '#39ff14' }}>{capacity}</span>
          <span className="text-[9px] font-semibold" style={{ color: 'var(--text-secondary)' }}>kWh</span>
        </div>
      </div>
      <p className="text-[10px] mt-1 font-semibold" style={{ color: 'var(--text-secondary)' }}>Battery Capacity</p>
    </div>
  );
};

const UserDashboard = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [selectedEvIndex, setSelectedEvIndex] = useState('');
  const [customEvName, setCustomEvName] = useState('');
  const [customEvCapacity, setCustomEvCapacity] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  const fetchBookings = async () => {
    setLoadingBookings(true);
    setBookingError('');
    try {
      const { data } = await API.get('/bookings/me');
      setBookings(data);
    } catch (error) {
      console.error(error);
      setBookingError('Failed to load bookings.');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    if (user) {
      setName(user.name);
      const matchedIdx = POPULAR_EVS.findIndex((e) => e.model === user.carModel);
      if (matchedIdx !== -1) {
        setSelectedEvIndex(String(matchedIdx));
      } else if (user.carModel) {
        setSelectedEvIndex('other');
        setCustomEvName(user.carModel);
        setCustomEvCapacity(String(user.batteryCapacityKwh));
      }
    }
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await API.patch(`/bookings/${bookingId}/status`, { status: 'cancelled' });
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccessMsg('');
    let finalCarModel = user.carModel;
    let finalBatteryCapacity = user.batteryCapacityKwh;
    if (selectedEvIndex === 'other') {
      finalCarModel = customEvName || '';
      finalBatteryCapacity = Number(customEvCapacity) || 0;
    } else if (selectedEvIndex !== '') {
      const ev = POPULAR_EVS[Number(selectedEvIndex)];
      finalCarModel = ev.model;
      finalBatteryCapacity = ev.capacity;
    } else {
      finalCarModel = '';
      finalBatteryCapacity = 0;
    }
    const result = await updateProfile({ name, carModel: finalCarModel, batteryCapacityKwh: finalBatteryCapacity });
    setUpdatingProfile(false);
    if (result.success) {
      setProfileSuccessMsg('Profile updated successfully!');
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } else {
      alert('Failed to update profile.');
    }
  };

  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const totalSpent = bookings.filter((b) => b.status === 'completed').reduce((a, b) => a + b.estimatedCost, 0);

  return (
    <div className="flex-1 relative" style={{ background: 'var(--deep-navy)', minHeight: '100vh' }}>
      <LiquidEnergyBackground />

      <div className="relative z-10 p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-slide-up">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#39ff14' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#39ff14' }}>Driver Dashboard</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">My EV Hub</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Manage your vehicle · track sessions · explore the network
            </p>
          </div>
          <Link
            to="/calculator"
            id="open-range-calc-btn"
            className="neon-btn px-5 py-2.5 rounded-xl flex items-center space-x-2 text-sm"
          >
            <Calculator className="h-4 w-4" />
            <span>Range Calculator</span>
          </Link>
        </div>

        {/* ── Quick Stats ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: <Activity className="h-5 w-5" />, label: 'Sessions Done', value: completedCount, color: '#39ff14', bg: 'rgba(57,255,20,0.08)' },
            { icon: <Zap className="h-5 w-5" />,      label: 'Total Spent',   value: `$${totalSpent.toFixed(0)}`, color: '#00e5ff', bg: 'rgba(0,229,255,0.08)' },
            { icon: <Battery className="h-5 w-5" />,  label: 'Battery Size',  value: user?.batteryCapacityKwh ? `${user.batteryCapacityKwh} kWh` : '—', color: '#ffd60a', bg: 'rgba(255,214,10,0.08)' },
          ].map((s) => (
            <div key={s.label} className="stat-card flex items-center space-x-3">
              <div className="p-2.5 rounded-xl shrink-0" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div>
                <p className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Profile Card */}
          <div>
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(57,255,20,0.06) 0%, transparent 70%)' }} />

              <div className="flex justify-between items-center pb-4 mb-4" style={{ borderBottom: '1px solid rgba(57,255,20,0.08)' }}>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" style={{ color: '#39ff14' }} />
                  <h3 className="font-extrabold text-white text-sm">EV Profile</h3>
                </div>
                {!isEditingProfile && (
                  <button
                    id="edit-profile-btn"
                    onClick={() => setIsEditingProfile(true)}
                    className="text-xs font-bold flex items-center space-x-1 transition-colors hover:opacity-80"
                    style={{ color: '#39ff14' }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {profileSuccessMsg && (
                <div className="mb-4 flex items-center space-x-2 p-2.5 rounded-xl text-xs" style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.2)', color: '#39ff14' }}>
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold tracking-widest mb-1.5" style={{ color: 'var(--text-secondary)' }}>Driver Name</label>
                    <input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="cs-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold tracking-widest mb-1.5" style={{ color: 'var(--text-secondary)' }}>Select Car Model</label>
                    <select
                      id="profile-car-select"
                      value={selectedEvIndex}
                      onChange={(e) => setSelectedEvIndex(e.target.value)}
                      className="cs-input"
                    >
                      <option value="">No Vehicle Listed</option>
                      {POPULAR_EVS.map((ev, index) => (
                        <option key={index} value={index}>{ev.model} ({ev.capacity} kWh)</option>
                      ))}
                      <option value="other">Other / Custom</option>
                    </select>
                  </div>

                  {selectedEvIndex === 'other' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-gray-400 mb-1">Model Name</label>
                        <input type="text" value={customEvName} onChange={(e) => setCustomEvName(e.target.value)} placeholder="e.g. ZS EV" className="cs-input text-xs py-2" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-400 mb-1">Battery (kWh)</label>
                        <input type="number" value={customEvCapacity} onChange={(e) => setCustomEvCapacity(e.target.value)} placeholder="50" className="cs-input text-xs py-2" />
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="neon-btn flex-1 py-2.5 rounded-xl text-xs"
                    >
                      {updatingProfile ? 'Saving…' : 'Save Profile'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors"
                      style={{ background: 'rgba(57,255,20,0.04)', border: '1px solid rgba(57,255,20,0.1)', color: 'var(--text-secondary)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* User info */}
                  <div>
                    <p className="text-[10px] uppercase font-semibold tracking-widest" style={{ color: 'var(--text-secondary)' }}>Account</p>
                    <h4 className="font-extrabold text-white text-sm mt-1">{user?.name}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                  </div>

                  {/* Battery ring visualization */}
                  {user?.batteryCapacityKwh ? (
                    <>
                      <BatteryRing capacity={user.batteryCapacityKwh} />
                      <div className="p-3 rounded-xl space-y-2" style={{ background: 'rgba(57,255,20,0.04)', border: '1px solid rgba(57,255,20,0.08)' }}>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: 'var(--text-secondary)' }}>Model</span>
                          <span className="font-bold text-white">{user.carModel}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: 'var(--text-secondary)' }}>AC Charge (7.4 kW)</span>
                          <span className="font-bold" style={{ color: '#39ff14' }}>~{Math.round(user.batteryCapacityKwh / 7.4)} hrs</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: 'var(--text-secondary)' }}>DC Fast (50 kW)</span>
                          <span className="font-bold" style={{ color: '#00e5ff' }}>~{Math.round((user.batteryCapacityKwh / 50) * 60)} min</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-6 text-center rounded-xl" style={{ background: 'rgba(57,255,20,0.03)', border: '1px dashed rgba(57,255,20,0.12)' }}>
                      <Battery className="h-8 w-8 mx-auto mb-2" style={{ color: '#39ff14', opacity: 0.3 }} />
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No vehicle listed. Edit profile to add your EV specs.</p>
                    </div>
                  )}

                  {/* Quick action */}
                  <Link to="/" className="flex items-center justify-between text-xs font-bold py-3 px-4 rounded-xl transition-all hover:scale-[1.01]" style={{ background: 'rgba(57,255,20,0.06)', border: '1px solid rgba(57,255,20,0.15)', color: '#39ff14' }}>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Find Nearby Chargers</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Booking History (2/3) */}
          <div className="lg:col-span-2">
            <div className="glass-panel rounded-2xl p-6 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between pb-4 mb-5" style={{ borderBottom: '1px solid rgba(57,255,20,0.08)' }}>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" style={{ color: '#39ff14' }} />
                  <h3 className="font-extrabold text-white text-sm">Charging Sessions</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(57,255,20,0.1)', color: '#39ff14' }}>
                  {bookings.length} bookings
                </span>
              </div>

              {loadingBookings ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(57,255,20,0.2)', borderTopColor: '#39ff14' }} />
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Loading sessions…</p>
                  </div>
                </div>
              ) : bookingError ? (
                <div className="text-xs py-4 text-center" style={{ color: '#ff4d6d' }}>{bookingError}</div>
              ) : bookings.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="p-4 rounded-2xl" style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.1)' }}>
                    <Zap className="h-10 w-10" style={{ color: '#39ff14', opacity: 0.4 }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">No Sessions Yet</h4>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Book a session at a home charger near you.</p>
                  </div>
                  <Link to="/" className="text-xs font-bold flex items-center space-x-1" style={{ color: '#39ff14' }}>
                    <span>Explore map</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((book) => {
                    const chargerInfo = book.chargerId || {};
                    const isCancellable = ['pending', 'confirmed'].includes(book.status);
                    return (
                      <div
                        key={book._id}
                        className="rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200"
                        style={{
                          background: 'rgba(10,14,15,0.7)',
                          border: '1px solid rgba(57,255,20,0.07)',
                        }}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <StatusBadge status={book.status} />
                            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                              Reserved {new Date(book.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-extrabold text-sm text-white">{chargerInfo.title || 'Unknown Charger'}</h4>
                            <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{chargerInfo.address || 'Address unavailable'}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                            <span className="flex items-center" style={{ color: 'var(--text-secondary)' }}>
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(book.scheduledAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center" style={{ color: 'var(--text-secondary)' }}>
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(book.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({book.durationMinutes} min)
                            </span>
                            <span className="flex items-center" style={{ color: '#39ff14' }}>
                              <Zap className="h-3 w-3 mr-1" />
                              {chargerInfo.connectorType || 'AC'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 w-full md:w-auto flex md:flex-col items-center justify-between md:items-end gap-2 border-t md:border-0 pt-3 md:pt-0" style={{ borderColor: 'rgba(57,255,20,0.06)' }}>
                          <div>
                            <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Amount</div>
                            <div className="text-lg font-black" style={{ color: '#39ff14' }}>${book.estimatedCost.toFixed(2)}</div>
                          </div>
                          {isCancellable && (
                            <button
                              id={`cancel-booking-${book._id}`}
                              onClick={() => handleCancelBooking(book._id)}
                              className="text-[10px] px-3 py-1.5 rounded-lg transition-all font-semibold"
                              style={{ color: '#ff4d6d', background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)' }}
                            >
                              Cancel Session
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
