import React, { useEffect, useRef, useState } from 'react';
import API from '../api/axios';
import { Calculator, Zap, Compass, MapPin, Sparkles, Navigation, AlertCircle } from 'lucide-react';
import L from 'leaflet';

// 15 popular Indian EVs with real battery sizes and real-world average range efficiency (km per kWh)
const EV_DATABASE = [
  { model: 'Tata Nexon EV Max', capacity: 40.5, efficiency: 7.2, maxRange: 290 },
  { model: 'Tata Nexon EV Prime', capacity: 30.2, efficiency: 6.8, maxRange: 205 },
  { model: 'MG ZS EV', capacity: 50.3, efficiency: 7.0, maxRange: 350 },
  { model: 'Tata Tiago EV', capacity: 24.0, efficiency: 7.3, maxRange: 175 },
  { model: 'Tata Punch EV Long Range', capacity: 35.0, efficiency: 7.4, maxRange: 260 },
  { model: 'BYD Atto 3', capacity: 60.5, efficiency: 7.1, maxRange: 430 },
  { model: 'Hyundai Kona Electric', capacity: 39.2, efficiency: 7.4, maxRange: 290 },
  { model: 'Mahindra XUV400', capacity: 39.4, efficiency: 6.8, maxRange: 268 },
  { model: 'Citroen eC3', capacity: 29.2, efficiency: 6.9, maxRange: 200 },
  { model: 'MG Comet EV', capacity: 17.3, efficiency: 8.6, maxRange: 150 },
  { model: 'Hyundai Ioniq 5', capacity: 72.6, efficiency: 7.0, maxRange: 508 },
  { model: 'BYD E6', capacity: 71.7, efficiency: 6.5, maxRange: 466 },
  { model: 'Kia EV6', capacity: 77.4, efficiency: 6.8, maxRange: 526 },
  { model: 'BMW i4 eDrive40', capacity: 83.9, efficiency: 6.2, maxRange: 520 },
  { model: 'Tata Tigor EV', capacity: 26.0, efficiency: 6.9, maxRange: 180 },
];

const RangeCalculator = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const rangeCircleRef = useRef(null);

  // Selector states
  const [selectedEvIndex, setSelectedEvIndex] = useState(0);
  const [batteryPercent, setBatteryPercent] = useState(80);
  
  // Destination states
  const [destination, setDestination] = useState('');
  const [destinationSearchRes, setDestinationSearchRes] = useState(null);
  const [suggestedStop, setSuggestedStop] = useState(null);

  // Data states
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default driver location (centered at Surat)
  const currentCoords = [21.1702, 72.8311]; 

  useEffect(() => {
    const fetchAllChargers = async () => {
      try {
        const { data } = await API.get('/chargers');
        setChargers(data);
      } catch (err) {
        console.error('Error fetching chargers for calculator:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllChargers();
  }, []);

  // Initialize Map
  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;

    const map = L.map(container, {
      center: currentCoords,
      zoom: 8,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    container.classList.add('dark-map');

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    L.marker(currentCoords, {
      icon: L.divIcon({
        html: `<div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-slate-100 font-bold shadow-lg shadow-blue-500/25">🚗</div>`,
        className: 'driver-home-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })
    }).bindPopup('<div class="p-1 font-bold text-xs text-slate-200">Your Current Position</div>').addTo(map);

    mapInstanceRef.current = map;

    // ResizeObserver fires the moment the container has real pixel size
    const ro = new ResizeObserver(() => {
      if (container.offsetWidth > 0 && container.offsetHeight > 0) {
        map.invalidateSize();
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

  const selectedEv = EV_DATABASE[selectedEvIndex];
  
  // Calculate range in km
  // range = capacity * efficiency * (percent/100)
  const remainingCapacityKwh = selectedEv.capacity * (batteryPercent / 100);
  const remainingRangeKm = Math.round(remainingCapacityKwh * selectedEv.efficiency);

  // Draw Range Circle and filter chargers inside range
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    // Clear previous range circle if exists
    if (rangeCircleRef.current) {
      mapInstanceRef.current.removeLayer(rangeCircleRef.current);
    }

    // Clear previous markers
    markersGroupRef.current.clearLayers();

    // 1. Draw Range limit circle (radius is in meters)
    const rangeInMeters = remainingRangeKm * 1000;
    const circle = L.circle(currentCoords, {
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.08,
      weight: 1.5,
      radius: rangeInMeters,
      dashArray: '5, 8',
    }).addTo(mapInstanceRef.current);

    rangeCircleRef.current = circle;

    // Helper to calculate distance in km between two lat/lng coordinates (Haversine formula)
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c; // Distance in km
      return d;
    };

    // 2. Render chargers on map
    chargers.forEach((charger) => {
      const distance = getDistance(currentCoords[0], currentCoords[1], charger.lat, charger.lng);
      const isWithinRange = distance <= remainingRangeKm;

      // Render marker pin with customized colors based on range availability
      const pinColor = isWithinRange ? 'bg-emerald-500 text-slate-950 charger-pulse-active' : 'bg-slate-700 text-slate-500 opacity-60';
      const borderClass = isWithinRange ? 'border-white' : 'border-slate-800';

      const marker = L.marker([charger.lat, charger.lng], {
        icon: L.divIcon({
          html: `<div class="w-8 h-8 rounded-full ${pinColor} border-2 ${borderClass} flex items-center justify-center font-bold text-sm shadow-md">${isWithinRange ? '⚡' : '🔌'}</div>`,
          className: 'calculator-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        })
      });

      const popupHtml = `
        <div class="p-1">
          <h4 class="font-bold text-xs text-slate-100">${charger.title}</h4>
          <div class="text-[10px] text-slate-400 mt-1">${charger.connectorType} • ${charger.speedKw} kW</div>
          <div class="text-[10px] font-bold text-slate-200 mt-1 flex justify-between">
            <span>Distance:</span>
            <span class="${isWithinRange ? 'text-emerald-400' : 'text-rose-400'}">${Math.round(distance)} km away</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml).addTo(markersGroupRef.current);
    });

    // Auto-adjust zoom to show the entire range circle
    mapInstanceRef.current.fitBounds(circle.getBounds(), { padding: [20, 20] });

  }, [chargers, remainingRangeKm]);

  // Destination Charging Stop suggestions
  // Coordinates database for mock destination routes
  const DESTINATIONS = {
    ahmedabad: { name: 'Ahmedabad', coords: [23.0225, 72.5714], dist: 260 },
    vadodara: { name: 'Vadodara', coords: [22.3072, 73.1812], dist: 140 },
    mumbai: { name: 'Mumbai', coords: [19.0760, 72.8777], dist: 280 },
    pune: { name: 'Pune', coords: [18.5204, 73.8567], dist: 350 },
  };

  const handleCalculateRoute = (e) => {
    e.preventDefault();
    setSuggestedStop(null);
    setDestinationSearchRes(null);

    const destKey = destination.toLowerCase().trim();
    const dest = DESTINATIONS[destKey];

    if (!dest) {
      alert('Destination not configured for demo. Try searching "Ahmedabad", "Vadodara", "Mumbai", or "Pune".');
      return;
    }

    setDestinationSearchRes(dest);

    // If destination is within remaining range, no stop is needed
    if (dest.dist <= remainingRangeKm) {
      setSuggestedStop({ noStopNeeded: true });
      return;
    }

    // Helper distance
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    // Find a charger that lies along the route.
    // We can evaluate chargers where distance(Home -> Charger) <= remainingRangeKm
    // AND it minimizes distance(Charger -> Destination) to find the best midway stop!
    const viableStops = chargers.filter((charger) => {
      const distFromStart = getDistance(currentCoords[0], currentCoords[1], charger.lat, charger.lng);
      return distFromStart < remainingRangeKm && charger.isLive;
    });

    if (viableStops.length > 0) {
      // Find the one closest to the halfway mark (or furthest along start that fits start range)
      viableStops.sort((a, b) => {
        const distA = getDistance(currentCoords[0], currentCoords[1], a.lat, a.lng);
        const distB = getDistance(currentCoords[0], currentCoords[1], b.lat, b.lng);
        return distB - distA; // prefer furthest possible charging station within initial range
      });

      const bestStop = viableStops[0];
      const stopDist = getDistance(currentCoords[0], currentCoords[1], bestStop.lat, bestStop.lng);
      setSuggestedStop({
        charger: bestStop,
        distance: Math.round(stopDist),
      });
    } else {
      setSuggestedStop({ noStopsFound: true });
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-4 md:p-8 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
        
        {/* Left Column: Calculation controls */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col justify-start space-y-6 overflow-y-auto pr-2 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
              <Calculator className="h-7 w-7 text-emerald-400" />
              <span>EV Range tool</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Simulate battery depletion and map charger boundaries</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Your EV Model</label>
              <select
                value={selectedEvIndex}
                onChange={(e) => setSelectedEvIndex(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {EV_DATABASE.map((ev, idx) => (
                  <option key={idx} value={idx}>{ev.model}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold uppercase tracking-wider text-slate-400">Current Battery %</label>
                <span className="font-bold text-emerald-400">{batteryPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={batteryPercent}
                onChange={(e) => setBatteryPercent(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>5%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="h-[1px] bg-slate-800 my-2"></div>

            {/* Range Output Box */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Remaining Range Output</span>
              <h2 className="text-4xl font-black text-emerald-400">{remainingRangeKm} km</h2>
              <span className="text-[10px] text-slate-500 block">Based on {selectedEv.efficiency} km/kWh efficiency</span>
            </div>
          </div>

          {/* Route Suggestion Panel */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-extrabold text-sm text-slate-250 flex items-center">
              <Compass className="h-4.5 w-4.5 text-emerald-400 mr-2" />
              <span>Route Charger Stop Planner</span>
            </h3>

            <form onSubmit={handleCalculateRoute} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-450 uppercase font-semibold mb-1">Enter Destination</label>
                <div className="relative">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Search: Ahmedabad, Vadodara, Mumbai, Pune"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <button type="submit" className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-emerald-400">
                    <Navigation className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </form>

            {/* Results of Planner */}
            {destinationSearchRes && suggestedStop && (
              <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl space-y-3 animate-in fade-in duration-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Route Distance</span>
                  <span className="font-bold text-slate-200">{destinationSearchRes.dist} km</span>
                </div>

                <div className="h-[1px] bg-slate-850"></div>

                {suggestedStop.noStopNeeded && (
                  <div className="text-xs text-emerald-400 font-semibold flex items-center space-x-1.5">
                    <Sparkles className="h-4.5 w-4.5 shrink-0 animate-pulse" />
                    <span>Plenty of range! No stops required.</span>
                  </div>
                )}

                {suggestedStop.noStopsFound && (
                  <div className="text-xs text-rose-400 font-semibold flex items-center space-x-1.5">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>Out of range! No midway chargers found.</span>
                  </div>
                )}

                {suggestedStop.charger && (
                  <div className="space-y-2">
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Suggested midway stop:</div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                      <h4 className="font-bold text-xs text-slate-200 truncate">{suggestedStop.charger.title}</h4>
                      <p className="text-[10px] text-slate-550 truncate">{suggestedStop.charger.address}</p>
                      <div className="flex justify-between items-center text-[10px] text-emerald-400 font-bold pt-1">
                        <span>Stop at: {suggestedStop.distance} km</span>
                        <span>{suggestedStop.charger.connectorType} ({suggestedStop.charger.speedKw}kW)</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-normal">
                      Recharge at this station before continuing your trip.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Full map space */}
        <div className="flex-1 rounded-2xl overflow-hidden relative border border-slate-800 shadow-xl" style={{ height: 'calc(100vh - 64px)' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} className="z-10" />
        </div>

      </div>
    </div>
  );
};

export default RangeCalculator;
