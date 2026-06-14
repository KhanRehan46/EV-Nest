import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { 
  MapPin, 
  Zap, 
  History, 
  Car, 
  Settings, 
  HelpCircle, 
  Fan, 
  Unlock, 
  Lock, 
  ShieldCheck, 
  Eye, 
  Activity, 
  Compass, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';
import logo from '../logo.png';
import SettingsPanel from '../components/SettingsPanel';
import HelpPanel from '../components/HelpPanel';

/* ─── Programmatic 3D Car Component via Three.js ───────────────────────── */
const ThreeDCar = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(5, 2.2, 6.2);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
    directionalLight.position.set(5, 8, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Colored rim lights to make it look futuristic and matching the green/blue theme
    const rimLight1 = new THREE.DirectionalLight(0x39ff14, 1.8);
    rimLight1.position.set(-5, 2, -5);
    scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(0x00e5ff, 1.2);
    rimLight2.position.set(5, 2, -5);
    scene.add(rimLight2);
    
    // Grid Floor
    const gridHelper = new THREE.GridHelper(12, 24, 0x1f2a3a, 0x111622);
    gridHelper.position.y = -0.55;
    scene.add(gridHelper);
    
    // Build Car Group
    const carGroup = new THREE.Group();
    
    // Materials
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a2f35, // Premium Dark Teal
      metalness: 0.95,
      roughness: 0.15,
    });
    
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c0f12,
      metalness: 0.9,
      roughness: 0.05,
      transparent: true,
      opacity: 0.85,
    });
    
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.8,
    });
    
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.9,
      roughness: 0.35,
    });
    
    const lightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    
    const tailLightMaterial = new THREE.MeshBasicMaterial({
      color: 0xff1744,
    });
    
    // Lower body chassis
    const bodyGeom = new THREE.BoxGeometry(2.8, 0.38, 1.2);
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMaterial);
    bodyMesh.position.y = 0.1;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    carGroup.add(bodyMesh);
    
    // Cabin (upper glass house)
    const cabinGeom = new THREE.BoxGeometry(1.5, 0.34, 0.98);
    const cabinMesh = new THREE.Mesh(cabinGeom, glassMaterial);
    cabinMesh.position.set(-0.15, 0.44, 0);
    cabinMesh.castShadow = true;
    carGroup.add(cabinMesh);
    
    // Hood slant / front slope
    const hoodGeom = new THREE.BoxGeometry(0.55, 0.18, 1.2);
    const hoodMesh = new THREE.Mesh(hoodGeom, bodyMaterial);
    hoodMesh.position.set(1.4, 0.05, 0);
    hoodMesh.rotation.z = -0.16;
    hoodMesh.castShadow = true;
    carGroup.add(hoodMesh);

    // Spoiler / Rear trunk slope
    const trunkGeom = new THREE.BoxGeometry(0.4, 0.16, 1.2);
    const trunkMesh = new THREE.Mesh(trunkGeom, bodyMaterial);
    trunkMesh.position.set(-1.42, 0.08, 0);
    trunkMesh.rotation.z = 0.12;
    trunkMesh.castShadow = true;
    carGroup.add(trunkMesh);
    
    // Wheels (4 cylinders)
    const wheelGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.24, 24);
    wheelGeom.rotateX(Math.PI / 2);
    
    const rimGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.26, 12);
    rimGeom.rotateX(Math.PI / 2);
    
    const wheelPositions = [
      { x: 0.8, z: 0.64 },  // Front Left
      { x: 0.8, z: -0.64 }, // Front Right
      { x: -0.8, z: 0.64 }, // Rear Left
      { x: -0.8, z: -0.64 },// Rear Right
    ];
    
    const wheels = [];
    wheelPositions.forEach((pos) => {
      const wheelSubGroup = new THREE.Group();
      wheelSubGroup.position.set(pos.x, -0.1, pos.z);
      
      const tyre = new THREE.Mesh(wheelGeom, wheelMaterial);
      const rim = new THREE.Mesh(rimGeom, rimMaterial);
      
      tyre.castShadow = true;
      wheelSubGroup.add(tyre);
      wheelSubGroup.add(rim);
      
      carGroup.add(wheelSubGroup);
      wheels.push(wheelSubGroup);
    });
    
    // Headlights
    const headlightGeom = new THREE.BoxGeometry(0.08, 0.06, 0.16);
    const hlLeft = new THREE.Mesh(headlightGeom, lightMaterial);
    hlLeft.position.set(1.68, 0.14, 0.44);
    const hlRight = hlLeft.clone();
    hlRight.position.z = -0.44;
    carGroup.add(hlLeft);
    carGroup.add(hlRight);
    
    // Headlight glowing lights
    const hlLightL = new THREE.PointLight(0x00e5ff, 2.5, 4);
    hlLightL.position.set(1.75, 0.14, 0.44);
    const hlLightR = hlLightL.clone();
    hlLightR.position.z = -0.44;
    carGroup.add(hlLightL);
    carGroup.add(hlLightR);
    
    // Tail lights
    const tailLightGeom = new THREE.BoxGeometry(0.04, 0.05, 0.35);
    const tlLeft = new THREE.Mesh(tailLightGeom, tailLightMaterial);
    tlLeft.position.set(-1.42, 0.2, 0.32);
    const tlRight = tlLeft.clone();
    tlRight.position.z = -0.32;
    carGroup.add(tlLeft);
    carGroup.add(tlRight);
    
    // Underglow Neon Pointlight
    const underglow = new THREE.PointLight(0x00e5ff, 4, 2.8);
    underglow.position.set(0, -0.4, 0);
    carGroup.add(underglow);
    
    scene.add(carGroup);
    camera.lookAt(0, 0.15, 0);
    
    // Drag rotation controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    const onMouseDown = () => { isDragging = true; };
    const onMouseMove = (e) => {
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };
      
      if (isDragging) {
        carGroup.rotation.y += deltaMove.x * 0.005;
        const nextRotX = carGroup.rotation.x + deltaMove.y * 0.005;
        if (nextRotX > -0.4 && nextRotX < 0.4) {
          carGroup.rotation.x = nextRotX;
        }
      }
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDragging = false; };
    
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    // Touch support
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e) => {
      if (isDragging && e.touches.length === 1) {
        const deltaMove = {
          x: e.touches[0].clientX - previousMousePosition.x,
          y: e.touches[0].clientY - previousMousePosition.y
        };
        carGroup.rotation.y += deltaMove.x * 0.005;
        const nextRotX = carGroup.rotation.x + deltaMove.y * 0.005;
        if (nextRotX > -0.4 && nextRotX < 0.4) {
          carGroup.rotation.x = nextRotX;
        }
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    
    container.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onMouseUp);
    
    // Animation Loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (!isDragging) {
        carGroup.rotation.y += 0.0025; // Slow rotation
      }
      
      // Rotate wheels slightly
      wheels.forEach((w) => {
        w.rotation.z -= 0.025;
      });
      
      renderer.render(scene, camera);
    };
    animate();
    
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[320px] cursor-grab active:cursor-grabbing" />;
};

/* ─── Animated Radar/Range Map Component ────────────────────────────────── */
const RadarMap = () => {
  return (
    <div className="relative h-44 bg-slate-950/40 border border-slate-900/60 rounded-2xl overflow-hidden flex items-center justify-center">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.015)_1px,transparent_1px)] bg-[size:14px_14px]" />
      
      {/* Scanner wave sweeps */}
      <div 
        className="absolute w-[200%] h-[200%] origin-center"
        style={{
          background: 'conic-gradient(from 0deg, rgba(57,255,20,0.08) 0deg, transparent 75deg, transparent 360deg)',
          animation: 'radar-sweep 5s linear infinite',
          borderRadius: '50%'
        }}
      />
      
      {/* Pulsing Concentric rings */}
      <div className="absolute w-24 h-24 rounded-full border border-emerald-500/10 animate-ping opacity-35" style={{ animationDuration: '3.5s' }} />
      <div className="absolute w-44 h-44 rounded-full border border-emerald-500/5 animate-ping opacity-20" style={{ animationDuration: '5s', animationDelay: '1.8s' }} />
      
      {/* Static Concentric Grid rings */}
      <div className="absolute w-12 h-12 rounded-full border border-emerald-500/20" />
      <div className="absolute w-28 h-28 rounded-full border border-emerald-500/10" />
      <div className="absolute w-48 h-48 rounded-full border border-emerald-500/5" />
      <div className="absolute w-64 h-64 rounded-full border border-emerald-500/3" />
      
      {/* Compass crosshairs */}
      <div className="absolute w-full h-[1px] bg-emerald-500/5" />
      <div className="absolute h-full w-[1px] bg-emerald-500/5" />

      {/* Target Center Blip */}
      <div className="relative z-10">
        <span className="flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
        </span>
      </div>
      
      {/* Info labels */}
      <div className="absolute bottom-3 left-4 text-left z-20">
        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Radius: ~262 mi</p>
        <p className="text-[8px] text-slate-500">84% Battery Reach Coverage</p>
      </div>

      <div className="absolute top-3 right-4 text-right z-20 flex items-center space-x-1.5 bg-slate-950/80 px-2 py-0.5 border border-slate-850 rounded text-[9px] text-slate-400 font-bold uppercase">
        <Compass className="h-3 w-3 text-emerald-400" />
        <span>Gps Locked</span>
      </div>

      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

/* ─── Vehicle Dashboard Screen ────────────────────────────────────────── */
const VehicleDashboard = () => {
  const [sentryMode, setSentryMode] = useState(true);
  const [chargeLimit, setChargeLimit] = useState(90);
  const [climateActive, setClimateActive] = useState(false);
  const [carLocked, setCarLocked] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const batteryPct = 84;
  const navigate = useNavigate();

  // Sidebar navigation mapping
  const navItems = [
    { id: 'map',     icon: MapPin,   label: 'Map',      href: '/' },
    { id: 'charger', icon: Zap,      label: 'Chargers', href: '/' },
    { id: 'session', icon: History,  label: 'Sessions', href: '/dashboard' },
    { id: 'vehicle', icon: Car,      label: 'Vehicle',  href: '/vehicle', active: true },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-row overflow-hidden font-sans select-none">
      
      {/* ── Left Sidebar Navigation ──────────────────────────────────────── */}
      <nav className="w-64 bg-[#0a0c10] border-r border-[#151923] flex flex-col justify-between p-6 shrink-0 z-20">
        <div className="flex flex-col">
          {/* Brand/Logo Header */}
          <div className="flex items-center space-x-3 mb-8">
            <img src={logo} className="h-8 w-8 object-contain" alt="EV Nest Logo" />
            <div>
              <div className="font-black text-base text-white tracking-tight leading-none">EV Nest</div>
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Live Energy</span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-[#39ff14] hover:bg-[#32e610] text-[#0a0e0f] font-black py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 mb-8 text-sm"
          >
            <MapPin className="h-4 w-4 fill-current" />
            <span className="font-extrabold">Find Station</span>
          </button>

          {/* Nav List */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const IconComp = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`flex items-center space-x-3 py-3 px-4 rounded-xl text-sm font-extrabold transition-all ${
                    item.active 
                      ? 'bg-[#3b47ab] text-white shadow-lg shadow-indigo-600/10' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  <IconComp className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4">
          <div className="space-y-1">
            <button onClick={() => setShowSettings(true)} className="w-full flex items-center space-x-3 py-2 px-4 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button onClick={() => setShowHelp(true)} className="w-full flex items-center space-x-3 py-2 px-4 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors">
              <HelpCircle className="h-4 w-4" />
              <span>Support</span>
            </button>
          </div>

          {/* User profile details */}
          <div className="flex items-center space-x-3 pt-4 border-t border-[#1b202e]/60">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-inner">
              AM
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white leading-none">Alex M.</span>
              <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Premium Member</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Dashboard Content ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto z-10 relative">
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] rounded-full bg-emerald-500/3 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full bg-indigo-500/3 blur-[100px] pointer-events-none -z-10" />

        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-black text-white tracking-tight">Model S Plaid</h1>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Sync</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">📍 Parked at Home &bull; Updated 2 mins ago</p>
          </div>

          {/* Quick controls toggle */}
          <div className="flex space-x-2">
            <button 
              onClick={() => setClimateActive(!climateActive)}
              className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center space-x-2 border transition-all ${
                climateActive 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
              }`}
            >
              <Fan className={`h-4.5 w-4.5 ${climateActive ? 'animate-spin' : ''}`} style={{ animationDuration: '2.5s' }} />
              <span>Climate {climateActive ? '• 21°C' : ''}</span>
            </button>
            <button 
              onClick={() => setCarLocked(!carLocked)}
              className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center space-x-2 border transition-all ${
                !carLocked 
                  ? 'bg-[#39ff14]/10 border-[#39ff14]/30 text-[#39ff14]' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
              }`}
            >
              {carLocked ? (
                <>
                  <Lock className="h-4.5 w-4.5" />
                  <span>Lock</span>
                </>
              ) : (
                <>
                  <Unlock className="h-4.5 w-4.5" />
                  <span>Unlocked</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dashboard Grid Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          
          {/* ── Left Column (Spans 2): SOC, 3D Canvas, Radar ─────────────── */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            
            {/* Main State of Charge & 3D Interactive Canvas */}
            <div className="bg-[#0b0c10]/95 border border-[#161a23] rounded-3xl p-6 relative flex flex-col shadow-2xl">
              
              {/* Battery Metrics Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">State of Charge</p>
                  <div className="flex items-baseline space-x-0.5 mt-1">
                    <span className="text-6xl font-black text-[#39ff14] tracking-tight">{batteryPct}</span>
                    <span className="text-2xl font-black text-[#39ff14]">%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Est. Range</p>
                  <p className="text-2xl font-black text-white mt-1">312 <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">mi</span></p>
                </div>
              </div>

              {/* 3D Car WebGL Container */}
              <div className="w-full h-80 relative mt-2 rounded-2xl overflow-hidden flex items-center justify-center">
                <ThreeDCar />
                
                {/* Drag hint overlay */}
                <div className="absolute bottom-2 right-4 text-[9px] uppercase tracking-widest text-slate-500 pointer-events-none bg-slate-950/40 px-2 py-0.5 rounded border border-slate-900/60 font-bold">
                  🖱️ Drag to rotate 3D model
                </div>
              </div>

              {/* Charge Limit Slider */}
              <div className="mt-4 pt-4 border-t border-[#1b202e]/60">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                  <span>0%</span>
                  <span className="text-emerald-400 font-black">Limit: {chargeLimit}%</span>
                  <span>100%</span>
                </div>
                <div className="relative flex items-center">
                  <input 
                    type="range" 
                    min="50" 
                    max="100" 
                    value={chargeLimit} 
                    onChange={(e) => setChargeLimit(Number(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  {/* Neon slide highlight */}
                  <div 
                    className="absolute h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg pointer-events-none shadow-[0_0_8px_rgba(57,255,20,0.5)]" 
                    style={{ width: `${(chargeLimit - 50) / 50 * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Sonar Reach Map Card */}
            <div className="bg-[#0b0c10]/95 border border-[#161a23] rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Range Map</p>
                <span className="text-[10px] font-bold text-slate-400">Reach based on 84% charge</span>
              </div>
              <RadarMap />
            </div>

          </div>

          {/* ── Right Column: Battery Health, Tire, Sentry, Sessions ───────── */}
          <div className="flex flex-col space-y-6">
            
            {/* Battery Health Badge */}
            <div className="bg-[#0b0c10]/95 border border-[#161a23] rounded-3xl p-5 flex items-center justify-between shadow-2xl">
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest text-slate-500">Battery Health</p>
                  <p className="text-sm font-black text-white mt-0.5">98% <span className="text-emerald-400 font-extrabold text-xs ml-1">Excellent</span></p>
                </div>
              </div>
            </div>

            {/* Tire Pressure Schematic */}
            <div className="bg-[#0b0c10]/95 border border-[#161a23] rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Tire Pressure</p>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded">Nominal</span>
              </div>

              {/* 2x2 Tires Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { pos: 'Front Left', value: '36', unit: 'psi', status: 'ok' },
                  { pos: 'Front Right', value: '36', unit: 'psi', status: 'ok' },
                  { pos: 'Rear Left', value: '35', unit: 'psi', status: 'ok' },
                  { pos: 'Rear Right', value: '36', unit: 'psi', status: 'ok' },
                ].map((tire, idx) => (
                  <div key={idx} className="bg-slate-950/40 border border-slate-900/80 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[9px] uppercase font-bold text-slate-500">{tire.pos}</span>
                    <div className="flex items-baseline space-x-1 mt-2">
                      <span className="text-2xl font-black text-white tracking-tight">{tire.value}</span>
                      <span className="text-[10px] font-bold text-slate-400">{tire.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentry Mode Card */}
            <div className="bg-[#0b0c10]/95 border border-[#161a23] rounded-3xl p-5 flex items-center justify-between shadow-2xl">
              <div className="flex items-center space-x-3.5">
                <div className={`p-2.5 rounded-xl border transition-all ${
                  sentryMode 
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                    : 'bg-slate-800 border-slate-750 text-slate-500'
                }`}>
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest text-slate-500">Security Guard</p>
                  <p className="text-sm font-black text-white mt-0.5">Sentry Mode</p>
                  <p className="text-[9px] text-slate-500 font-semibold mt-0.5">2 events recorded</p>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <div 
                onClick={() => setSentryMode(!sentryMode)}
                className={`w-12 h-6.5 rounded-full p-1 cursor-pointer transition-all duration-200 ${
                  sentryMode ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 transform ${
                  sentryMode ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </div>
            </div>

            {/* Recent Sessions Card */}
            <div className="bg-[#0b0c10]/95 border border-[#161a23] rounded-3xl p-6 shadow-2xl flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Recent Sessions</p>
                  <Link to="/dashboard" className="text-[10px] font-black uppercase text-emerald-400 tracking-widest hover:text-emerald-300">View All</Link>
                </div>

                {/* Session list items */}
                <div className="space-y-3">
                  {[
                    { loc: 'Supercharger - San Jose', date: 'Today, 2:15 PM', cost: '+$14.50', energy: '+42 kWh' },
                    { loc: 'Home Charging', date: 'Yesterday, 11:30 PM', cost: '+$4.20', energy: '+65 kWh' },
                  ].map((session, idx) => (
                    <div key={idx} className="bg-slate-950/20 border border-slate-900/80 rounded-2xl p-3.5 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{session.loc}</h4>
                        <p className="text-[9px] text-slate-500 font-semibold mt-0.5">{session.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-emerald-400">{session.cost}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">{session.energy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1b202e]/60 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                <span>Total Energy Logged</span>
                <span className="text-white font-black">107 kWh</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Settings & Help Panels */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

export default VehicleDashboard;
