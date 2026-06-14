import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Zap, MapPin, Calculator, Image, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';
import L from 'leaflet';

const CONNECTORS = ['Type2', 'CCS', 'CHAdeMO', 'Bharat AC'];

const AddCharger = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Check if we are in Edit Mode
  const stateData = location.state || {};
  const isEditMode = !!stateData.editMode;
  const chargerData = stateData.chargerData || null;

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(21.1702); // Default Surat coordinates
  const [lng, setLng] = useState(72.8311);
  const [connectorType, setConnectorType] = useState('CCS');
  const [speedKw, setSpeedKw] = useState(50);
  
  // Pricing Section State
  const [baseCost, setBaseCost] = useState(12);
  const [markupPercent, setMarkupPercent] = useState(35);
  const [photoUrl, setPhotoUrl] = useState('');

  // UI States
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map Refs for Pin Picker
  const pickerMapRef = useRef(null);
  const pickerMapInstanceRef = useRef(null);
  const pickerMarkerRef = useRef(null);

  // Suggested Markup logic by speed class
  const getSuggestedMarkup = (speed) => {
    if (speed <= 3.3) return 20; // slow
    if (speed <= 7.4) return 35; // fast
    return 50; // rapid (22kW+)
  };

  // Prepopulate form if editing
  useEffect(() => {
    if (isEditMode && chargerData) {
      setTitle(chargerData.title);
      setDescription(chargerData.description || '');
      setAddress(chargerData.address);
      setLat(chargerData.lat);
      setLng(chargerData.lng);
      setConnectorType(chargerData.connectorType);
      setSpeedKw(chargerData.speedKw);
      setMarkupPercent(chargerData.markupPercent);
      // Derive baseCost backwards from pricePerKwh and markupPercent
      const derivedBase = chargerData.pricePerKwh / (1 + chargerData.markupPercent / 100);
      setBaseCost(Number(derivedBase.toFixed(2)));
      setPhotoUrl(chargerData.photos?.[0] || '');
    }
  }, [isEditMode, chargerData]);

  // Adjust suggested markup when speed changes
  const handleSpeedChange = (e) => {
    const speedVal = Number(e.target.value);
    setSpeedKw(speedVal);
    const suggested = getSuggestedMarkup(speedVal);
    setMarkupPercent(suggested);
  };

  // Initialize leafet map for coordinates picking
  useEffect(() => {
    if (!pickerMapInstanceRef.current && pickerMapRef.current) {
      const initLat = isEditMode && chargerData ? chargerData.lat : 21.1702;
      const initLng = isEditMode && chargerData ? chargerData.lng : 72.8311;

      const map = L.map(pickerMapRef.current, {
        center: [initLat, initLng],
        zoom: 10,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      }).addTo(map);

      pickerMapRef.current.classList.add('dark-map');

      // Add a draggable marker
      const marker = L.marker([initLat, initLng], {
        draggable: true,
        icon: L.divIcon({
          html: `<div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-slate-950 font-bold charger-pulse-active">📍</div>`,
          className: 'picker-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        })
      }).addTo(map);

      // Listen to marker drag and map click events
      const updateCoords = (newLat, newLng) => {
        setLat(Number(newLat.toFixed(5)));
        setLng(Number(newLng.toFixed(5)));
      };

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        updateCoords(position.lat, position.lng);
      });

      map.on('click', (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        updateCoords(clickLat, clickLng);
      });

      pickerMapInstanceRef.current = map;
      pickerMarkerRef.current = marker;

      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    return () => {
      if (pickerMapInstanceRef.current) {
        pickerMapInstanceRef.current.remove();
        pickerMapInstanceRef.current = null;
        pickerMarkerRef.current = null;
      }
    };
  }, [isEditMode, chargerData]);

  // Sync marker position if manual input fields are changed
  const handleCoordsManualUpdate = () => {
    if (pickerMarkerRef.current && pickerMapInstanceRef.current) {
      const position = [lat, lng];
      pickerMarkerRef.current.setLatLng(position);
      pickerMapInstanceRef.current.panTo(position);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !address || !lat || !lng) {
      setError('Title, Address, and Map Coordinates are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // final user price = baseCost * (1 + markup / 100)
    const finalPricePerKwh = baseCost * (1 + markupPercent / 100);

    const dataPayload = {
      title,
      description,
      address,
      lat,
      lng,
      connectorType,
      speedKw,
      pricePerKwh: Number(finalPricePerKwh.toFixed(2)),
      markupPercent,
      photos: photoUrl ? [photoUrl] : undefined,
    };

    try {
      if (isEditMode) {
        await API.put(`/chargers/${chargerData._id}`, dataPayload);
      } else {
        await API.post('/chargers', dataPayload);
      }
      navigate('/merchant');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to list charger. Check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalUserPrice = baseCost * (1 + markupPercent / 100);

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/merchant')}
          className="flex items-center space-x-2 text-slate-400 hover:text-emerald-400 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Host Panel</span>
        </button>

        <div>
          <h1 className="text-3xl font-extrabold text-white">
            {isEditMode ? 'Edit Charger Listing' : 'List a New Charger'}
          </h1>
          <p className="text-sm text-slate-400">
            {isEditMode ? 'Modify specs and pricing logic' : 'Start sharing your private charger and collect payments'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Basic Specs */}
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Station Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Surat Ring Road Fast DC"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Hours, directions, security features, nearby facilities..."
                rows="3"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Connector Type</label>
                <select
                  value={connectorType}
                  onChange={(e) => setConnectorType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {CONNECTORS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Speed (kW)</label>
                <input
                  type="number"
                  value={speedKw}
                  onChange={handleSpeedChange}
                  placeholder="e.g. 7.4 or 50"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Photo URL (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Image className="h-4 w-4" />
                </span>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Leave empty to use standard default charger stock image.</p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Apartment, Street Name, City, State"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Right Column: Map coordinates picker + Pricing Math */}
          <div className="space-y-6">
            
            {/* Coordinates Map Picker */}
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Map Pin Picker</label>
              
              <div className="h-44 w-full rounded-xl overflow-hidden relative border border-slate-800">
                <div ref={pickerMapRef} className="w-full h-full z-10" />
              </div>
              
              <p className="text-[10px] text-slate-500 leading-normal">
                Click map to select coordinates, or drag the red marker pin.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    onBlur={handleCoordsManualUpdate}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2 py-1.5 text-xs text-slate-350"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    onBlur={handleCoordsManualUpdate}
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2 py-1.5 text-xs text-slate-350"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Pricing markup card */}
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Calculator className="h-4.5 w-4.5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-sm">Pricing Markup Logic</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase font-semibold mb-1">Electricity Base ($/kWh)</label>
                  <input
                    type="number"
                    value={baseCost}
                    onChange={(e) => setBaseCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    min="0.05"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] text-slate-450 uppercase font-semibold">Markup (%)</label>
                    <span className="text-xs font-bold text-emerald-400">{markupPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2.5"
                  />
                </div>
              </div>

              {/* Suggestions prompt */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-start space-x-2 text-[10.5px]">
                <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-400 leading-normal">
                  Suggested markup for <span className="font-bold text-emerald-400">{speedKw} kW</span> class: <span className="font-bold text-slate-200">{getSuggestedMarkup(speedKw)}%</span>. (Slow: 20%, Fast: 35%, Rapid DC: 50%).
                </p>
              </div>

              <div className="h-[1px] bg-slate-800"></div>

              {/* Result Preview */}
              <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Final User Price</span>
                  <span className="text-xs text-slate-500">Includes markup calculation</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-400">${finalUserPrice.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block font-medium">per kWh</span>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 text-slate-950 font-extrabold py-3 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-55 active:translate-y-[0.5px]"
              >
                {isSubmitting ? 'Saving listing...' : isEditMode ? 'Update Station' : 'Publish Station Live'}
              </button>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
};

export default AddCharger;
