import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, Clock, User, Check, X,
  Loader, FileText, CheckCircle2, Zap, DollarSign
} from 'lucide-react';
import LiquidEnergyBackground from '../components/LiquidEnergyBackground';

const StatusBadge = ({ status }) => {
  const map = {
    confirmed: { cls: 'badge-confirmed', label: 'Confirmed' },
    completed: { cls: 'badge-completed', label: 'Completed' },
    cancelled: { cls: 'badge-cancelled', label: 'Cancelled' },
    pending:   { cls: 'badge-pending',   label: 'Pending'   },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
};

const MerchantBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/bookings/merchant');
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    const actionText = newStatus === 'confirmed' ? 'confirm' : 'cancel';
    if (!window.confirm(`Are you sure you want to ${actionText} this booking?`)) return;
    try {
      await API.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update reservation status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--deep-navy)' }}>
        <div className="flex flex-col items-center space-y-3">
          <Loader className="h-8 w-8 animate-spin" style={{ color: '#39ff14' }} />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Fetching reservations…</p>
        </div>
      </div>
    );
  }

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const grossRevenue = bookings.filter((b) => b.status === 'completed').reduce((a, b) => a + b.estimatedCost, 0);

  return (
    <div className="flex-1 relative" style={{ background: 'var(--deep-navy)', minHeight: '100vh' }}>
      <LiquidEnergyBackground />

      <div className="relative z-10 p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-slide-up">

        {/* Header */}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: pendingCount > 0 ? '#ffd60a' : '#39ff14' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: pendingCount > 0 ? '#ffd60a' : '#39ff14' }}>
              {pendingCount > 0 ? `${pendingCount} pending approval` : 'All clear'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Incoming Bookings</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Confirm or manage charging sessions from drivers
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: <FileText className="h-5 w-5" />, label: 'Total Bookings', value: bookings.length, color: '#39ff14', bg: 'rgba(57,255,20,0.08)' },
            { icon: <Zap className="h-5 w-5" />, label: 'Awaiting Approval', value: pendingCount, color: '#ffd60a', bg: 'rgba(255,214,10,0.08)' },
            { icon: <DollarSign className="h-5 w-5" />, label: 'Gross Revenue', value: `$${grossRevenue.toFixed(0)}`, color: '#00e5ff', bg: 'rgba(0,229,255,0.08)' },
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

        {error && (
          <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)', color: '#ff4d6d' }}>
            {error}
          </div>
        )}

        {/* Bookings List */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center space-x-2 pb-4 mb-5" style={{ borderBottom: '1px solid rgba(57,255,20,0.08)' }}>
            <FileText className="h-4 w-4" style={{ color: '#39ff14' }} />
            <h3 className="font-extrabold text-white text-sm">Reservation Queue</h3>
          </div>

          {bookings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.1)' }}>
                <Zap className="h-10 w-10" style={{ color: '#39ff14', opacity: 0.4 }} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">No Reservations Yet</h4>
                <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                  Once drivers find your chargers on the map, their bookings will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((book) => {
                const driver = book.userId || {};
                const charger = book.chargerId || {};
                const isPending = book.status === 'pending';
                const isConfirmed = book.status === 'confirmed';

                return (
                  <div
                    key={book._id}
                    className="rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200"
                    style={{
                      background: 'rgba(10,14,15,0.7)',
                      border: `1px solid ${isPending ? 'rgba(255,214,10,0.2)' : 'rgba(57,255,20,0.07)'}`,
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <StatusBadge status={book.status} />
                        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                          #{book._id.substring(12)}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <div className="flex items-center text-sm font-extrabold text-white">
                          <User className="h-4 w-4 mr-1.5" style={{ color: 'var(--text-secondary)' }} />
                          <span>{driver.name || 'Anonymous Driver'}</span>
                        </div>
                        {driver.carModel && (
                          <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ background: 'rgba(57,255,20,0.06)', border: '1px solid rgba(57,255,20,0.12)', color: '#39ff14' }}>
                            🚗 {driver.carModel}
                          </span>
                        )}
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
                        <span className="flex items-center font-semibold" style={{ color: '#39ff14' }}>
                          ⚡ {charger.title || 'Charger station'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 w-full md:w-auto flex md:flex-col items-center justify-between md:items-end gap-3 border-t md:border-0 pt-3 md:pt-0" style={{ borderColor: 'rgba(57,255,20,0.06)' }}>
                      <div>
                        <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Gross Earnings</div>
                        <div className="text-base font-black" style={{ color: '#39ff14' }}>${book.estimatedCost.toFixed(2)}</div>
                      </div>

                      {isPending && (
                        <div className="flex items-center space-x-1.5">
                          <button
                            id={`confirm-booking-${book._id}`}
                            onClick={() => handleUpdateStatus(book._id, 'confirmed')}
                            className="neon-btn px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Confirm</span>
                          </button>
                          <button
                            id={`reject-booking-${book._id}`}
                            onClick={() => handleUpdateStatus(book._id, 'cancelled')}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all"
                            style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)', color: '#ff4d6d' }}
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}

                      {isConfirmed && (
                        <button
                          id={`complete-booking-${book._id}`}
                          onClick={() => handleUpdateStatus(book._id, 'completed')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all"
                          style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff' }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Complete Session</span>
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
  );
};

export default MerchantBookings;
