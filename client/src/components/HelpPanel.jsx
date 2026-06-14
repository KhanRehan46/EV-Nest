import React, { useState } from 'react';
import {
  X, ChevronDown, ChevronRight, Search, Zap, MapPin,
  Shield, DollarSign, Car, HelpCircle, MessageCircle,
  Mail, ExternalLink, BookOpen, Lightbulb, AlertTriangle
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    category: 'Getting Started',
    icon: Zap,
    color: '#39ff14',
    questions: [
      {
        q: 'How do I find a charging station?',
        a: 'Navigate to the map view from "Find Power" in the sidebar or top nav. The map shows all nearby stations with real-time pricing and availability. Tap any marker to see station details, connector types, and current pricing.',
      },
      {
        q: 'How do I book a charging session?',
        a: 'Select a station on the map, choose your preferred time slot, and tap "Book Session." You\'ll see the estimated cost and duration before confirming. The booking will be held for 15 minutes.',
      },
      {
        q: 'What connector types are supported?',
        a: 'EV Nest supports CCS (Combined Charging System), CHAdeMO, and Type 2 connectors. Each station listing shows its available connector type so you can verify compatibility with your vehicle.',
      },
    ],
  },
  {
    category: 'Pricing & Payments',
    icon: DollarSign,
    color: '#00d4ff',
    questions: [
      {
        q: 'How is pricing determined?',
        a: 'Station hosts set their own pricing per kWh. You\'ll always see the current rate before booking. The AI assistant can also help you find the cheapest options nearby.',
      },
      {
        q: 'When am I charged?',
        a: 'You are charged after your session completes. The final cost is based on the actual energy consumed (kWh) multiplied by the station rate. An estimated cost is shown before booking.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes, EV Nest uses industry-standard encryption and never stores your full payment details on our servers. All transactions are processed through our secure payment partner.',
      },
    ],
  },
  {
    category: 'For Hosts',
    icon: Car,
    color: '#a855f7',
    questions: [
      {
        q: 'How do I list my charger?',
        a: 'Navigate to your Fleet Overview dashboard and click "Add Station." Fill in your location details, connector type, speed, and pricing. Your station will go live after a brief verification.',
      },
      {
        q: 'How do I track my earnings?',
        a: 'Your Fleet Overview dashboard shows real-time earnings, active sessions, and performance charts. You can also view detailed session history from the Sessions page.',
      },
      {
        q: 'Can I set my own pricing?',
        a: 'Yes! You have full control over your per-kWh pricing. Use the Station Config panel in your dashboard to adjust pricing at any time. You can also see the local grid rate for reference.',
      },
    ],
  },
  {
    category: 'Troubleshooting',
    icon: AlertTriangle,
    color: '#f97316',
    questions: [
      {
        q: 'My session didn\'t start — what do I do?',
        a: 'Ensure your vehicle is properly connected and the station shows as "available." Try unplugging and reconnecting. If the issue persists, contact support with your booking ID.',
      },
      {
        q: 'I was overcharged for a session',
        a: 'Check the session details in your dashboard for the exact kWh consumed. If you believe there\'s a discrepancy, reach out to support with the session ID and we\'ll investigate.',
      },
      {
        q: 'The map isn\'t loading stations',
        a: 'Ensure location permissions are enabled in your browser. Try refreshing the page. If the issue continues, check your internet connection or try clearing your browser cache.',
      },
    ],
  },
];

const CONTACT_OPTIONS = [
  {
    icon: MessageCircle,
    title: 'Live Chat',
    desc: 'Chat with our AI assistant',
    action: 'Open Chat',
    color: '#39ff14',
  },
  {
    icon: Mail,
    title: 'Email Support',
    desc: 'support@evnest.com',
    action: 'Send Email',
    color: '#00d4ff',
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    desc: 'Guides & API docs',
    action: 'View Docs',
    color: '#a855f7',
  },
];

const HelpPanel = ({ isOpen, onClose }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('faq'); // 'faq' or 'contact'

  if (!isOpen) return null;

  const toggleFaq = (key) => {
    setExpandedFaq(expandedFaq === key ? null : key);
  };

  // Filter FAQ by search
  const filteredFaqs = FAQ_ITEMS.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0);

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
            <h2 className="text-lg font-black text-white tracking-tight">Help Center</h2>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider">Support & FAQ</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#13161b] border border-[#1f242e] flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Section Toggle */}
        <div className="flex px-6 pt-4 pb-0 space-x-1 border-b border-[#1f242e]">
          <button
            onClick={() => setActiveSection('faq')}
            className={`flex items-center space-x-1.5 px-4 py-2.5 text-[11px] font-bold rounded-t-xl transition-all duration-200 border-b-2 ${
              activeSection === 'faq'
                ? 'text-[#39ff14] border-[#39ff14] bg-[#39ff14]/5'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>FAQ</span>
          </button>
          <button
            onClick={() => setActiveSection('contact')}
            className={`flex items-center space-x-1.5 px-4 py-2.5 text-[11px] font-bold rounded-t-xl transition-all duration-200 border-b-2 ${
              activeSection === 'contact'
                ? 'text-[#39ff14] border-[#39ff14] bg-[#39ff14]/5'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Contact Us</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeSection === 'faq' && (
            <div className="space-y-5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search frequently asked questions…"
                  className="w-full bg-[#13161b] border border-[#1f242e] rounded-xl pl-10 pr-4 py-3 text-sm text-white font-medium placeholder:text-slate-600 focus:outline-none focus:border-[#39ff14]/40 transition-colors"
                />
              </div>

              {/* Quick Tip */}
              <div className="bg-[#39ff14]/5 border border-[#39ff14]/15 rounded-2xl p-4 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#39ff14]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="h-4 w-4 text-[#39ff14]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Pro Tip</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">
                    Use the AI Chat Assistant (bottom-right corner) for instant answers to any question about charging, pricing, or your account.
                  </p>
                </div>
              </div>

              {/* FAQ Categories */}
              {filteredFaqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Search className="h-8 w-8 text-slate-700" />
                  <p className="text-sm font-bold text-slate-500">No results found</p>
                  <p className="text-[10px] text-slate-600 font-medium">Try a different search term</p>
                </div>
              ) : (
                filteredFaqs.map((category) => {
                  const CatIcon = category.icon;
                  return (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center space-x-2 mb-3">
                        <CatIcon className="h-4 w-4" style={{ color: category.color }} />
                        <p className="text-[10px] uppercase font-black tracking-wider" style={{ color: category.color }}>
                          {category.category}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        {category.questions.map((item, idx) => {
                          const key = `${category.category}-${idx}`;
                          const isExpanded = expandedFaq === key;
                          return (
                            <div
                              key={key}
                              className={`bg-[#13161b] border rounded-2xl overflow-hidden transition-all duration-200 ${
                                isExpanded ? 'border-[#39ff14]/20' : 'border-[#1f242e] hover:border-slate-700'
                              }`}
                            >
                              <button
                                onClick={() => toggleFaq(key)}
                                className="w-full flex items-center justify-between p-4 text-left"
                              >
                                <span className="text-xs font-bold text-white pr-4 leading-relaxed">{item.q}</span>
                                <div className={`shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                  <ChevronDown className="h-4 w-4 text-slate-500" />
                                </div>
                              </button>
                              {isExpanded && (
                                <div className="px-4 pb-4 pt-0">
                                  <div className="h-px bg-[#1f242e] mb-3" />
                                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{item.a}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="space-y-5">
              {/* Contact Cards */}
              <div className="space-y-3">
                {CONTACT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.title}
                      className="bg-[#13161b] border border-[#1f242e] rounded-2xl p-4 flex items-center space-x-4 hover:border-slate-700 transition-all cursor-pointer group"
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${opt.color}10` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: opt.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{opt.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{opt.desc}</p>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider group-hover:text-white transition-colors" style={{ color: opt.color }}>
                        <span>{opt.action}</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Platform Info Card */}
              <div className="bg-[#13161b] border border-[#1f242e] rounded-2xl p-5 space-y-4">
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Platform Info</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0a0c10] rounded-xl p-3">
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Version</p>
                    <p className="text-sm font-black text-white mt-1">2.4.1</p>
                  </div>
                  <div className="bg-[#0a0c10] rounded-xl p-3">
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Status</p>
                    <div className="flex items-center space-x-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse" />
                      <p className="text-sm font-black text-[#39ff14]">Online</p>
                    </div>
                  </div>
                  <div className="bg-[#0a0c10] rounded-xl p-3">
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Network</p>
                    <p className="text-sm font-black text-white mt-1">Global</p>
                  </div>
                  <div className="bg-[#0a0c10] rounded-xl p-3">
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Uptime</p>
                    <p className="text-sm font-black text-white mt-1">99.9%</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-[#13161b] border border-[#1f242e] rounded-2xl p-4 space-y-3">
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Quick Links</p>
                {[
                  { label: 'Terms of Service', icon: BookOpen },
                  { label: 'Privacy Policy', icon: Shield },
                  { label: 'Community Guidelines', icon: MessageCircle },
                ].map((link) => (
                  <button
                    key={link.label}
                    className="w-full flex items-center justify-between py-2.5 text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <link.icon className="h-3.5 w-3.5 text-slate-600" />
                      <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{link.label}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-700 group-hover:text-slate-400 transition-colors" />
                  </button>
                ))}
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

export default HelpPanel;
