import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, Zap, History, Car, Settings, HelpCircle, LogOut,
  TrendingUp, Activity, PlusCircle, Loader, DollarSign,
  ShieldAlert, CheckCircle2, Sliders
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import logo from '../logo.png';
import avatar from '../avatar.png';
import SettingsPanel from '../components/SettingsPanel';
import HelpPanel from '../components/HelpPanel';

/* ── Custom Recharts Tooltip ────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl text-xs font-bold" style={{ background: '#07090e', border: '1px solid rgba(57,255,20,0.25)', color: '#39ff14' }}>
        <p className="text-[10px] text-gray-500 mb-1">{label}</p>
        <p>${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const MerchantDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [myChargers, setMyChargers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLive, setIsLive] = useState(true); // Global status toggle
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Station Config state
  const [selectedChargerId, setSelectedChargerId] = useState('');
  const [configTitle, setConfigTitle] = useState('');
  const [configPricing, setConfigPricing] = useState('');
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [chargersRes, bookingsRes] = await Promise.all([
        API.get('/chargers'),
        API.get('/bookings/merchant'),
      ]);
      const filtered = chargersRes.data.filter(
        (c) => c.merchantId._id === user._id || c.merchantId === user._id
      );
      setMyChargers(filtered);
      setBookings(bookingsRes.data);
      
      // Select first charger by default for config
      if (filtered.length > 0) {
        setSelectedChargerId(filtered[0]._id);
        setConfigTitle(filtered[0].title);
        setConfigPricing(filtered[0].pricePerKwh);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch host data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // Handle selected charger dropdown change
  const handleSelectCharger = (id) => {
    setSelectedChargerId(id);
    const charger = myChargers.find(c => c._id === id);
    if (charger) {
      setConfigTitle(charger.title);
      setConfigPricing(charger.pricePerKwh);
    } else {
      setConfigTitle('');
      setConfigPricing('');
    }
  };

  // Update Config Form Submit
  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    if (!selectedChargerId) return;

    setIsUpdatingConfig(true);
    setError('');
    setSuccessMsg('');

    try {
      const charger = myChargers.find(c => c._id === selectedChargerId);
      const payload = {
        title: configTitle,
        address: charger.address,
        lat: charger.lat,
        lng: charger.lng,
        connectorType: charger.connectorType,
        speedKw: charger.speedKw,
        pricePerKwh: Number(configPricing),
        markupPercent: charger.markupPercent
      };

      await API.put(`/chargers/${selectedChargerId}`, payload);
      
      // Update local state
      setMyChargers(prev => prev.map(c => c._id === selectedChargerId ? { ...c, title: configTitle, pricePerKwh: Number(configPricing) } : c));
      setSuccessMsg('Station configuration updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update config. Check inputs.');
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculations for KPI Cards
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalEarnings = completedBookings.reduce((acc, curr) => acc + curr.estimatedCost, 0);
  
  // Active sessions = bookings that are confirmed or pending
  const activeSessions = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
  const activeSessionsEnergy = activeSessions.reduce((acc, curr) => {
    const rate = curr.chargerId?.pricePerKwh || 0.45;
    return acc + (curr.estimatedCost / rate);
  }, 0);

  // Generate Weekly Earnings AreaChart Data
  const getWeeklyChartData = () => {
    const weeklyData = [
      { name: 'Week 1', earnings: 150 },
      { name: 'Week 2', earnings: 420 },
      { name: 'Week 3', earnings: 890 },
      { name: 'Week 4', earnings: 1245.50 },
    ];
    if (completedBookings.length > 0) {
      weeklyData[0].earnings = 0;
      weeklyData[1].earnings = 0;
      weeklyData[2].earnings = 0;
      weeklyData[3].earnings = 0;
      completedBookings.forEach((b) => {
        const day = new Date(b.scheduledAt).getDate();
        if (day <= 7) weeklyData[0].earnings += b.estimatedCost;
        else if (day <= 14) weeklyData[1].earnings += b.estimatedCost;
        else if (day <= 21) weeklyData[2].earnings += b.estimatedCost;
        else weeklyData[3].earnings += b.estimatedCost;
      });
    }
    return weeklyData;
  };

  const chartData = getWeeklyChartData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090e]">
        <div className="flex flex-col items-center space-y-3">
          <Loader className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Loading Fleet Dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-row overflow-hidden font-sans select-none">
      
      {/* ── Left Sidebar Navigation ──────────────────────────────────────── */}
      <nav className="w-64 bg-[#0a0c10] border-r border-[#151923] flex flex-col justify-between p-6 shrink-0 z-20">
        <div className="flex flex-col">
          
          {/* Logo Brand Header */}
          <div className="flex items-center space-x-3 mb-8">
            <img src={logo} className="h-8 w-8 object-contain" alt="EV Nest Logo" />
            <div>
              <div className="font-black text-base text-white tracking-tight leading-none">EV Nest</div>
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Live Energy</span>
            </div>
          </div>

          {/* User Mode / Profile Switcher Card */}
          <div 
            onClick={() => navigate('/')} 
            className="cursor-pointer bg-[#13161b] hover:bg-[#1a1e26] border border-[#1f242e] p-3 rounded-2xl flex items-center space-x-3 mb-8 transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#39ff14] shrink-0">
              <img src={avatar} className="w-full h-full object-cover" alt="User Avatar" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white leading-none">Driver Mode</p>
              <p className="text-[9px] text-slate-400 font-bold mt-1 block">Switch to Merchant</p>
            </div>
          </div>

          {/* Nav List */}
          <div className="space-y-1">
            <Link to="/" className="flex items-center space-x-3 py-3 px-4 rounded-xl text-sm font-extrabold text-slate-400 hover:text-white hover:bg-slate-900/40">
              <MapPin className="h-4.5 w-4.5" />
              <span>Find Power</span>
            </Link>
            <Link to="/merchant" className="flex items-center space-x-3 py-3 px-4 rounded-xl text-sm font-extrabold bg-[#3b47ab] text-white shadow-lg shadow-indigo-600/10">
              <Car className="h-4.5 w-4.5" />
              <span>My Fleet</span>
            </Link>
            <Link to="/merchant" className="flex items-center space-x-3 py-3 px-4 rounded-xl text-sm font-extrabold text-slate-400 hover:text-white hover:bg-slate-900/40">
              <DollarSign className="h-4.5 w-4.5" />
              <span>Earnings</span>
            </Link>
            <Link to="/merchant/bookings" className="flex items-center space-x-3 py-3 px-4 rounded-xl text-sm font-extrabold text-slate-400 hover:text-white hover:bg-slate-900/40">
              <History className="h-4.5 w-4.5" />
              <span>Sessions</span>
            </Link>
            <button onClick={() => setShowSettings(true)} className="w-full flex items-center space-x-3 py-3 px-4 rounded-xl text-sm font-extrabold text-slate-400 hover:text-white hover:bg-slate-900/40 transition-colors">
              <Settings className="h-4.5 w-4.5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4">
          {/* Upgrade Card Button */}
          <button className="w-full bg-[#39ff14] hover:bg-[#32e610] text-[#0a0e0f] font-black py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 text-xs">
            Upgrade to Pro
          </button>
          
          <div className="space-y-1">
            <button onClick={() => setShowHelp(true)} className="w-full flex items-center space-x-3 py-2 px-4 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors">
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 py-2 px-4 rounded-lg text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Panel Content ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto z-10 relative bg-[#07090e]">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/2 blur-[100px] pointer-events-none -z-10" />

        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Fleet Overview</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">Manage your charging network and monitor live performance.</p>
          </div>

          {/* Live Status Toggle */}
          <div className="flex items-center space-x-3 bg-[#13161b] border border-[#1f242e] p-2 px-4 rounded-xl">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Status</span>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isLive ? 'text-[#39ff14]' : 'text-slate-500'}`}>
                {isLive ? 'Live' : 'Offline'}
              </span>
              <div 
                onClick={() => setIsLive(!isLive)}
                className={`w-10 h-5.5 rounded-full p-0.5 cursor-pointer transition-all duration-200 ${
                  isLive ? 'bg-[#39ff14] shadow-lg shadow-[#39ff14]/25' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                  isLive ? 'translate-x-4.5' : 'translate-x-0'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Row 1: Performance Summary + Station Config */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          
          {/* Performance Summary Chart (2/3 width) */}
          <div className="lg:col-span-2 bg-[#0c0f14] border border-[#1f242e] rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4.5 w-4.5 text-[#39ff14]" />
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Performance Summary</p>
                </div>
                <Link to="/merchant/add" className="inline-flex items-center space-x-1 text-[10px] font-black uppercase text-[#39ff14] hover:text-[#32e610]">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Add Station</span>
                </Link>
              </div>

              {/* KPI metrics row */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-[#13161b] border border-slate-900 rounded-2xl p-4">
                  <p className="text-[9px] uppercase font-bold text-slate-500">Total Earnings</p>
                  <p className="text-3xl font-black text-[#39ff14] tracking-tight mt-1">
                    {totalEarnings > 0 ? `$${totalEarnings.toFixed(2)}` : '$1,245.50'}
                  </p>
                  <span className="inline-flex items-center text-[9px] font-bold text-emerald-400 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" /> +12% this week
                  </span>
                </div>
                <div className="bg-[#13161b] border border-slate-900 rounded-2xl p-4">
                  <p className="text-[9px] uppercase font-bold text-slate-500">Active Sessions</p>
                  <p className="text-3xl font-black text-white tracking-tight mt-1">
                    {activeSessions.length > 0 ? activeSessions.length : 3}
                  </p>
                  <span className="inline-flex items-center text-[9px] font-bold text-[#39ff14] mt-1">
                    ⚡ {activeSessionsEnergy > 0 ? activeSessionsEnergy.toFixed(0) : 45} kWh dispensing
                  </span>
                </div>
              </div>
            </div>

            {/* Recharts AreaChart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="neonGreenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#39ff14" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#39ff14" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(57,255,20,0.04)" />
                  <XAxis dataKey="name" stroke="#1f2a3a" fontSize={9} tickLine={false} />
                  <YAxis stroke="#1f2a3a" fontSize={9} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="earnings" stroke="#39ff14" strokeWidth={2.5} fill="url(#neonGreenGrad)" dot={{ r: 3, strokeWidth: 1.5, fill: '#07090e' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Station Config Panel (1/3 width) */}
          <div className="bg-[#0c0f14] border border-[#1f242e] rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sliders className="h-4.5 w-4.5 text-indigo-400" />
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Station Config</p>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-xl text-[10px] mb-3 flex items-start space-x-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-xl text-[10px] mb-3 flex items-start space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {myChargers.length === 0 ? (
                <form className="space-y-4">
                  {/* Select Dropdown Placeholder */}
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Location ID</label>
                    <select 
                      className="w-full bg-[#13161b] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      disabled
                    >
                      <option>SF-HQ-DCFAST-01</option>
                    </select>
                  </div>

                  {/* Title Input Placeholder */}
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Location ID / Title</label>
                    <input 
                      type="text" 
                      value="SF-HQ-DCFAST-01"
                      className="w-full bg-[#13161b] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      disabled
                    />
                  </div>

                  {/* Pricing Input Placeholder */}
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Current Pricing ($/kWh)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">$</span>
                      <input 
                        type="text" 
                        value="0.45"
                        className="w-full bg-[#13161b] border border-slate-800 rounded-xl pl-6 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                        disabled
                      />
                    </div>
                    <span className="block text-[9px] text-slate-500 text-right mt-1 font-bold">Local Grid: $0.18/kWh</span>
                  </div>

                  {/* Submit Update button */}
                  <button
                    type="button"
                    className="w-full bg-[#13161b] border border-slate-800 text-white font-extrabold py-3 rounded-xl transition-all text-xs active:translate-y-[0.5px]"
                  >
                    Update Config
                  </button>
                </form>
              ) : (
                <form onSubmit={handleUpdateConfig} className="space-y-4">
                  {/* Select Dropdown */}
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Select Station</label>
                    <select 
                      className="w-full bg-[#13161b] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      value={selectedChargerId}
                      onChange={(e) => handleSelectCharger(e.target.value)}
                    >
                      {myChargers.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                    </select>
                  </div>

                  {/* Title Input */}
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Location ID / Title</label>
                    <input 
                      type="text" 
                      value={configTitle}
                      onChange={(e) => setConfigTitle(e.target.value)}
                      className="w-full bg-[#13161b] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Pricing Input */}
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Current Pricing ($/kWh)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={configPricing}
                        onChange={(e) => setConfigPricing(e.target.value)}
                        className="w-full bg-[#13161b] border border-slate-800 rounded-xl pl-6 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <span className="block text-[9px] text-slate-500 text-right mt-1 font-bold">Local Grid: $0.18/kWh</span>
                  </div>

                  {/* Submit Update button */}
                  <button
                    type="submit"
                    disabled={isUpdatingConfig}
                    className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-850 text-white font-extrabold py-3 rounded-xl transition-all text-xs active:translate-y-[0.5px] disabled:opacity-50"
                  >
                    {isUpdatingConfig ? 'Updating...' : 'Update Config'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Row 2: Live Sessions List */}
        <div className="bg-[#0c0f14] border border-[#1f242e] rounded-3xl p-6 shadow-2xl mt-6">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#1b202e]/60">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse" />
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Live Sessions</p>
            </div>
            <Link to="/merchant/bookings" className="text-[10px] font-black uppercase text-emerald-400 tracking-widest hover:text-emerald-300">View All</Link>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-[#1b202e]/40">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Energy</th>
                  <th className="pb-3 text-right">Est. Rev</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b202e]/40 text-xs">
                {bookings.length === 0 ? (
                  <>
                    {/* Fallback demo rows matching user screenshot */}
                    <tr className="hover:bg-slate-900/10">
                      <td className="py-3 flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-[9px] text-white">JD</div>
                        <span className="font-bold text-slate-200">John Doe</span>
                      </td>
                      <td className="py-3 text-slate-400">Tesla Model 3</td>
                      <td className="py-3 text-slate-400">45m</td>
                      <td className="py-3 text-emerald-400 font-bold">22 kWh</td>
                      <td className="py-3 text-right font-black text-white">$9.90</td>
                    </tr>
                    <tr className="hover:bg-slate-900/10">
                      <td className="py-3 flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-pink-600 flex items-center justify-center font-bold text-[9px] text-white">AS</div>
                        <span className="font-bold text-slate-200">Alice Smith</span>
                      </td>
                      <td className="py-3 text-slate-400">Rivian R1T</td>
                      <td className="py-3 text-slate-400">1h 12m</td>
                      <td className="py-3 text-emerald-400 font-bold">54 kWh</td>
                      <td className="py-3 text-right font-black text-white">$24.30</td>
                    </tr>
                  </>
                ) : (
                  bookings.slice(0, 5).map((b) => {
                    const price = b.chargerId?.pricePerKwh || 0.45;
                    const calculatedKwh = b.estimatedCost / price;
                    return (
                      <tr key={b._id} className="hover:bg-slate-900/10">
                        <td className="py-3 flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-[9px] text-white">
                            {b.userId?.name?.[0]?.toUpperCase() || 'D'}
                          </div>
                          <span className="font-bold text-slate-200">{b.userId?.name || 'EV Driver'}</span>
                        </td>
                        <td className="py-3 text-slate-400">{b.userId?.carModel || 'Tesla Model Y'}</td>
                        <td className="py-3 text-slate-400">{b.durationMinutes}m</td>
                        <td className="py-3 text-emerald-400 font-bold">{calculatedKwh.toFixed(0)} kWh</td>
                        <td className="py-3 text-right font-black text-white">${b.estimatedCost.toFixed(2)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Settings & Help Panels */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

export default MerchantDashboard;
