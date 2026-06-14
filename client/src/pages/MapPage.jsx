import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import AIChatWidget from '../components/AIChatWidget';
import { SlidersHorizontal, MapPin, Search, RefreshCw, BatteryCharging, Locate, Navigation, AlertTriangle, Route, X, Clock, ArrowRight } from 'lucide-react';
import L from 'leaflet';

// Haversine formula — returns distance in km between two lat/lng points
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const MapPage = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const userMarkerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const routeLayerRef = useRef(null);
  const navigate = useNavigate();

  // User location
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [locationStatus, setLocationStatus] = useState('detecting'); // 'detecting' | 'granted' | 'denied' | 'fallback'

  // Filters state
  const [radiusKm, setRadiusKm] = useState(100);
  const [connectorType, setConnectorType] = useState('');
  const [maxPrice, setMaxPrice] = useState(50);
  const [minSpeed, setMinSpeed] = useState(0);

  // Data state
  const [allChargers, setAllChargers] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Directions state
  const [routeInfo, setRouteInfo] = useState(null); // { distance, duration, stationName }
  const [routeLoading, setRouteLoading] = useState(false);
  const [activeDirectionId, setActiveDirectionId] = useState(null);

  // Initialize Map
  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;

    const map = L.map(container, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    container.classList.add('dark-map');

    const markersGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersGroupRef.current = markersGroup;

    let invalidated = false;
    const ro = new ResizeObserver(() => {
      if (container.offsetWidth > 0 && container.offsetHeight > 0) {
        map.invalidateSize();
        if (!invalidated) invalidated = true;
      }
    });
    ro.observe(container);

    const t1 = setTimeout(() => map.invalidateSize(), 400);
    const t2 = setTimeout(() => map.invalidateSize(), 1000);

    return () => {
      ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      map.remove();
      mapInstanceRef.current = null;
      markersGroupRef.current = null;
    };
  }, []);

  // Detect user's GPS location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      // Browser doesn't support geolocation — use India center as fallback
      setUserLocation({ lat: 20.5937, lng: 78.9629 });
      setLocationStatus('fallback');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        setLocationStatus('granted');
        // Fly map to user location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 10, { animate: true, duration: 1.5 });
        }
      },
      (err) => {
        console.warn('Geolocation denied:', err.message);
        // Fallback to center of India
        setUserLocation({ lat: 20.5937, lng: 78.9629 });
        setLocationStatus('denied');
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  // Fetch all chargers once
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data } = await API.get('/chargers/search', {
          params: {
            connectorType: connectorType || undefined,
            maxPrice: maxPrice || undefined,
            minSpeed: minSpeed || undefined,
          },
        });
        setAllChargers(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch chargers.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [connectorType, maxPrice, minSpeed]);

  // Filter chargers by radius whenever allChargers, userLocation, or radiusKm changes
  useEffect(() => {
    if (!userLocation || allChargers.length === 0) {
      setChargers(allChargers);
      return;
    }
    const filtered = allChargers.filter((c) => {
      if (!c.lat || !c.lng) return false;
      const dist = getDistanceKm(userLocation.lat, userLocation.lng, c.lat, c.lng);
      c._distanceKm = Math.round(dist); // attach for display
      return dist <= radiusKm;
    });
    // Sort by distance
    filtered.sort((a, b) => a._distanceKm - b._distanceKm);
    setChargers(filtered);
  }, [allChargers, userLocation, radiusKm]);

  // Update map markers + user pin + radius circle whenever chargers/userLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    updateMapMarkers(chargers);
  }, [chargers]);

  // Draw/update user location pin and radius circle
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    const map = mapInstanceRef.current;

    // Remove old user pin
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    // Remove old circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }

    // Add "You Are Here" pulse marker
    const userIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg z-10"></div>
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
        </div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 });
    userMarker.bindTooltip('<b>📍 You are here</b>', { permanent: false, direction: 'top', className: 'leaflet-user-tooltip' });
    userMarker.addTo(map);
    userMarkerRef.current = userMarker;

    // Draw radius circle
    const circle = L.circle([userLocation.lat, userLocation.lng], {
      radius: radiusKm * 1000,
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.05,
      weight: 1.5,
      dashArray: '6, 8',
    }).addTo(map);
    radiusCircleRef.current = circle;
  }, [userLocation, radiusKm]);

  const updateMapMarkers = (chargerList) => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    markersGroupRef.current.clearLayers();
    if (chargerList.length === 0) return;

    const createCustomIcon = (isLive, price) => {
      const bg = isLive ? '#10b981' : '#475569';
      const glow = isLive ? 'box-shadow:0 0 14px rgba(16,185,129,0.55)' : '';
      return L.divIcon({
        html: `
          <div style="display:flex;flex-direction:column;align-items:center">
            <div style="width:32px;height:32px;border-radius:50%;background:${bg};${glow};border:2px solid #0f172a;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;">⚡</div>
            <div style="background:rgba(15,23,42,0.92);color:#f1f5f9;border:1px solid #1e293b;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;margin-top:2px;white-space:nowrap;">$${price}/kWh</div>
          </div>
        `,
        className: 'custom-charger-pin',
        iconSize: [52, 52],
        iconAnchor: [26, 16],
        popupAnchor: [0, -20],
      });
    };

    chargerList.forEach((charger) => {
      const { lat, lng, isLive, title, address, connectorType, speedKw, pricePerKwh, _id, _distanceKm } = charger;
      if (!lat || !lng) return;

      const distLabel = _distanceKm !== undefined ? `<span style="color:#10b981;font-weight:700;">${_distanceKm} km away</span>` : '';

      const popupHtml = `
        <div style="padding:8px;min-width:210px;font-family:system-ui,sans-serif;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="width:8px;height:8px;border-radius:50%;background:${isLive ? '#10b981' : '#64748b'};display:inline-block;${isLive ? 'box-shadow:0 0 6px #10b981' : ''}"></span>
            <span style="font-size:10px;font-weight:800;letter-spacing:.08em;color:${isLive ? '#34d399' : '#94a3b8'};">${isLive ? 'AVAILABLE' : 'OFFLINE'}</span>
            <span style="margin-left:auto;font-size:10px;">${distLabel}</span>
          </div>
          <h4 style="font-size:13px;font-weight:800;color:#f1f5f9;margin:0 0 3px;">${title}</h4>
          <p style="font-size:11px;color:#94a3b8;margin:0 0 8px;line-height:1.4;">${address}</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;background:rgba(30,41,59,0.7);border:1px solid #1e293b;border-radius:8px;padding:8px;margin-bottom:8px;">
            <div><div style="font-size:9px;color:#64748b;font-weight:700;text-transform:uppercase;">Speed</div><div style="font-size:12px;font-weight:800;color:#34d399;">${speedKw} kW</div></div>
            <div><div style="font-size:9px;color:#64748b;font-weight:700;text-transform:uppercase;">Connector</div><div style="font-size:12px;font-weight:700;color:#e2e8f0;">${connectorType}</div></div>
          </div>
          <div style="display:flex;gap:6px;">
            <button id="dir-btn-${_id}" style="flex:1;background:#1e293b;color:#39ff14;font-weight:800;font-size:11px;border:1px solid #334155;border-radius:8px;padding:9px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:4px;">
              🧭 Directions
            </button>
            <button id="book-btn-${_id}" style="flex:1.4;background:#10b981;color:#0f172a;font-weight:800;font-size:11px;border:none;border-radius:8px;padding:9px;cursor:pointer;transition:background .2s;">
              ⚡ Book — $${pricePerKwh}/kWh
            </button>
          </div>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: createCustomIcon(isLive, pricePerKwh) });
      marker.bindPopup(popupHtml, { maxWidth: 260 });
      marker.on('popupopen', () => {
        const btn = document.getElementById(`book-btn-${_id}`);
        if (btn) {
          btn.onmouseenter = () => (btn.style.background = '#059669');
          btn.onmouseleave = () => (btn.style.background = '#10b981');
          btn.addEventListener('click', () => navigate(`/charger/${_id}`));
        }
        const dirBtn = document.getElementById(`dir-btn-${_id}`);
        if (dirBtn) {
          dirBtn.onmouseenter = () => { dirBtn.style.background = '#334155'; dirBtn.style.borderColor = '#39ff14'; };
          dirBtn.onmouseleave = () => { dirBtn.style.background = '#1e293b'; dirBtn.style.borderColor = '#334155'; };
          dirBtn.addEventListener('click', () => handleGetDirections(charger));
        }
      });
      marker.addTo(markersGroupRef.current);
    });
  };

  const handleFlyToCharger = (lat, lng) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { animate: true, duration: 1.5 });
      markersGroupRef.current.eachLayer((layer) => {
        const ll = layer.getLatLng();
        if (ll.lat === lat && ll.lng === lng) layer.openPopup();
      });
    }
  };

  // ── Directions / Routing ─────────────────────────────────────────────
  const handleGetDirections = async (charger) => {
    if (!userLocation) {
      alert('Please enable location to get directions.');
      return;
    }
    const map = mapInstanceRef.current;
    if (!map) return;

    setRouteLoading(true);
    setActiveDirectionId(charger._id);

    // Clear old route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    try {
      // OSRM free routing API (driving profile)
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${charger.lng},${charger.lat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      // Draw animated route polyline
      const routeLine = L.polyline(coords, {
        color: '#39ff14',
        weight: 4,
        opacity: 0.85,
        dashArray: '12, 8',
        lineCap: 'round',
        lineJoin: 'round',
        className: 'route-line-animated',
      }).addTo(map);

      // Add a glow effect underneath
      const glowLine = L.polyline(coords, {
        color: '#39ff14',
        weight: 10,
        opacity: 0.15,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Add destination marker
      const destIcon = L.divIcon({
        html: `
          <div style="display:flex;flex-direction:column;align-items:center">
            <div style="width:36px;height:36px;border-radius:50%;background:#39ff14;box-shadow:0 0 20px rgba(57,255,20,0.6);border:3px solid #0f172a;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;">📍</div>
          </div>
        `,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      const destMarker = L.marker([charger.lat, charger.lng], { icon: destIcon, zIndexOffset: 900 }).addTo(map);

      // Group all route layers for easy removal
      const routeGroup = L.layerGroup([routeLine, glowLine, destMarker]).addTo(map);
      routeLayerRef.current = routeGroup;

      // Fit map to show entire route
      map.fitBounds(routeLine.getBounds(), { padding: [60, 60], animate: true, duration: 1.5 });

      // Calculate distance and duration
      const distKm = (route.distance / 1000).toFixed(1);
      const durMin = Math.round(route.duration / 60);
      const durHrs = Math.floor(durMin / 60);
      const durRemMin = durMin % 60;
      const durationStr = durHrs > 0 ? `${durHrs}h ${durRemMin}m` : `${durMin} min`;

      setRouteInfo({
        distance: distKm,
        duration: durationStr,
        durationMin: durMin,
        stationName: charger.title,
        stationId: charger._id,
      });
    } catch (err) {
      console.error('Routing error:', err);
      // Fallback: draw a straight line
      const straightLine = L.polyline(
        [[userLocation.lat, userLocation.lng], [charger.lat, charger.lng]],
        { color: '#39ff14', weight: 3, opacity: 0.6, dashArray: '8, 12' }
      ).addTo(map);
      const fallbackGroup = L.layerGroup([straightLine]).addTo(map);
      routeLayerRef.current = fallbackGroup;
      map.fitBounds(straightLine.getBounds(), { padding: [60, 60] });

      const dist = getDistanceKm(userLocation.lat, userLocation.lng, charger.lat, charger.lng);
      setRouteInfo({
        distance: dist.toFixed(1),
        duration: `~${Math.round(dist / 60 * 60)} min`,
        durationMin: Math.round(dist),
        stationName: charger.title,
        stationId: charger._id,
      });
    } finally {
      setRouteLoading(false);
    }
  };

  const handleClearRoute = () => {
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    setRouteInfo(null);
    setActiveDirectionId(null);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        setLocationStatus('granted');
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 11, { animate: true, duration: 1.2 });
        }
      },
      () => setLocationStatus('denied'),
      { timeout: 8000 }
    );
  };

  const handleResetFilters = () => {
    setConnectorType('');
    setMaxPrice(50);
    setMinSpeed(0);
    setRadiusKm(100);
  };

  const RADIUS_STEPS = [10, 25, 50, 100, 200, 500];

  return (
    <div className="flex flex-col md:flex-row overflow-hidden relative" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Filters Sidebar */}
      <div
        className={`w-full md:w-80 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col z-20 transition-all duration-300 md:relative absolute inset-y-0 left-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 overflow-hidden border-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-slate-100">Find Chargers</h3>
          </div>
          <button onClick={handleResetFilters} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1">
            <RefreshCw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* Location Status Banner */}
          <div className={`rounded-xl p-3 border flex items-start space-x-2.5 ${
            locationStatus === 'granted'
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : locationStatus === 'denied'
              ? 'bg-amber-500/10 border-amber-500/20'
              : 'bg-slate-900 border-slate-800'
          }`}>
            {locationStatus === 'granted' ? (
              <Navigation className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : locationStatus === 'denied' ? (
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Locate className="h-4 w-4 text-slate-400 shrink-0 mt-0.5 animate-pulse" />
            )}
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-200">
                {locationStatus === 'granted' && '📍 Location Detected'}
                {locationStatus === 'denied' && '⚠️ Location Denied'}
                {locationStatus === 'detecting' && 'Detecting location…'}
                {locationStatus === 'fallback' && '🗺️ Using India Center'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {locationStatus === 'granted' && `Showing chargers within ${radiusKm} km of you`}
                {locationStatus === 'denied' && 'Enable location for accurate range filtering'}
                {locationStatus === 'detecting' && 'Getting your GPS coordinates'}
                {locationStatus === 'fallback' && 'Browser does not support GPS'}
              </p>
            </div>
            {locationStatus === 'denied' && (
              <button
                onClick={handleLocateMe}
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 shrink-0 underline"
              >
                Retry
              </button>
            )}
          </div>

          {/* Radius / Range Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Search Radius</label>
              <span className="text-xs font-black text-emerald-400">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between mt-2 gap-1">
              {RADIUS_STEPS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                    radiusKm === r
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>

          {/* Connector type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Connector Type</label>
            <select
              value={connectorType}
              onChange={(e) => setConnectorType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">All Connectors</option>
              <option value="CCS">CCS (DC Fast)</option>
              <option value="Type2">Type 2 (AC Fast)</option>
              <option value="CHAdeMO">CHAdeMO</option>
              <option value="Bharat AC">Bharat AC (Slow)</option>
            </select>
          </div>

          {/* Max Price slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Max Price</label>
              <span className="text-xs font-bold text-emerald-400">${maxPrice}/kWh</span>
            </div>
            <input
              type="range" min="5" max="50" step="1" value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>$5</span><span>$50</span>
            </div>
          </div>

          {/* Min speed */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Min Charging Speed</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 7.4, 22, 50].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setMinSpeed(speed)}
                  className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                    minSpeed === speed
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {speed === 0 ? 'All' : `${speed}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Charger List */}
          <div className="pt-3 border-t border-slate-900">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <BatteryCharging className="h-4 w-4 text-emerald-400" />
              <span>
                {loading ? 'Searching…' : `${chargers.length} station${chargers.length !== 1 ? 's' : ''} in range`}
              </span>
            </h4>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-slate-900/60 border border-slate-850 rounded-xl p-3 h-20 animate-pulse" />
                ))}
              </div>
            ) : chargers.length === 0 ? (
              <div className="text-center py-6 bg-slate-900/40 rounded-xl border border-slate-800">
                <MapPin className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No chargers within {radiusKm} km.</p>
                <button
                  onClick={() => setRadiusKm(Math.min(radiusKm + 100, 500))}
                  className="mt-2 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline"
                >
                  Expand to {Math.min(radiusKm + 100, 500)} km
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {chargers.map((charger) => (
                  <div
                    key={charger._id}
                    onClick={() => handleFlyToCharger(charger.lat, charger.lng)}
                    className={`p-3 bg-slate-900 border rounded-xl hover:border-emerald-500/50 cursor-pointer transition-all duration-200 group hover:bg-slate-900/80 ${
                      activeDirectionId === charger._id ? 'border-[#39ff14]/50 bg-[#39ff14]/5' : 'border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="overflow-hidden pr-2 flex-1">
                        <h5 className="font-bold text-xs text-slate-200 group-hover:text-emerald-400 transition-colors truncate">{charger.title}</h5>
                        <p className="text-[10px] text-slate-400 truncate">{charger.address}</p>
                        <div className="flex items-center space-x-2 mt-1.5">
                          <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-medium">{charger.connectorType}</span>
                          <span className="text-[9px] text-emerald-400 font-bold">{charger.speedKw} kW</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-slate-100">${charger.pricePerKwh}</div>
                        <div className="text-[8px] text-slate-500">per kWh</div>
                        {charger._distanceKm !== undefined && (
                          <div className="text-[9px] font-bold text-blue-400 mt-0.5">{charger._distanceKm} km</div>
                        )}
                      </div>
                    </div>
                    {/* Directions button on card */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleGetDirections(charger); }}
                      className={`mt-2 w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        activeDirectionId === charger._id
                          ? 'bg-[#39ff14] text-[#0a0e0f]'
                          : 'bg-slate-800 text-[#39ff14] border border-slate-700 hover:border-[#39ff14]/50'
                      }`}
                    >
                      <Route className="h-3 w-3" />
                      <span>{activeDirectionId === charger._id ? 'Route Active' : 'Get Directions'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative" style={{ height: 'calc(100vh - 64px)' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} className="z-10" />

        {/* Locate Me Button */}
        <button
          onClick={handleLocateMe}
          title="Center on my location"
          className={`absolute right-4 z-20 bg-slate-950/90 backdrop-blur-md border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:border-emerald-400 p-3 rounded-xl shadow-xl transition-all hover:scale-105 ${routeInfo ? 'bottom-36' : 'bottom-24'}`}
        >
          <Locate className="h-5 w-5" />
        </button>

        {/* Route Info Panel */}
        {routeInfo && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-[#0a0c10]/95 backdrop-blur-xl border border-[#39ff14]/25 rounded-2xl px-5 py-3.5 shadow-2xl flex items-center space-x-5 min-w-[380px]" style={{ boxShadow: '0 0 30px rgba(57,255,20,0.08)' }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#39ff14]/10 flex items-center justify-center">
                <Route className="h-5 w-5 text-[#39ff14]" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Route to</p>
                <p className="text-sm font-black text-white truncate max-w-[160px]">{routeInfo.stationName}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-[#1f242e]" />
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-lg font-black text-[#39ff14]">{routeInfo.distance}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase">km</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-white">{routeInfo.duration}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase">drive</p>
              </div>
            </div>
            <button
              onClick={handleClearRoute}
              className="ml-2 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-all"
              title="Clear route"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Route Loading Overlay */}
        {routeLoading && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-[#0a0c10]/95 backdrop-blur-xl border border-[#39ff14]/25 rounded-2xl px-6 py-3.5 shadow-2xl flex items-center space-x-3">
            <div className="w-5 h-5 rounded-full border-2 border-[#39ff14]/30 border-t-[#39ff14] animate-spin" />
            <span className="text-xs font-bold text-slate-300">Calculating route…</span>
          </div>
        )}

        {/* Sidebar Toggle (mobile) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-20 md:hidden bg-slate-950/90 text-slate-200 hover:text-emerald-400 p-2.5 rounded-xl border border-slate-800 shadow-xl backdrop-blur-md"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>

        {/* Range Badge Overlay */}
        {userLocation && (
          <div className="absolute top-4 right-4 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 flex items-center space-x-2 shadow-xl">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-300">
              {chargers.length} charger{chargers.length !== 1 ? 's' : ''} within{' '}
              <span className="text-emerald-400">{radiusKm} km</span>
            </span>
          </div>
        )}

        {/* AI Chat */}
        <AIChatWidget onFlyToCharger={handleFlyToCharger} />
      </div>
    </div>
  );
};

export default MapPage;
