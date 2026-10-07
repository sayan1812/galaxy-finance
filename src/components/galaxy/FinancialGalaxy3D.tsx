import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Orbit, 
  RotateCcw, 
  Play, 
  Pause, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  TrendingDown, 
  ChevronRight,
  Info
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';
import type { BankComputedStats } from '../../types';

interface FinancialGalaxy3DProps {
  onSelectBank?: (bankStats: BankComputedStats) => void;
  onSelectCategory?: (category: string) => void;
}

export const FinancialGalaxy3D: React.FC<FinancialGalaxy3DProps> = ({
  onSelectBank,
  onSelectCategory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { 
    bankStatsList, 
    cashBalance, 
    netAvailableMoney, 
    monthExpense, 
    transactions,
    settings,
    galaxyMode,
    setGalaxyMode
  } = useTransactions();

  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [hoveredItem, setHoveredItem] = useState<{
    id: string;
    name: string;
    type: string;
    balance?: number;
    amount?: number;
    txCount?: number;
    avgAmount?: number;
    color: string;
    isSun?: boolean;
  } | null>(null);

  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // References for three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planetsGroupRef = useRef<THREE.Group | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const coronaMeshRef = useRef<THREE.Mesh | null>(null);
  const interactiveObjectsRef = useRef<THREE.Mesh[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Drag interaction states
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraRotationRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3.2,
    radius: 42,
  });

  // Category statistics for Expense Galaxy Mode
  const categoryStats = useMemo(() => {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth();

    const monthTxns = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === curYear && d.getMonth() === curMonth && t.type === 'EXPENSE';
    });

    const map = new Map<string, { total: number; count: number }>();
    monthTxns.forEach((t) => {
      const cur = map.get(t.category) || { total: 0, count: 0 };
      cur.total += t.amount;
      cur.count += 1;
      map.set(t.category, cur);
    });

    const colors = ['#f43f5e', '#ec4899', '#f97316', '#eab308', '#06b6d4', '#8b5cf6', '#3b82f6', '#10b981'];

    return Array.from(map.entries())
      .map(([category, data], idx) => ({
        category,
        total: data.total,
        count: data.count,
        avg: data.count > 0 ? Math.round(data.total / data.count) : 0,
        color: colors[idx % colors.length],
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 7); // top 7 spending planets
  }, [transactions]);

  // Initial Scene Setup
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // Set initial camera position from spherical coordinates
    const { theta, phi, radius } = cameraRotationRef.current;
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // 4. Ambient & Directional Lights — Jade & Emerald Edition
    const ambientLight = new THREE.AmbientLight(0x89D7B7, 0.45);
    scene.add(ambientLight);

    const emeraldBacklight = new THREE.DirectionalLight(0x428475, 1.2);
    emeraldBacklight.position.set(40, 30, -20);
    scene.add(emeraldBacklight);

    const coreLight = new THREE.PointLight(0xFFF4E1, 2.8, 100, 0.8);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // 5. Orbital system group
    const planetsGroup = new THREE.Group();
    planetsGroupRef.current = planetsGroup;
    scene.add(planetsGroup);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      scene.clear();
    };
  }, [settings.galaxyIntensity]);

  // Build Celestial Bodies whenever Mode or Data Changes
  useEffect(() => {
    if (!sceneRef.current || !planetsGroupRef.current) return;

    const group = planetsGroupRef.current;
    // Clear previous celestial objects from group
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }
    interactiveObjectsRef.current = [];

    // Helper: Create Glowing Sun Core — Jade & Emerald Edition
    const sunRadius = galaxyMode === 'accounts' ? 3.4 : 3.0;
    const sunColor = galaxyMode === 'accounts' ? 0x89D7B7 : 0x428475;
    const sunEmissive = galaxyMode === 'accounts' ? 0x428475 : 0x1A312C;

    const sunGeo = new THREE.SphereGeometry(sunRadius, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: sunColor,
      emissive: sunEmissive,
      emissiveIntensity: 1.4,
      roughness: 0.25,
      metalness: 0.75,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData = {
      id: 'core-sun',
      isSun: true,
      name: galaxyMode === 'accounts' ? 'NET AVAILABLE' : 'TOTAL EXPENSES',
      type: galaxyMode === 'accounts' ? 'Core Available Capital' : 'Monthly Outflow',
      balance: galaxyMode === 'accounts' ? netAvailableMoney : monthExpense,
      color: galaxyMode === 'accounts' ? '#89D7B7' : '#428475',
    };
    group.add(sunMesh);
    sunMeshRef.current = sunMesh;
    interactiveObjectsRef.current.push(sunMesh);

    // Glowing Corona Atmosphere Mesh
    const coronaGeo = new THREE.SphereGeometry(sunRadius * 1.25, 24, 24);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: sunColor,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    group.add(coronaMesh);
    coronaMeshRef.current = coronaMesh;

    // MODE 1: ACCOUNTS GALAXY (Net Available at center, Banks & Cash orbiting)
    if (galaxyMode === 'accounts') {
      const allOrbits = [
        ...bankStatsList.map((bs, idx) => ({
          id: bs.bank.id,
          name: bs.bank.bankName,
          subname: bs.bank.nickname || bs.bank.accountType,
          type: 'BANK',
          balance: bs.currentBalance,
          bankStats: bs,
          color: bs.bank.planetColor || bs.bank.color || '#38bdf8',
          orbitRadius: 9 + idx * 5.2,
          speed: 0.008 / (1 + idx * 0.25),
          size: Math.max(1.1, Math.min(2.4, 0.9 + Math.log10(Math.max(100, bs.currentBalance)) * 0.3)),
          hasRings: idx === 0, // largest bank has rings
        })),
        {
          id: 'cash-wallet-planet',
          name: 'Cash Wallet',
          subname: 'Physical Cash',
          type: 'CASH',
          balance: cashBalance,
          color: '#fbbf24',
          orbitRadius: 7.2,
          speed: 0.015,
          size: Math.max(1.0, Math.min(2.0, 0.8 + Math.log10(Math.max(100, cashBalance)) * 0.28)),
          hasRings: false,
        },
      ];

      allOrbits.forEach((item, index) => {
        // Orbit Path Ring
        const ringGeo = new THREE.RingGeometry(item.orbitRadius - 0.06, item.orbitRadius + 0.06, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(item.color),
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        group.add(ringMesh);

        // Planet Pivot Group (rotates around center)
        const planetPivot = new THREE.Group();
        planetPivot.userData = { speed: item.speed, currentAngle: (index * Math.PI * 2) / allOrbits.length };

        // Planet Sphere
        const pGeo = new THREE.SphereGeometry(item.size, 28, 28);
        const pMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(item.color),
          emissive: new THREE.Color(item.color),
          emissiveIntensity: 0.45,
          roughness: 0.3,
          metalness: 0.6,
        });
        const planetMesh = new THREE.Mesh(pGeo, pMat);
        planetMesh.position.set(item.orbitRadius, 0, 0);

        planetMesh.userData = {
          id: item.id,
          name: item.name,
          type: item.subname,
          balance: item.balance,
          color: item.color,
          bankStats: (item as unknown as { bankStats?: BankComputedStats }).bankStats,
          baseScale: 1,
        };

        // Planetary Saturn-style Ring if configured
        if (item.hasRings) {
          const pRingGeo = new THREE.RingGeometry(item.size * 1.35, item.size * 1.85, 32);
          const pRingMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(item.color),
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
          });
          const pRing = new THREE.Mesh(pRingGeo, pRingMat);
          pRing.rotation.x = Math.PI / 2.5;
          planetMesh.add(pRing);
        }

        planetPivot.add(planetMesh);
        group.add(planetPivot);
        interactiveObjectsRef.current.push(planetMesh);
      });
    }

    // MODE 2: 3D EXPENSE VISUALIZATION ("Expense Sun" & Category Planets)
    if (galaxyMode === 'expenses') {
      categoryStats.forEach((cat, index) => {
        const orbitRadius = 7.5 + index * 4.4;
        const speed = 0.012 / (1 + index * 0.2);
        // Size proportional to monthly spend
        const size = Math.max(0.9, Math.min(2.5, 0.7 + (cat.total / (monthExpense || 1)) * 3.5));

        // Orbit Ring
        const ringGeo = new THREE.RingGeometry(orbitRadius - 0.05, orbitRadius + 0.05, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(cat.color),
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        group.add(ringMesh);

        // Planet Pivot
        const planetPivot = new THREE.Group();
        planetPivot.userData = { speed, currentAngle: (index * Math.PI * 2) / categoryStats.length };

        const pGeo = new THREE.SphereGeometry(size, 24, 24);
        const pMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(cat.color),
          emissive: new THREE.Color(cat.color),
          emissiveIntensity: 0.4,
          roughness: 0.4,
          metalness: 0.5,
        });
        const planetMesh = new THREE.Mesh(pGeo, pMat);
        planetMesh.position.set(orbitRadius, 0, 0);

        planetMesh.userData = {
          id: `cat-${cat.category}`,
          name: cat.category,
          type: 'Expense Category',
          amount: cat.total,
          txCount: cat.count,
          avgAmount: cat.avg,
          color: cat.color,
          baseScale: 1,
        };

        planetPivot.add(planetMesh);
        group.add(planetPivot);
        interactiveObjectsRef.current.push(planetMesh);
      });
    }
  }, [galaxyMode, bankStatsList, cashBalance, netAvailableMoney, monthExpense, categoryStats]);

  // Animation Loop (GPU Friendly)
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (now: number = performance.now()) => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Rotate Sun Core
      if (sunMeshRef.current) {
        sunMeshRef.current.rotation.y += 0.005;
      }
      if (coronaMeshRef.current) {
        coronaMeshRef.current.rotation.y -= 0.004;
        coronaMeshRef.current.rotation.x += 0.002;
      }

      // Rotate Orbit Pivots if motion is active
      if (isRotating && !settings.reduceMotion && planetsGroupRef.current) {
        planetsGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Group && child.userData.speed) {
            child.userData.currentAngle += child.userData.speed * (delta * 60);
            child.rotation.y = child.userData.currentAngle;
          }
        });
      }

      // Render Scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isRotating, settings.reduceMotion]);

  // Camera Orbit Controls & Raycasting Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    // Handle Drag Camera Rotation
    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      const cam = cameraRotationRef.current;
      cam.theta -= deltaX * 0.008;
      cam.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, cam.phi - deltaY * 0.008));

      updateCameraPosition();
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Raycast for Hover Interaction
    if (!cameraRef.current || interactiveObjectsRef.current.length === 0) return;

    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const intersects = raycaster.intersectObjects(interactiveObjectsRef.current);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      if (hit.userData) {
        setHoveredItem(hit.userData as typeof hoveredItem);
        hit.scale.set(1.15, 1.15, 1.15);
        if (canvasRef.current) canvasRef.current.style.cursor = 'pointer';
        return;
      }
    }

    // Reset scales of all objects when not hovered
    interactiveObjectsRef.current.forEach((obj) => obj.scale.set(1, 1, 1));
    setHoveredItem(null);
    if (canvasRef.current) canvasRef.current.style.cursor = 'default';
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !cameraRef.current) return;

    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const intersects = raycaster.intersectObjects(interactiveObjectsRef.current);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const data = hit.userData;

      if (data.bankStats && onSelectBank) {
        onSelectBank(data.bankStats);
      } else if (data.name && galaxyMode === 'expenses' && onSelectCategory) {
        onSelectCategory(data.name);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const cam = cameraRotationRef.current;
    cam.radius = Math.max(20, Math.min(75, cam.radius + e.deltaY * 0.04));
    updateCameraPosition();
  };

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraRotationRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 0, 0);
  };

  const handleResetCamera = () => {
    cameraRotationRef.current = {
      theta: Math.PI / 4,
      phi: Math.PI / 3.2,
      radius: 42,
    };
    updateCameraPosition();
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const cam = cameraRotationRef.current;
    const step = 6;
    cam.radius = direction === 'in' 
      ? Math.max(20, cam.radius - step) 
      : Math.min(75, cam.radius + step);
    updateCameraPosition();
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] rounded-3xl overflow-hidden bg-[var(--card-bg)] border border-[var(--card-border)] shadow-md backdrop-blur-xl group select-none"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="w-full h-full block touch-none"
      />

      {/* Top Left: Galaxy Mode & Status Indicator */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="flex items-center p-1 rounded-2xl bg-[var(--card-bg)]/90 border border-[var(--card-border)] backdrop-blur-md shadow-sm">
          <button
            onClick={() => setGalaxyMode('accounts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              galaxyMode === 'accounts'
                ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Orbit size={14} />
            <span>Accounts Orbit</span>
          </button>
          <button
            onClick={() => setGalaxyMode('expenses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              galaxyMode === 'expenses'
                ? 'bg-[var(--accent-surface)] text-[var(--text-primary)] border border-[var(--accent-primary)]/40 shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <TrendingDown size={14} />
            <span>Expense Universe</span>
          </button>
        </div>

        {/* Live Orbit Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-bg)]/80 border border-[var(--card-border)] text-[11px] font-mono font-semibold text-[var(--text-secondary)] backdrop-blur-md">
          <span className={`w-2 h-2 rounded-full ${isRotating && !settings.reduceMotion ? 'bg-[var(--accent-primary)] animate-ping' : 'bg-[var(--divider)]'}`} />
          <span>{isRotating && !settings.reduceMotion ? 'Orbital Motion' : 'Stationary'}</span>
        </div>
      </div>

      {/* Top Right: Cosmic Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--card-bg)]/90 border border-[var(--card-border)] backdrop-blur-md shadow-sm text-[var(--text-secondary)]">
        <button
          onClick={() => setIsRotating(!isRotating)}
          title={isRotating ? 'Pause Orbit' : 'Resume Orbit'}
          className="p-2 rounded-xl hover:bg-[var(--row-hover-bg)] hover:text-[var(--text-primary)] transition cursor-pointer"
        >
          {isRotating ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={() => handleZoom('in')}
          title="Zoom In"
          className="p-2 rounded-xl hover:bg-[var(--row-hover-bg)] hover:text-[var(--text-primary)] transition cursor-pointer"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => handleZoom('out')}
          title="Zoom Out"
          className="p-2 rounded-xl hover:bg-[var(--row-hover-bg)] hover:text-[var(--text-primary)] transition cursor-pointer"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={handleResetCamera}
          title="Reset View Angle"
          className="p-2 rounded-xl hover:bg-[var(--row-hover-bg)] hover:text-[var(--text-primary)] transition cursor-pointer"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Center Top: Cosmic Command Headline */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none text-center hidden md:block">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)] shadow-xs">
          <Sparkles size={11} className="text-[var(--accent-primary)]" />
          <span>Fintech Galaxy Orbital Matrix</span>
        </div>
      </div>

      {/* Dynamic Hover HUD Card */}
      {hoveredItem && (
        <div 
          className="absolute z-20 pointer-events-none transition-all duration-75 p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl backdrop-blur-xl text-left min-w-[190px] animate-in fade-in zoom-in-95"
          style={{
            left: Math.min(window.innerWidth - 220, Math.max(16, mousePos.x + 14)),
            top: Math.min(420, Math.max(16, mousePos.y - 45)),
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span 
              className="w-3 h-3 rounded-full flex-shrink-0 shadow-xs" 
              style={{ backgroundColor: hoveredItem.color }} 
            />
            <span className="text-xs font-black text-[var(--text-headings)] truncate">{hoveredItem.name}</span>
          </div>

          <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--text-muted)] mb-2">
            {hoveredItem.type}
          </p>

          {hoveredItem.balance !== undefined && (
            <div className="text-base font-black font-mono text-[var(--text-primary)]">
              {formatCurrency(hoveredItem.balance, settings.currency)}
            </div>
          )}

          {hoveredItem.amount !== undefined && (
            <div className="space-y-1">
              <div className="text-sm font-black font-mono text-red-400">
                {formatCurrency(hoveredItem.amount, settings.currency)}
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] pt-1 border-t border-[var(--divider)] font-mono">
                <span>{hoveredItem.txCount} txs</span>
                <span>Avg: {formatCurrency(hoveredItem.avgAmount || 0, settings.currency)}</span>
              </div>
            </div>
          )}

          <div className="mt-2 pt-1 border-t border-[var(--divider)] flex items-center justify-between text-[9px] text-[var(--accent-primary)] font-semibold">
            <span>Click to explore</span>
            <ChevronRight size={10} />
          </div>
        </div>
      )}

      {/* Bottom Center: Quick Nav Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card-bg)]/90 border border-[var(--card-border)] backdrop-blur-md text-[11px] text-[var(--text-secondary)]">
        <Info size={12} className="text-[var(--accent-primary)]" />
        <span className="hidden sm:inline">Drag to rotate • Scroll to zoom • Click planet for telemetry</span>
        <span className="sm:hidden">Drag to orbit • Tap planet for telemetry</span>
      </div>
    </div>
  );
};
