import React, { useState, useRef, useEffect } from 'react';
import API from '../api/axios';
import { Sparkles, X, Send, Bot, MapPin, Zap, AlertCircle, Flame, IndianRupee, BatteryCharging, Navigation, Clock, Shield } from 'lucide-react';

const SUGGESTIONS = [
  { icon: '⚡', label: 'Fastest charger nearby', query: 'Find the fastest charger near me' },
  { icon: '$', label: 'Cheapest under $0.50/kWh', query: 'Find cheapest charger under $0.50 per kWh' },
  { icon: '🔌', label: 'CCS DC fast charger', query: 'Show CCS fast DC chargers near me' },
  { icon: '🏎️', label: 'For Tata Nexon EV', query: 'Find charger for Tata Nexon EV' },
  { icon: '🛣️', label: 'Highway pitstop', query: 'Find highway charging station for long trip' },
  { icon: '🕐', label: 'Open 24/7', query: 'Find a 24 hour charger available now' },
  { icon: '🏙️', label: 'In Mumbai', query: 'Show all chargers in Mumbai' },
  { icon: '🏙️', label: 'In Bangalore', query: 'Show all chargers in Bangalore' },
];

const AIChatWidget = ({ onFlyToCharger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hi! I am your EV Nest Assistant. Tell me your vehicle and what you're looking for, e.g. 'Find a fast charger under $0.60 in San Jose for my Model 3'.",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const sendQuery = async (text) => {
    if (!text.trim()) return;

    const userMessage = { sender: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setIsTyping(true);

    try {
      const { data } = await API.post('/ai/chat', { message: text });
      const aiResponse = {
        sender: 'ai',
        text: data.message || 'Here is what I found for you:',
        chargers: data.chargers || [],
        intent: data.intent || null,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Widget Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I ran into an issue. Please try again.',
          chargers: [],
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    await sendQuery(query);
  };

  const handleSuggestion = (suggestion) => {
    sendQuery(suggestion.query);
  };

  // Show suggestions only when no real conversation has happened yet
  const showSuggestions = messages.length === 1 && messages[0].sender === 'ai';

  return (
    <div className="absolute bottom-6 right-6 z-30 flex flex-col items-end">
      {/* Expanded Chat Dialog Panel */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] mb-4 glass-panel rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-slate-700/80 animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400">
                <Sparkles className="h-4.5 w-4.5 fill-current animate-pulse-slow" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">AI Charger Finder</h4>
                <p className="text-[9px] text-emerald-400/90 font-medium">Powered by Gemini 1.5 Flash</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Bubble Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-start space-x-1.5 max-w-[85%]">
                  {msg.sender === 'ai' && (
                    <div className="bg-slate-900 border border-slate-800 text-slate-400 p-1.5 rounded-lg shrink-0 mt-1">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div
                    className={`px-3 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                        : msg.isError
                          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-tl-none'
                          : 'bg-slate-900/95 border border-slate-850 text-slate-150 rounded-tl-none'
                    }`}
                  >
                    {msg.text}

                    {/* Extracted Intent parameters if debug or helpful */}
                    {msg.sender === 'ai' && msg.intent && (
                      <div className="mt-2 text-[9px] text-slate-500 border-t border-slate-800/60 pt-1 flex flex-wrap gap-1">
                        {msg.intent.location && <span className="bg-slate-950 px-1 py-0.5 rounded">📍 {msg.intent.location}</span>}
                        {msg.intent.maxPrice && <span className="bg-slate-950 px-1 py-0.5 rounded">💰 ≤ ${msg.intent.maxPrice}</span>}
                        {msg.intent.connectorType && <span className="bg-slate-950 px-1 py-0.5 rounded">🔌 {msg.intent.connectorType}</span>}
                        {msg.intent.carModel && <span className="bg-slate-950 px-1 py-0.5 rounded">🚗 {msg.intent.carModel}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Display Chargers if any returned */}
                {msg.chargers && msg.chargers.length > 0 && (
                  <div className="w-full mt-3 pl-7 space-y-2 animate-in fade-in duration-300">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Top matching chargers:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.chargers.map((c) => (
                        <div
                          key={c._id}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between shadow-inner"
                        >
                          <div className="overflow-hidden pr-2">
                            <h5 className="font-bold text-xs text-slate-200 truncate">{c.title}</h5>
                            <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 mt-1">
                              <span className="text-emerald-400 font-bold">{c.speedKw}kW</span>
                              <span>•</span>
                              <span>${c.pricePerKwh}/kWh</span>
                              <span>•</span>
                              <span className="truncate">{c.connectorType}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => onFlyToCharger(c.lat, c.lng)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 px-2 rounded-lg text-[9px] shrink-0 transition-colors flex items-center space-x-1 shadow-md shadow-emerald-500/10 active:translate-y-[0.5px]"
                          >
                            <MapPin className="h-3 w-3" />
                            <span>Show</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Suggestion Chips — visible only before first user message */}
            {showSuggestions && !isTyping && (
              <div className="pt-1 pb-2">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 pl-7">Quick suggestions</p>
                <div className="flex flex-wrap gap-2 pl-7">
                  {SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestion(s)}
                      className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all duration-150 active:scale-95 group shadow-sm"
                    >
                      <span className="text-sm leading-none">{s.icon}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isTyping && (
              <div className="flex items-start space-x-1.5 pl-1.5">
                <div className="bg-slate-900 border border-slate-800 text-slate-400 p-1.5 rounded-lg shrink-0">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-slate-900/95 border border-slate-850 p-3 rounded-2xl rounded-tl-none flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input */}
          <form onSubmit={handleSendMessage} className="bg-slate-950 p-3 border-t border-slate-850 flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything or search chargers..."
              className="flex-1 bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              className="bg-emerald-500 text-slate-950 p-2 rounded-xl hover:bg-emerald-400 transition-colors shadow shadow-emerald-500/10"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating round pulse button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center text-slate-950 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 group relative border border-white/10"
      >
        <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25 group-hover:opacity-40"></div>
        <Sparkles className="h-6 w-6 fill-current relative z-10 text-slate-950" />
      </button>
    </div>
  );
};

export default AIChatWidget;
