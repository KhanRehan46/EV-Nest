import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X, User, Bell, Shield, Palette, ChevronRight,
  Save, Loader, CheckCircle2, AlertTriangle, Moon, Sun,
  Smartphone, Mail, Zap, Globe, Lock, Trash2, Eye, EyeOff
} from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
];

const SettingsPanel = ({ isOpen, onClose }) => {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [carModel, setCarModel] = useState('');
  const [batteryCapacity, setBatteryCapacity] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  // Notification preferences (local state)
  const [notifs, setNotifs] = useState({
    chargingComplete: true,
    sessionStart: true,
    priceAlerts: false,
    weeklyReport: true,
    pushEnabled: true,
    emailEnabled: true,
  });

  // Appearance
  const [theme, setTheme] = useState('dark');

  // Security
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setCarModel(user.carModel || '');
      setBatteryCapacity(user.batteryCapacity || '');
    }
  }, [user]);

  // Reset state when panel closes
  useEffect(() => {
    if (!isOpen) {
      setSaveMsg('');
      setSaveError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    setSaveError('');
    try {
      const result = await updateProfile({ name, carModel, batteryCapacity: Number(batteryCapacity) });
      if (result.success) {
        setSaveMsg('Profile updated successfully!');
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveError(result.error);
      }
    } catch {
      setSaveError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSaveError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setSaveError('Password must be at least 6 characters.');
      return;
    }
    setSaveMsg('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const toggleNotif = (key) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  const renderToggle = (value, onChange) => (
    <div
      onClick={onChange}
      className={`w-10 h-[22px] rounded-full p-0.5 cursor-pointer transition-all duration-200 shrink-0 ${
        value ? 'bg-[#39ff14] shadow-lg shadow-[#39ff14]/20' : 'bg-slate-700'
      }`}
    >
      <div
        className={`w-[18px] h-[18px] rounded-full bg-white transition-transform duration-200 ${
          value ? 'translate-x-[18px]' : 'translate-x-0'
        }`}
      />
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-[#0a0c10] border-l border-[#1f242e] z-[101] flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1f242e]">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Settings</h2>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider">Manage your account</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#13161b] border border-[#1f242e] flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Row */}
        <div className="flex px-6 pt-4 pb-0 space-x-1 border-b border-[#1f242e]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSaveMsg(''); setSaveError(''); }}
                className={`flex items-center space-x-1.5 px-3 py-2.5 text-[11px] font-bold rounded-t-xl transition-all duration-200 border-b-2 ${
                  isActive
                    ? 'text-[#39ff14] border-[#39ff14] bg-[#39ff14]/5'
                    : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Messages */}
          {saveMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{saveMsg}</span>
            </div>
          )}
          {saveError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-bold flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* ─── Profile Tab ─── */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4 bg-[#13161b] border border-[#1f242e] rounded-2xl p-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#39ff14] to-emerald-600 flex items-center justify-center text-xl font-black text-[#0a0e0f] shadow-lg shadow-emerald-500/20">
                  {name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-white">{name || 'User'}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    {user?.role === 'merchant' ? 'Host Account' : 'Driver Account'}
                  </p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#39ff14] bg-[#39ff14]/10 px-2.5 py-1 rounded-lg">
                  {user?.role === 'merchant' ? 'Pro' : 'Free'}
                </span>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-1.5 tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#13161b] border border-[#1f242e] rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-[#39ff14]/40 transition-colors"
                  required
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-1.5 tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <input
                    type="email"
                    value={email}
                    className="w-full bg-[#13161b] border border-[#1f242e] rounded-xl pl-10 pr-4 py-3 text-sm text-slate-400 font-medium cursor-not-allowed"
                    readOnly
                  />
                </div>
                <p className="text-[9px] text-slate-600 mt-1 font-medium">Email cannot be changed</p>
              </div>

              {/* Car Model */}
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-1.5 tracking-wider">Vehicle Model</label>
                <input
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="e.g. Tesla Model 3"
                  className="w-full bg-[#13161b] border border-[#1f242e] rounded-xl px-4 py-3 text-sm text-white font-medium placeholder:text-slate-700 focus:outline-none focus:border-[#39ff14]/40 transition-colors"
                />
              </div>

              {/* Battery Capacity */}
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-1.5 tracking-wider">Battery Capacity (kWh)</label>
                <div className="relative">
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <input
                    type="number"
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(e.target.value)}
                    placeholder="e.g. 75"
                    className="w-full bg-[#13161b] border border-[#1f242e] rounded-xl pl-10 pr-4 py-3 text-sm text-white font-medium placeholder:text-slate-700 focus:outline-none focus:border-[#39ff14]/40 transition-colors"
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#39ff14] hover:bg-[#32e610] text-[#0a0e0f] font-black py-3 rounded-xl flex items-center justify-center space-x-2 transition-all text-xs uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-lg shadow-emerald-500/15"
              >
                {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{saving ? 'Saving…' : 'Save Changes'}</span>
              </button>
            </form>
          )}

          {/* ─── Notifications Tab ─── */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="bg-[#13161b] border border-[#1f242e] rounded-2xl p-4 space-y-4">
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Charging Alerts</p>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Charging Complete</p>
                      <p className="text-[9px] text-slate-500 font-medium">Notify when session ends</p>
                    </div>
                  </div>
                  {renderToggle(notifs.chargingComplete, () => toggleNotif('chargingComplete'))}
                </div>

                <div className="h-px bg-[#1f242e]" />

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Session Started</p>
                      <p className="text-[9px] text-slate-500 font-medium">Confirm charging has begun</p>
                    </div>
                  </div>
                  {renderToggle(notifs.sessionStart, () => toggleNotif('sessionStart'))}
                </div>

                <div className="h-px bg-[#1f242e]" />

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Globe className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Price Alerts</p>
                      <p className="text-[9px] text-slate-500 font-medium">When nearby prices drop</p>
                    </div>
                  </div>
                  {renderToggle(notifs.priceAlerts, () => toggleNotif('priceAlerts'))}
                </div>

                <div className="h-px bg-[#1f242e]" />

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Weekly Report</p>
                      <p className="text-[9px] text-slate-500 font-medium">Usage and savings summary</p>
                    </div>
                  </div>
                  {renderToggle(notifs.weeklyReport, () => toggleNotif('weeklyReport'))}
                </div>
              </div>

              <div className="bg-[#13161b] border border-[#1f242e] rounded-2xl p-4 space-y-4">
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Delivery Channels</p>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Push Notifications</p>
                      <p className="text-[9px] text-slate-500 font-medium">In-app and mobile push</p>
                    </div>
                  </div>
                  {renderToggle(notifs.pushEnabled, () => toggleNotif('pushEnabled'))}
                </div>

                <div className="h-px bg-[#1f242e]" />

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Email Notifications</p>
                      <p className="text-[9px] text-slate-500 font-medium">Important updates via email</p>
                    </div>
                  </div>
                  {renderToggle(notifs.emailEnabled, () => toggleNotif('emailEnabled'))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Appearance Tab ─── */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="bg-[#13161b] border border-[#1f242e] rounded-2xl p-4 space-y-4">
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Theme</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center space-y-2.5 p-4 rounded-2xl border-2 transition-all duration-200 ${
                      theme === 'dark'
                        ? 'border-[#39ff14] bg-[#39ff14]/5 shadow-lg shadow-[#39ff14]/10'
                        : 'border-[#1f242e] hover:border-slate-600'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#07090e] border border-[#1f242e] flex items-center justify-center">
                      <Moon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <span className="text-xs font-bold text-white">Dark Mode</span>
                    {theme === 'dark' && (
                      <span className="text-[9px] font-black text-[#39ff14] uppercase tracking-wider">Active</span>
                    )}
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center space-y-2.5 p-4 rounded-2xl border-2 transition-all duration-200 ${
                      theme === 'light'
                        ? 'border-[#39ff14] bg-[#39ff14]/5 shadow-lg shadow-[#39ff14]/10'
                        : 'border-[#1f242e] hover:border-slate-600'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center">
                      <Sun className="h-5 w-5 text-amber-500" />
                    </div>
                    <span className="text-xs font-bold text-white">Light Mode</span>
                    {theme === 'light' && (
                      <span className="text-[9px] font-black text-[#39ff14] uppercase tracking-wider">Active</span>
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-slate-600 font-medium text-center">Light mode coming soon — stay tuned!</p>
              </div>

              <div className="bg-[#13161b] border border-[#1f242e] rounded-2xl p-4 space-y-4">
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Accent Color</p>
                <div className="flex space-x-3">
                  {['#39ff14', '#00d4ff', '#a855f7', '#f97316', '#ef4444'].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white/30 transition-all hover:scale-110"
                      style={{ background: color, boxShadow: color === '#39ff14' ? '0 0 12px rgba(57,255,20,0.4)' : 'none' }}
                    />
                  ))}
                </div>
                <p className="text-[9px] text-slate-600 font-medium">Custom accent colors available on Pro plan</p>
              </div>
            </div>
          )}

          {/* ─── Security Tab ─── */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <form onSubmit={handlePasswordChange} className="bg-[#13161b] border border-[#1f242e] rounded-2xl p-4 space-y-4">
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Change Password</p>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#0a0c10] border border-[#1f242e] rounded-xl pl-10 pr-10 py-3 text-sm text-white font-medium focus:outline-none focus:border-[#39ff14]/40 transition-colors"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#0a0c10] border border-[#1f242e] rounded-xl pl-10 pr-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-[#39ff14]/40 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#0a0c10] border border-[#1f242e] rounded-xl pl-10 pr-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-[#39ff14]/40 transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#13161b] hover:bg-[#1a1e26] border border-[#1f242e] text-white font-black py-3 rounded-xl flex items-center justify-center space-x-2 transition-all text-xs"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Update Password</span>
                </button>
              </form>

              {/* Danger Zone */}
              <div className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-4 space-y-3">
                <p className="text-[10px] uppercase font-black text-rose-400 tracking-wider">Danger Zone</p>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Once you delete your account, there is no going back. All your data including bookings, sessions, and earnings will be permanently removed.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      logout();
                    }
                  }}
                  className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-black py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
};

export default SettingsPanel;
