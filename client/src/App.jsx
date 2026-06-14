import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Zap, MapPin, User, LayoutDashboard, Calculator, LogOut, LogIn, UserPlus, FileText } from 'lucide-react';
import LiquidEnergyBackground from './components/LiquidEnergyBackground';
import logo from './logo.png';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import MapPage from './pages/MapPage';
import ChargerDetail from './pages/ChargerDetail';
import BookingPage from './pages/BookingPage';
import UserDashboard from './pages/UserDashboard';
import MerchantDashboard from './pages/MerchantDashboard';
import AddCharger from './pages/AddCharger';
import RangeCalculator from './pages/RangeCalculator';
import MerchantBookings from './pages/MerchantBookings';
import VehicleDashboard from './pages/VehicleDashboard';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--deep-navy)' }}>
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(57,255,20,0.2)', borderTopColor: '#39ff14' }} />
        <Zap className="absolute inset-0 m-auto h-5 w-5" style={{ color: '#39ff14' }} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Connecting to network…</p>
    </div>
  </div>
);

// Protected Route for any authenticated user
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Protected Route for Host/Merchant only
const MerchantRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'merchant') return <Navigate to="/" replace />;
  return children;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center space-x-2.5 group" id="nav-logo">
        <div
          className="p-1 rounded-xl transition-all duration-300 group-hover:scale-110"
          style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.15)', boxShadow: '0 0 12px rgba(57,255,20,0.15)' }}
        >
          <img src={logo} className="h-7 w-7 object-contain" alt="EV Nest Logo" />
        </div>
        <span className="font-black text-xl tracking-tight" style={{ letterSpacing: '-0.03em' }}>
          <span className="text-white">EV </span>
          <span className="neon-text">Nest</span>
        </span>
      </Link>

      <div className="flex items-center space-x-1 sm:space-x-2">
        {user ? (
          <>
            <Link
              to="/"
              id="nav-find-chargers"
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:text-[#39ff14]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Find Chargers</span>
            </Link>

            <Link
              to="/calculator"
              id="nav-range-calc"
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:text-[#39ff14]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span className="hidden md:inline">EV Range</span>
            </Link>

            {user.role === 'merchant' ? (
              <>
                <Link
                  to="/merchant"
                  id="nav-host-panel"
                  className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:text-[#39ff14]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Host Panel</span>
                </Link>
                <Link
                  to="/merchant/bookings"
                  id="nav-bookings"
                  className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:text-[#39ff14]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Bookings</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  id="nav-my-bookings"
                  className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:text-[#39ff14]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">My Sessions</span>
                </Link>
                <Link
                  to="/vehicle"
                  id="nav-vehicle"
                  className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:text-[#39ff14]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Vehicle</span>
                </Link>
              </>
            )}

            <div className="h-4 w-px mx-1 hidden sm:block" style={{ background: 'rgba(57,255,20,0.12)' }} />

            <div className="flex items-center space-x-2">
              {/* User pill */}
              <div
                className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.1)' }}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: '#39ff14', color: '#0a0e0f' }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[11px] font-bold text-white">{user.name}</span>
                  <span className="text-[9px] font-semibold capitalize" style={{ color: '#39ff14' }}>
                    {user.role === 'merchant' ? 'Host' : 'Driver'}
                  </span>
                </div>
              </div>

              <button
                id="nav-logout-btn"
                onClick={handleLogout}
                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200"
                style={{ color: '#ff4d6d' }}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              id="nav-login"
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:text-[#39ff14]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Login</span>
            </Link>
            <Link
              to="/register"
              id="nav-register"
              className="neon-btn flex items-center space-x-1.5 text-xs px-4 py-2 rounded-lg"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/vehicle') || location.pathname.startsWith('/merchant');

  // Only show liquid background on non-map pages (map handles its own bg)
  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ background: 'var(--deep-navy)' }}>
      {!hideNavbar && <Navbar />}
      <main className="flex-1 flex flex-col relative">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Driver & Shared Routes */}
          <Route path="/" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
          <Route path="/charger/:id" element={<ProtectedRoute><ChargerDetail /></ProtectedRoute>} />
          <Route path="/calculator" element={<ProtectedRoute><RangeCalculator /></ProtectedRoute>} />

          {/* Protected Driver Routes */}
          <Route path="/booking/:id" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/vehicle" element={<ProtectedRoute><VehicleDashboard /></ProtectedRoute>} />

          {/* Protected Merchant Routes */}
          <Route path="/merchant" element={<MerchantRoute><MerchantDashboard /></MerchantRoute>} />
          <Route path="/merchant/add" element={<MerchantRoute><AddCharger /></MerchantRoute>} />
          <Route path="/merchant/edit/:id" element={<MerchantRoute><AddCharger /></MerchantRoute>} />
          <Route path="/merchant/bookings" element={<MerchantRoute><MerchantBookings /></MerchantRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
