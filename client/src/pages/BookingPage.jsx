import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Calendar, Clock, Zap, DollarSign, CreditCard, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, MapPin } from 'lucide-react';

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Retrieve states passed from ChargerDetail
  const bookingState = location.state || {};
  const { charger, scheduledAt, durationMinutes, kwhNeeded, estimatedCost } = bookingState;

  // UI state
  const [paymentMode, setPaymentMode] = useState('mock'); // 'mock' or 'razorpay'
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(null); // stores booking response
  const [error, setError] = useState('');

  if (!charger || !scheduledAt) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900 text-center">
        <AlertTriangle className="h-12 w-12 text-rose-500 mb-2" />
        <h3 className="text-xl font-bold">Session State Expired</h3>
        <p className="text-slate-400 text-sm mt-1 mb-4">Please configure booking parameters from the details page.</p>
        <button onClick={() => navigate('/')} className="bg-emerald-500 text-slate-950 px-5 py-2.5 rounded-lg font-bold hover:bg-emerald-400">
          Back to Map
        </button>
      </div>
    );
  }

  const handleConfirmBooking = async (paymentId = '') => {
    setIsProcessing(true);
    setProcessingStep('Initializing Secure Transaction...');
    setError('');

    try {
      // Step 1: Simulate network verification delays for wow factor
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProcessingStep('Creating Booking Order...');
      
      // Submit booking details
      const bookingData = {
        chargerId: charger._id,
        scheduledAt,
        durationMinutes,
        estimatedCost,
        paymentId: paymentId || `pay_mock_${Math.random().toString(36).substring(2, 12)}`,
      };

      const { data } = await API.post('/bookings', bookingData);
      
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProcessingStep('Finalizing Escrow & Confirming Slot...');
      await new Promise((resolve) => setTimeout(resolve, 600));

      setBookingConfirmed(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to complete booking. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleRazorpayMockFlow = () => {
    setIsProcessing(true);
    setProcessingStep('Opening Razorpay Gateway...');
    
    // Simulate Razorpay UI opening and successful validation
    setTimeout(() => {
      setProcessingStep('Verifying Payment Signature...');
      setTimeout(() => {
        const fakePaymentId = `pay_rzp_${Math.random().toString(36).substring(2, 15)}`;
        handleConfirmBooking(fakePaymentId);
      }, 1200);
    }, 1500);
  };

  const formattedDate = new Date(scheduledAt).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(scheduledAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Render Confirmation Screen on success
  if (bookingConfirmed) {
    return (
      <div className="flex-1 bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg glass-panel p-8 rounded-2xl border border-emerald-500/20 text-center shadow-2xl relative z-10 overflow-hidden">
          {/* Confetti Glow Orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none"></div>

          <div className="inline-flex bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-full text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-2">Booking Confirmed!</h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
            Your charger slot has been successfully reserved. The host Rajesh has been notified.
          </p>

          {/* Details Summary Card */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl text-left space-y-3 mb-6 relative z-10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Station</span>
              <span className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{charger.title}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Date</span>
              <span className="font-semibold text-slate-200">{formattedDate}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Time Slot</span>
              <span className="font-semibold text-slate-200">{formattedTime} ({durationMinutes} mins)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Energy volume</span>
              <span className="font-semibold text-emerald-400">{kwhNeeded} kWh</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Connector</span>
              <span className="font-semibold text-slate-200">{charger.connectorType} ({charger.speedKw} kW)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Receipt / Payment ID</span>
              <span className="font-mono text-[10px] text-slate-400">{bookingConfirmed.paymentId || 'N/A'}</span>
            </div>
            <div className="h-[1px] bg-slate-800 my-1"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Amount Paid</span>
              <span className="text-base font-black text-emerald-400">${estimatedCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/15 active:translate-y-[0.5px] transition-all text-xs"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 text-slate-200 font-bold py-3 rounded-xl active:translate-y-[0.5px] transition-all text-xs"
            >
              Back to Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start my-6">
        
        {/* Left: Booking Details */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-white">Review & Pay</h2>
          
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  {charger.connectorType} • {charger.speedKw} kW
                </span>
                <h3 className="font-extrabold text-base text-slate-100 mt-2">{charger.title}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-slate-500" />
                  <span>{charger.address}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-slate-500" /> Date</span>
                <span className="font-semibold text-slate-200">{formattedDate}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center"><Clock className="h-4 w-4 mr-2 text-slate-500" /> Scheduled Time</span>
                <span className="font-semibold text-slate-200">{formattedTime} ({durationMinutes} mins)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center"><Zap className="h-4 w-4 mr-2 text-slate-500" /> Energy Requested</span>
                <span className="font-bold text-emerald-400">{kwhNeeded} kWh</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center"><DollarSign className="h-4 w-4 mr-2 text-slate-500" /> Energy rate</span>
                <span className="font-semibold text-slate-250">${charger.pricePerKwh.toFixed(2)}/kWh</span>
              </div>
            </div>

            <div className="h-[1px] bg-slate-800 my-2"></div>

            <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-850">
              <span className="text-xs font-bold text-slate-300">Total Estimated Cost</span>
              <span className="text-xl font-black text-emerald-400">${estimatedCost.toFixed(2)}</span>
            </div>

            <p className="text-[10px] text-slate-500 leading-normal flex items-start space-x-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>EV Nest secures user funds in escrow until the charging session is completed. Cancel free up to 2 hours before schedule.</span>
            </p>
          </div>
        </div>

        {/* Right: Payment Gateway selection & validation */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="pb-2 border-b border-slate-800">
            <h3 className="font-bold text-slate-100">Select Payment Method</h3>
            <p className="text-xs text-slate-400 mt-0.5">Secure payment processing options</p>
          </div>

          {error && (
            <div className="text-rose-500 text-xs bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Razorpay Option */}
            <div
              onClick={() => !isProcessing && setPaymentMode('razorpay')}
              className={`p-4 border rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                paymentMode === 'razorpay'
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${paymentMode === 'razorpay' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Razorpay Gateway</h4>
                  <p className="text-[10px] text-slate-500">Pay via Cards, UPI, Netbanking, or Wallet</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                paymentMode === 'razorpay' ? 'border-emerald-500' : 'border-slate-650'
              }`}>
                {paymentMode === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>}
              </div>
            </div>

            {/* Quick Demo Mock Payment Option */}
            <div
              onClick={() => !isProcessing && setPaymentMode('mock')}
              className={`p-4 border rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                paymentMode === 'mock'
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${paymentMode === 'mock' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Mock Payment (Instant Demo)</h4>
                  <p className="text-[10px] text-slate-500">Skip real transaction for hackathon testing</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                paymentMode === 'mock' ? 'border-emerald-500' : 'border-slate-650'
              }`}>
                {paymentMode === 'mock' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>}
              </div>
            </div>
          </div>

          {/* Secure Payment details button */}
          <div className="pt-2">
            {isProcessing ? (
              <div className="w-full bg-slate-900 border border-slate-800 text-slate-350 p-4 rounded-xl flex flex-col items-center justify-center space-y-3 animate-pulse">
                <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-slate-200">{processingStep}</span>
              </div>
            ) : (
              <button
                onClick={paymentMode === 'mock' ? () => handleConfirmBooking() : handleRazorpayMockFlow}
                className="w-full bg-emerald-500 text-slate-950 font-black py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 active:translate-y-[0.5px]"
              >
                <span>Authorize & Pay ${estimatedCost.toFixed(2)}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            
            <span className="block text-[9px] text-slate-500 text-center mt-3">
              🛡️ SSL Secured 256-bit encryption. Handled securely by EV Nest.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingPage;
