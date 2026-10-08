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
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, maskCurrency } from '../../utils/formatters';
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

  const { theme } = useTheme();
  const isLight = theme === 'light';

  const { 
    bankStatsList, 
    cashBalance, 
    netAvailableMoney, 
    monthExpense, 
    transactions,
    settings,
    galaxyMode,
    setGalaxyMode,
    isMasked
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
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const backlightRef = useRef<THREE.DirectionalLight | null>(null);
  const coreLightRef = useRef<THREE.PointLight | null>(null);
  const starsMeshRef = useRef<THREE.Points | null>(null);
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

    // 1. Scene with theme-adaptive background
    const scene = new THREE.Scene();
    const initBgColor = isLight ? 0xF4F8F6 : 0x10221E;
    scene.background = new THREE.Color(initBgColor);
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

    // 3. Renderer with clear color
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(new THREE.Color(initBgColor), 1);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isLight ? 1.1 : 1.2;
    rendererRef.current = renderer;

    // 4. Ambient & Directional Lights — Adaptive Brightness
    const ambientLight = new THREE.AmbientLight(
      isLight ? 0xF0FDF4 : 0x89D7B7,
      isLight ? 0.9 : 0.45
    );
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const emeraldBacklight = new THREE.DirectionalLight(
      isLight ? 0x287A74 : 0x428475,
      isLight ? 1.4 : 1.2
    );
    emeraldBacklight.position.set(40, 30, -20);
    scene.add(emeraldBacklight);
    backlightRef.current = emeraldBacklight;

    const coreLight = new THREE.PointLight(
      isLight ? 0x287A74 : 0xFFF4E1,
      isLight ? 1.8 : 2.8,
      100,
      0.8
    );
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);
    coreLightRef.current = coreLight;

    // 5. Subtle Star Dust / Emerald Starfield Particles
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 160;
      starPositions[i + 1] = (Math.random() - 0.5) * 160;
      starPositions[i + 2] = (Math.random() - 0.5) * 160;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: new THREE.Color(isLight ? 0x287A74 : 0x89D7B7),
      size: isLight ? 0.75 : 0.9,
      transparent: true,
      opacity: isLight ? 0.4 : 0.65,
      sizeAttenuation: true,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);
    starsMeshRef.current = starPoints;

    // 6. Orbital system group
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
      starGeo.dispose();
      starMat.dispose();
      scene.clear();
    };
  }, [settings.galaxyIntensity]);

  // Dynamic Theme Adaptations for Background, Lights & Star Dust
  useEffect(() => {
    const isLightMode = theme === 'light';
    const targetBg = isLightMode ? 0xF4F8F6 : 0x10221E;

    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(targetBg);
    }
    if (rendererRef.current) {
      rendererRef.current.setClearColor(new THREE.Color(targetBg), 1);
    }
    if (ambientLightRef.current) {
      ambientLightRef.current.color.set(isLightMode ? 0xF0FDF4 : 0x89D7B7);
      ambientLightRef.current.intensity = isLightMode ? 0.9 : 0.45;
    }
    if (backlightRef.current) {
      backlightRef.current.color.set(isLightMode ? 0x287A74 : 0x428475);
      backlightRef.current.intensity = isLightMode ? 1.4 : 1.2;
    }
    if (coreLightRef.current) {
      coreLightRef.current.color.set(isLightMode ? 0x287A74 : 0xFFF4E1);
      coreLightRef.current.intensity = isLightMode ? 1.8 : 2.8;
    }
    if (starsMeshRef.current) {
      const mat = starsMeshRef.current.material as THREE.PointsMaterial;
      mat.color.set(isLightMode ? 0x287A74 : 0x89D7B7);
      mat.opacity = isLightMode ? 0.4 : 0.65;
    }
  }, [theme]);

  // Native non-passive Wheel listener to suppress passive event listener violations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cam = cameraRotationRef.current;
      cam.radius = Math.max(20, Math.min(75, cam.radius + e.deltaY * 0.04));
      updateCameraPosition();
    };

    canvas.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', onNativeWheel);
    };
  }, []);

  // Build Celestial Bodies whenever Mode, Data, or Theme Changes
  useEffect(() => {
    if (!sceneRef.current || !planetsGroupRef.current) return;

    const group = planetsGroupRef.current;
    // Clear previous celestial objects from group
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }
    interactiveObjectsRef.current = [];

    const isLightMode = theme === 'light';

    // Helper: Create Glowing Sun Core — Theme Adaptive
    const sunRadius = galaxyMode === 'accounts' ? 3.4 : 3.0;
    const sunColor = galaxyMode === 'accounts' 
      ? (isLightMode ? 0x133834 : 0x89D7B7) 
      : (isLightMode ? 0x991B1B : 0x428475);
    const sunEmissive = galaxyMode === 'accounts' 
      ? (isLightMode ? 0x287A74 : 0x428475) 
      : (isLightMode ? 0xDC2626 : 0x1A312C);

    const sunGeo = new THREE.SphereGeometry(sunRadius, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: sunColor,
      emissive: sunEmissive,
      emissiveIntensity: isLightMode ? 0.65 : 1.4,
      roughness: isLightMode ? 0.35 : 0.25,
      metalness: isLightMode ? 0.45 : 0.75,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData = {
      id: 'core-sun',
      isSun: true,
      name: galaxyMode === 'accounts' ? 'NET AVAILABLE' : 'TOTAL EXPENSES',
      type: galaxyMode === 'accounts' ? 'Core Available Capital' : 'Monthly Outflow',
      balance: galaxyMode === 'accounts' ? netAvailableMoney : monthExpense,
      color: galaxyMode === 'accounts' 
        ? (isLightMode ? '#133834' : '#89D7B7') 
        : (isLightMode ? '#991B1B' : '#428475'),
    };
    group.add(sunMesh);
    sunMeshRef.current = sunMesh;
    interactiveObjectsRef.current.push(sunMesh);

    // Glowing Corona Atmosphere Mesh
    const coronaGeo = new THREE.SphereGeometry(sunRadius * 1.25, 24, 24);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: isLightMode ? 0x287A74 : sunColor,
      transparent: true,
      opacity: isLightMode ? 0.18 : 0.25,
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
          color: isLightMode ? new THREE.Color(0x287A74) : new THREE.Color(item.color),
          transparent: true,
          opacity: isLightMode ? 0.25 : 0.22,
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
          emissiveIntensity: isLightMode ? 0.22 : 0.45,
          roughness: isLightMode ? 0.35 : 0.3,
          metalness: isLightMode ? 0.35 : 0.6,
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
            color: isLightMode ? new THREE.Color(0x287A74) : new THREE.Color(item.color),
            transparent: true,
            opacity: isLightMode ? 0.35 : 0.4,
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
          color: isLightMode ? new THREE.Color(0x287A74) : new THREE.Color(cat.color),
          transparent: true,
          opacity: isLightMode ? 0.25 : 0.22,
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
          emissiveIntensity: isLightMode ? 0.22 : 0.4,
          roughness: isLightMode ? 0.4 : 0.4,
          metalness: isLightMode ? 0.35 : 0.5,
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
  }, [galaxyMode, bankStatsList, cashBalance, netAvailableMoney, monthExpense, categoryStats, theme]);

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

      // Slowly rotate star particles
      if (starsMeshRef.current && isRotating && !settings.reduceMotion) {
        starsMeshRef.current.rotation.y += 0.0003;
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
      className={`relative w-full h-[400px] sm:h-[480px] lg:h-[540px] rounded-3xl overflow-hidden border shadow-md backdrop-blur-xl group select-none transition-colors duration-300 ${
        isLight
          ? 'bg-[#F4F8F6] border-[#287A74]/20'
          : 'bg-[#10221E] border-[var(--card-border)]'
      }`}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        className="w-full h-full block touch-none"
        style={{ touchAction: 'none' }}
      />

      {/* Top Header: Decoupled View Switcher & Simulation Controls */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-10 pointer-events-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        {/* View Switcher Tabs with no-scrollbar and shrink-0 */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pointer-events-auto">
          <div className={`flex items-center p-1 rounded-2xl backdrop-blur-md shadow-sm shrink-0 transition-colors ${
            isLight
              ? 'bg-white/90 border border-[#287A74]/20'
              : 'bg-[#1A312C]/90 border border-[#89D7B7]/20'
          }`}>
            <button
              onClick={() => setGalaxyMode('accounts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                galaxyMode === 'accounts'
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] shadow-xs'
                  : isLight
                    ? 'text-[#133834] hover:text-[#287A74]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Orbit size={14} className="shrink-0" />
              <span className="whitespace-nowrap">Accounts Orbit</span>
            </button>
            <button
              onClick={() => setGalaxyMode('expenses')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                galaxyMode === 'expenses'
                  ? 'bg-[var(--accent-surface)] text-[var(--text-primary)] border border-[var(--accent-primary)]/40 shadow-xs'
                  : isLight
                    ? 'text-[#133834] hover:text-[#287A74]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <TrendingDown size={14} className="shrink-0" />
              <span className="whitespace-nowrap">Expense Universe</span>
            </button>
          </div>

          {/* Live Orbit Status Pill */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-semibold backdrop-blur-md shrink-0 transition-colors ${
            isLight
              ? 'bg-white/90 border border-[#287A74]/20 text-[#133834]'
              : 'bg-[#1A312C]/90 border border-[#89D7B7]/20 text-[var(--text-secondary)]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isRotating && !settings?.reduceMotion ? 'bg-[var(--accent-primary)] animate-ping' : 'bg-[var(--divider)]'}`} />
            <span>{isRotating && !settings?.reduceMotion ? 'Orbital Motion' : 'Stationary'}</span>
          </div>
        </div>

        {/* Floating Glassmorphic Camera Controls Pill */}
        <div className={`flex items-center gap-1.5 p-1 rounded-2xl backdrop-blur-md shadow-sm pointer-events-auto self-end sm:self-auto shrink-0 transition-colors ${
          isLight
            ? 'bg-white/90 text-[#133834] border border-[#287A74]/20'
            : 'bg-[#1A312C]/90 text-[#FFF4E1] border border-[#89D7B7]/20'
        }`}>
          <button
            onClick={() => setIsRotating(!isRotating)}
            title={isRotating ? 'Pause Orbit' : 'Resume Orbit'}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isLight ? 'hover:bg-[#287A74]/10 hover:text-[#133834]' : 'hover:bg-white/10 hover:text-[#FFF4E1]'
            }`}
          >
            {isRotating ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={() => handleZoom('in')}
            title="Zoom In"
            className={`p-2 rounded-xl transition cursor-pointer ${
              isLight ? 'hover:bg-[#287A74]/10 hover:text-[#133834]' : 'hover:bg-white/10 hover:text-[#FFF4E1]'
            }`}
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => handleZoom('out')}
            title="Zoom Out"
            className={`p-2 rounded-xl transition cursor-pointer ${
              isLight ? 'hover:bg-[#287A74]/10 hover:text-[#133834]' : 'hover:bg-white/10 hover:text-[#FFF4E1]'
            }`}
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={handleResetCamera}
            title="Reset View Angle"
            className={`p-2 rounded-xl transition cursor-pointer ${
              isLight ? 'hover:bg-[#287A74]/10 hover:text-[#133834]' : 'hover:bg-white/10 hover:text-[#FFF4E1]'
            }`}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Center Top: Cosmic Command Headline */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none text-center hidden md:block">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest shadow-xs ${
          isLight
            ? 'bg-white/90 border border-[#287A74]/20 text-[#133834]'
            : 'bg-[#1A312C]/90 border border-[#89D7B7]/20 text-[var(--text-secondary)]'
        }`}>
          <Sparkles size={11} className="text-[var(--accent-primary)]" />
          <span>Fintech Galaxy Orbital Matrix</span>
        </div>
      </div>

      {/* Dynamic Hover HUD Card */}
      {hoveredItem && (
        <div 
          className={`absolute z-20 pointer-events-none transition-all duration-75 p-3.5 rounded-2xl shadow-xl backdrop-blur-xl text-left min-w-[190px] animate-in fade-in zoom-in-95 ${
            isLight
              ? 'bg-white/95 border border-[#287A74]/25 text-[#133834] shadow-[#287A74]/15'
              : 'bg-[#10221E]/95 border border-[#89D7B7]/20 text-[#FFF4E1] shadow-black/40'
          }`}
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
            <span className={`text-xs font-black truncate ${isLight ? 'text-[#133834]' : 'text-[var(--text-headings)]'}`}>
              {hoveredItem.name}
            </span>
          </div>

          <p className={`text-[10px] uppercase font-mono font-bold tracking-wider mb-2 ${isLight ? 'text-[#287A74]' : 'text-[var(--text-muted)]'}`}>
            {hoveredItem.type}
          </p>

          {hoveredItem.balance !== undefined && (
            <div className={`text-base font-black font-mono ${isLight ? 'text-[#133834]' : 'text-[var(--text-primary)]'}`}>
              {isMasked ? maskCurrency(settings?.currency) : formatCurrency(hoveredItem.balance, settings?.currency)}
            </div>
          )}

          {hoveredItem.amount !== undefined && (
            <div className="space-y-1">
              <div className="text-sm font-black font-mono text-red-500">
                {isMasked ? maskCurrency(settings?.currency) : formatCurrency(hoveredItem.amount, settings?.currency)}
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] pt-1 border-t border-[var(--divider)] font-mono">
                <span>{hoveredItem.txCount} txs</span>
                <span>Avg: {isMasked ? `${settings?.currency?.symbol || '₹'} •••` : formatCurrency(hoveredItem.avgAmount || 0, settings?.currency)}</span>
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
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md text-[11px] ${
        isLight
          ? 'bg-white/90 border border-[#287A74]/20 text-[#133834]'
          : 'bg-[#1A312C]/90 border border-[#89D7B7]/20 text-[var(--text-secondary)]'
      }`}>
        <Info size={12} className="text-[var(--accent-primary)]" />
        <span className="hidden sm:inline">Drag to rotate • Scroll to zoom • Click planet for telemetry</span>
        <span className="sm:hidden">Drag to orbit • Tap planet for telemetry</span>
      </div>
    </div>
  );
};
