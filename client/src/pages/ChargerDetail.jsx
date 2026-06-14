import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Zap, Shield, ArrowLeft, Star, Battery, Calendar, Clock, Sparkles } from 'lucide-react';
import L from 'leaflet';

const ChargerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const detailMapRef = useRef(null);
  const detailMapInstanceRef = useRef(null);

  // Loader / Error states
  const [charger, setCharger] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking states
  const [kwhNeeded, setKwhNeeded] = useState(25);
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Review submission states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchChargerData = async () => {
      setLoading(true);
      setError('');
      try {
        const [chargerRes, reviewsRes] = await Promise.all([
          API.get(`/chargers/${id}`),
          API.get(`/reviews/${id}`)
        ]);
        setCharger(chargerRes.data);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load charger details. It may not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchChargerData();
  }, [id]);

  // Set default scheduledAt date to tomorrow 10:00 AM
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    // Format to yyyy-MM-ddThh:mm
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
    setScheduledAt(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);

  // Initialize Station Location Map
  useEffect(() => {
    if (charger && detailMapRef.current && !detailMapInstanceRef.current) {
      const { lat, lng, isLive, pricePerKwh } = charger;
      if (!lat || !lng) return;

      const map = L.map(detailMapRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      detailMapRef.current.classList.add('dark-map');

      const createCustomIcon = (isLive, price) => {
        const bgClass = isLive ? 'bg-emerald-500 text-slate-950 charger-pulse-active' : 'bg-slate-600 text-slate-300';
        const glowClass = isLive ? 'shadow-[0_0_15px_rgba(16,185,129,0.5)]' : '';
        return L.divIcon({
          html: `
            <div class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full ${bgClass} ${glowClass} border-2 border-slate-900 flex items-center justify-center font-bold text-sm">
                ⚡
              </div>
            </div>
          `,
          className: 'custom-charger-pin',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });
      };

      L.marker([lat, lng], {
        icon: createCustomIcon(isLive, pricePerKwh),
      }).addTo(map);

      detailMapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    return () => {
      if (detailMapInstanceRef.current) {
        detailMapInstanceRef.current.remove();
        detailMapInstanceRef.current = null;
      }
    };
  }, [charger]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !charger) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900">
        <div className="text-rose-500 mb-4 text-center">
          <Shield className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-xl font-bold">{error || 'Charger not found'}</h3>
        </div>
        <button onClick={() => navigate('/')} className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg font-semibold hover:bg-slate-700">
          Back to Map
        </button>
      </div>
    );
  }

  // Cost calculations
  const estimatedCost = kwhNeeded * charger.pricePerKwh;

  const handleBookSession = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!scheduledAt) {
      alert('Please select a booking date and time.');
      return;
    }

    // Pass booking details to BookingPage via state
    navigate(`/booking/${charger._id}`, {
      state: {
        charger,
        scheduledAt,
        durationMinutes,
        kwhNeeded,
        estimatedCost,
      }
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setReviewError('');
    setSubmittingReview(true);
    try {
      const { data } = await API.post(`/reviews/${charger._id}`, {
        rating: newRating,
        comment: newComment
      });

      // Reload reviews
      const reviewsRes = await API.get(`/reviews/${charger._id}`);
      setReviews(reviewsRes.data);
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Get average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  return (
    <>
    <div className="flex-1 bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-slate-400 hover:text-emerald-400 transition-colors mb-6 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Map</span>
        </button>

        {/* Title Grid */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${charger.isLive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              <span className={`text-xs uppercase font-extrabold tracking-wider ${charger.isLive ? 'text-emerald-400' : 'text-slate-400'}`}>
                {charger.isLive ? 'Online / Live Now' : 'Offline'}
              </span>
              <span className="text-slate-600">•</span>
              <div className="flex items-center text-amber-400 text-xs font-bold">
                <Star className="h-3.5 w-3.5 fill-current mr-1" />
                <span>{averageRating} ({reviews.length} reviews)</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{charger.title}</h1>
            <p className="flex items-center text-slate-400 text-sm mt-1.5">
              <MapPin className="h-4 w-4 mr-1 text-slate-500" />
              <span>{charger.address}</span>
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shrink-0 flex items-center space-x-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">User Price</div>
              <div className="text-2xl font-black text-emerald-400">${charger.pricePerKwh.toFixed(2)}</div>
              <div className="text-[9px] text-slate-400">per kWh</div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Speed</div>
              <div className="text-xl font-bold text-white">{charger.speedKw} kW</div>
              <div className="text-[9px] text-emerald-400 font-bold capitalize">
                {charger.speedKw >= 22 ? 'Rapid DC' : charger.speedKw >= 7.4 ? 'Fast AC' : 'Slow AC'}
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-slate-800/80">
            <img
              src={charger.photos?.[0] || 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'}
              alt={charger.title}
              className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
            />
          </div>
          <div className="grid grid-rows-2 gap-4 h-72 md:h-96">
            <div className="rounded-2xl overflow-hidden shadow-md border border-slate-800/80">
              <img
                src={charger.photos?.[1] || 'https://images.unsplash.com/photo-1620223321526-7243c332fe41?auto=format&fit=crop&w=600&q=80'}
                alt={charger.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 p-6 flex flex-col justify-center items-center text-center">
              <Zap className="h-8 w-8 text-emerald-400 mb-2" />
              <h4 className="font-bold text-sm text-slate-200">Connector Type</h4>
              <p className="text-xl font-extrabold text-emerald-400 mt-1">{charger.connectorType}</p>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details & Reviews Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-3">About this Charger</h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{charger.description || 'No description provided by the host.'}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-800/60">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Listed by</span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">{charger.merchantId?.name || 'Local Host'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Verified Station</span>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center">
                    <Shield className="h-3.5 w-3.5 mr-1" />
                    <span>Active Security</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Base Markup</span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">{charger.markupPercent}% markup applied</p>
                </div>
              </div>
            </div>

            {/* Location Map Card */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-emerald-400" />
                <span>Station Location Map</span>
              </h3>
              <div 
                ref={detailMapRef} 
                className="w-full h-64 rounded-xl border border-slate-800 overflow-hidden shadow-inner relative z-10"
              ></div>
              <p className="text-[11px] text-slate-400 mt-3 flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 text-slate-500 shrink-0" />
                <span>{charger.address} ({charger.lat.toFixed(5)}, {charger.lng.toFixed(5)})</span>
              </p>
            </div>

            {/* Reviews Section */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6">User Reviews ({reviews.length})</h3>

              {reviews.length === 0 ? (
                <div className="text-slate-500 text-xs py-2">No reviews yet. Be the first to review!</div>
              ) : (
                <div className="space-y-5 divide-y divide-slate-850">
                  {reviews.map((rev, idx) => (
                    <div key={rev._id} className={`pt-4 ${idx === 0 ? 'pt-0' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-200">{rev.userId?.name || 'Driver'}</span>
                          <span className="text-[10px] text-slate-500 block">{rev.userId?.carModel || 'EV Driver'}</span>
                        </div>
                        <div className="flex items-center text-amber-400 text-xs">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'text-slate-700'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{rev.comment}</p>
                      <span className="text-[9px] text-slate-650 mt-1 block">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Review Form */}
              {user && (
                <form onSubmit={handleReviewSubmit} className="mt-8 pt-6 border-t border-slate-800/80 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span>Add Your Review</span>
                  </h4>

                  {reviewError && (
                    <div className="text-rose-500 text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                      {reviewError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Rating</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`h-5 w-5 ${star <= newRating ? 'fill-current' : 'text-slate-700'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Comment</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your charging experience details..."
                      rows="3"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-emerald-500 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs hover:bg-emerald-400 shadow-md shadow-emerald-500/15 transition-all disabled:opacity-55"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Calculator & Booking Sidebar */}
          <div>
            <div className="glass-panel rounded-2xl sticky top-20 border border-emerald-500/20 shadow-2xl overflow-hidden">
              {/* Header with prominent Book button */}
              <div className="p-6 border-b border-slate-800 bg-gradient-to-br from-emerald-500/10 to-transparent">
                <h3 className="font-extrabold text-lg text-white">Book Charger</h3>
                <p className="text-xs text-slate-400 mt-1">Configure your charging volume &amp; slot</p>

                {/* PROMINENT BOOK BUTTON — always visible at top */}
                <button
                  onClick={handleBookSession}
                  disabled={!charger.isLive}
                  className="mt-4 w-full bg-emerald-500 text-slate-950 font-extrabold py-3.5 rounded-xl hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  <Zap className="h-5 w-5 fill-current" />
                  <span>{charger.isLive ? 'Book & Pay Session' : 'Station Offline'}</span>
                </button>
                {!charger.isLive && (
                  <p className="text-[10px] text-rose-400 text-center font-semibold mt-2">
                    This station is currently offline and cannot accept bookings.
                  </p>
                )}
              </div>

              {/* Scrollable config area */}
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">

                {/* Range Profile Quick Fill */}
                {user && user.carModel && (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Your EV Profile</span>
                      <span className="font-bold text-slate-200">{user.carModel}</span>
                    </div>
                    {user.batteryCapacityKwh > 0 && (
                      <button
                        onClick={() => setKwhNeeded(Math.round(user.batteryCapacityKwh * 0.8))}
                        className="bg-emerald-500/15 border border-emerald-500/20 hover:bg-emerald-500/25 text-emerald-400 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                      >
                        Fill 80% ({Math.round(user.batteryCapacityKwh * 0.8)} kWh)
                      </button>
                    )}
                  </div>
                )}

                {/* Calculator Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">Energy Needed</span>
                    <span className="font-bold text-emerald-400">{kwhNeeded} kWh</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={kwhNeeded}
                    onChange={(e) => setKwhNeeded(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-650">
                    <span>5 kWh</span>
                    <span>100 kWh</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {[15, 30, 50].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setKwhNeeded(preset)}
                        className={`py-1 text-[10px] rounded border transition-colors ${
                          kwhNeeded === preset
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        +{preset}kWh
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slot / Date-Time Picker */}
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1.5 flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Choose Schedule</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1.5 flex items-center space-x-1">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Duration</span>
                    </label>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value={30}>30 Minutes</option>
                      <option value={60}>1 Hour</option>
                      <option value={90}>1.5 Hours</option>
                      <option value={120}>2 Hours</option>
                      <option value={180}>3 Hours</option>
                    </select>
                  </div>
                </div>

                {/* Estimated Pricing summary */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Base rate ({charger.connectorType})</span>
                    <span>${charger.pricePerKwh.toFixed(2)}/kWh</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Energy request</span>
                    <span>{kwhNeeded} kWh</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Estimated charging duration</span>
                    <span>~{Math.round((kwhNeeded / charger.speedKw) * 60)} mins</span>
                  </div>
                  <div className="h-[1px] bg-slate-800 my-1"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-100">Estimated Cost</span>
                    <span className="text-lg font-black text-emerald-400">${estimatedCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>{/* end scrollable area */}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ── Floating mobile sticky CTA ── */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-4">
      <div>
        <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Total</div>
        <div className="text-lg font-black text-emerald-400">${estimatedCost.toFixed(2)}</div>
      </div>
      <button
        onClick={handleBookSession}
        disabled={!charger.isLive}
        className="flex-1 bg-emerald-500 text-slate-950 font-extrabold py-3.5 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Zap className="h-5 w-5 fill-current" />
        <span>{charger.isLive ? 'Book & Pay Session' : 'Offline'}</span>
      </button>
    </div>
    </>
  );
};

export default ChargerDetail;
