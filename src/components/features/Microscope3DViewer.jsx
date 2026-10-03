import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { 
  RotateCw, 
  RotateCcw,
  Lightbulb, 
  Camera, 
  ZoomIn, 
  Compass,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Sparkles,
  Layers,
  Move,
  Sliders,
  Eye
} from 'lucide-react';

/*
  =============================================================================
  MICROSCOPE 3D MODEL — HANDS-ON INTERACTIVE LAB REPLICA
  =============================================================================
  Features:
  - 3D DIRECTIONAL ARROWS FOR KNOBS (Putar Depan / Belakang: ▲ Naik / ▼ Turun)
  - 3D DIRECTIONAL ARROWS FOR STAGE & SLIDE (Geser Kiri ◀ / Kanan ▶ & Maju ▲ / Mundur ▼)
  - ON-CANVAS TACTILE D-PADS FOR BOTH FOCUS KNOBS & STAGE TRANSLATION
  - ROTATION LOCK BUTTON: Freezes camera so dragging only moves knobs/stage
  - FULL-SIZED PROMINENT 3D WORKSTATION
*/

// ─────────── MATERIALS PALETTE ───────────
const useMicroscopeMaterials = () => {
  return useMemo(() => ({
    whiteBody: new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.20,
      metalness: 0.06,
    }),
    slateSpine: new THREE.MeshStandardMaterial({
      color: '#475569',
      roughness: 0.35,
      metalness: 0.22,
    }),
    darkBase: new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.35,
      metalness: 0.40,
    }),
    stageBlack: new THREE.MeshStandardMaterial({
      color: '#262f3f',
      roughness: 0.35,
      metalness: 0.35,
    }),
    chrome: new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      roughness: 0.14,
      metalness: 0.90,
    }),
    brushedMetal: new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.28,
      metalness: 0.75,
    }),
    rubber: new THREE.MeshStandardMaterial({
      color: '#18181b',
      roughness: 0.88,
      metalness: 0.05,
    }),
    knobDark: new THREE.MeshStandardMaterial({
      color: '#272e39',
      roughness: 0.42,
      metalness: 0.35,
    }),
    glassSlide: new THREE.MeshPhysicalMaterial({
      color: '#e0f2fe',
      roughness: 0.05,
      transmission: 0.85,
      thickness: 0.15,
      ior: 1.52,
      transparent: true,
      opacity: 0.75,
    }),
    lensGlass: new THREE.MeshPhysicalMaterial({
      color: '#38bdf8',
      roughness: 0.04,
      transmission: 0.70,
      thickness: 0.25,
      ior: 1.54,
    }),
    bandRed: new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.35 }),
    bandYellow: new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.35 }),
    bandBlue: new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.35 }),
    bandGreen: new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.35 }),
    lightActive: new THREE.MeshStandardMaterial({
      color: '#fffbeb',
      emissive: '#fef08a',
      emissiveIntensity: 1.8,
      roughness: 0.1,
    }),
    lightOff: new THREE.MeshStandardMaterial({
      color: '#64748b',
      roughness: 0.5,
    }),
    // Glowing cyan/amber directional arrow marker material
    arrowGlowAmber: new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: '#d97706',
      emissiveIntensity: 0.8,
      roughness: 0.2,
    }),
    arrowGlowCyan: new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 0.8,
      roughness: 0.2,
    }),
  }), []);
};

// ─────────── 1. BASE & ILLUMINATOR ───────────
const BaseAssembly = ({ 
  m, 
  lightOn, 
  diaphragm = 80, 
  onToggleLight, 
  onAdjustDiaphragm,
  onHoverPart,
  onSelectPart 
}) => (
  <group onClick={(e) => { e.stopPropagation(); onSelectPart?.('base'); }}>
    <mesh material={m.darkBase} position={[0, 0.07, 0.05]} castShadow receiveShadow>
      <boxGeometry args={[2.5, 0.14, 3.2]} />
    </mesh>
    <mesh material={m.darkBase} position={[0, 0.07, 1.6]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.07, 0.07, 2.5, 20]} />
    </mesh>

    {[[-1.05, 0.02, -1.3], [1.05, 0.02, -1.3], [-1.05, 0.02, 1.4], [1.05, 0.02, 1.4]].map((pos, idx) => (
      <mesh key={idx} material={m.rubber} position={pos}>
        <cylinderGeometry args={[0.12, 0.14, 0.04, 16]} />
      </mesh>
    ))}

    <mesh material={m.knobDark} position={[0.45, 0.07, 1.62]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.09, 0.09, 0.35, 24]} />
    </mesh>

    <mesh material={m.whiteBody} position={[0, 0.36, -0.05]} castShadow receiveShadow>
      <boxGeometry args={[2.2, 0.44, 2.8]} />
    </mesh>
    <mesh material={m.whiteBody} position={[0, 0.36, 1.35]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.22, 0.22, 2.2, 24, 1, false, 0, Math.PI]} />
    </mesh>
    <mesh material={m.whiteBody} position={[0, 0.58, -0.1]} castShadow>
      <boxGeometry args={[2.0, 0.06, 2.4]} />
    </mesh>

    {/* Power Switch on left flank */}
    <group 
      position={[-1.12, 0.36, -0.65]}
      onClick={(e) => {
        e.stopPropagation();
        onToggleLight?.();
      }}
      onPointerOver={(e) => { e.stopPropagation(); onHoverPart?.('Saklar Lampu (Klik untuk ON/OFF)'); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); onHoverPart?.(null); document.body.style.cursor = 'default'; }}
    >
      <mesh material={m.darkBase}>
        <boxGeometry args={[0.04, 0.22, 0.16]} />
      </mesh>
      <group rotation={[lightOn ? 0.25 : -0.25, 0, 0]}>
        <mesh material={lightOn ? m.bandGreen : m.rubber} position={[-0.02, 0, 0]}>
          <boxGeometry args={[0.02, 0.16, 0.10]} />
        </mesh>
      </group>
    </group>

    {/* Brightness Dimmer Dial */}
    <group 
      position={[-1.12, 0.36, -0.15]}
      onClick={(e) => {
        e.stopPropagation();
        onAdjustDiaphragm?.(20);
      }}
      onPointerOver={(e) => { e.stopPropagation(); onHoverPart?.('Potensiometer Lampu (Klik)'); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); onHoverPart?.(null); document.body.style.cursor = 'default'; }}
    >
      <mesh material={m.knobDark} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.08, 20]} />
      </mesh>
      <mesh material={m.chrome} position={[-0.045, 0.06, 0]}>
        <boxGeometry args={[0.02, 0.08, 0.02]} />
      </mesh>
    </group>

    {/* Light Source / Field Collector */}
    <group 
      position={[0, 0.59, 0.42]} 
      onClick={(e) => { 
        e.stopPropagation(); 
        onToggleLight?.(); 
        onSelectPart?.('light'); 
      }}
      onPointerOver={(e) => { e.stopPropagation(); onHoverPart?.('Lampu LED (Klik untuk ON/OFF)'); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); onHoverPart?.(null); document.body.style.cursor = 'default'; }}
    >
      <mesh material={m.darkBase} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.44, 0.47, 0.08, 28]} />
      </mesh>
      <mesh material={m.darkBase} position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.39, 0.42, 0.06, 28]} />
      </mesh>
      <mesh material={m.knobDark} position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.34, 0.36, 0.05, 28]} />
      </mesh>
      <mesh material={m.chrome} position={[0, 0.19, 0]}>
        <torusGeometry args={[0.32, 0.02, 8, 28]} />
      </mesh>
      <mesh material={lightOn ? m.lightActive : m.lightOff} position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.02, 28]} />
      </mesh>

      {lightOn && (
        <mesh position={[0, 0.70, 0]}>
          <cylinderGeometry args={[0.25, 0.20, 1.0, 16, 1, true]} />
          <meshBasicMaterial 
            color="#fef08a" 
            transparent 
            opacity={Math.max(0.12, (diaphragm / 100) * 0.40)} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      )}
    </group>
  </group>
);

// ─────────── 2. C-SHAPED CURVED ARM & STAND ───────────
const ArmAssembly = ({ m, onSelectPart }) => (
  <group onClick={(e) => { e.stopPropagation(); onSelectPart?.('arm'); }}>
    <mesh material={m.whiteBody} position={[0, 1.05, -0.65]} castShadow>
      <boxGeometry args={[1.5, 0.95, 0.85]} />
    </mesh>
    <mesh material={m.slateSpine} position={[0, 1.05, -1.02]} castShadow>
      <boxGeometry args={[1.2, 0.95, 0.14]} />
    </mesh>

    <mesh material={m.whiteBody} position={[0, 1.85, -0.72]} rotation={[-0.12, 0, 0]} castShadow>
      <boxGeometry args={[1.35, 0.85, 0.75]} />
    </mesh>
    <mesh material={m.slateSpine} position={[0, 1.85, -1.06]} rotation={[-0.12, 0, 0]} castShadow>
      <boxGeometry args={[1.1, 0.85, 0.14]} />
    </mesh>

    <mesh material={m.whiteBody} position={[0, 2.65, -0.72]} rotation={[0.08, 0, 0]} castShadow>
      <boxGeometry args={[1.30, 0.90, 0.72]} />
    </mesh>
    <mesh material={m.slateSpine} position={[0, 2.65, -1.04]} rotation={[0.08, 0, 0]} castShadow>
      <boxGeometry args={[1.05, 0.90, 0.14]} />
    </mesh>

    <mesh material={m.whiteBody} position={[0, 3.45, -0.52]} rotation={[0.32, 0, 0]} castShadow>
      <boxGeometry args={[1.25, 0.95, 0.75]} />
    </mesh>
    <mesh material={m.slateSpine} position={[0, 3.52, -0.80]} rotation={[0.32, 0, 0]} castShadow>
      <boxGeometry args={[1.0, 0.95, 0.14]} />
    </mesh>

    <mesh material={m.whiteBody} position={[0, 3.92, -0.05]} castShadow>
      <boxGeometry args={[1.25, 0.50, 0.85]} />
    </mesh>
    <mesh material={m.slateSpine} position={[0, 4.15, -0.15]} castShadow>
      <boxGeometry args={[0.95, 0.08, 0.70]} />
    </mesh>

    <mesh material={m.darkBase} position={[0, 2.5, -0.32]} castShadow>
      <boxGeometry args={[0.9, 1.8, 0.06]} />
    </mesh>
  </group>
);

// ─────────── 3. COAXIAL FOCUS KNOBS (WITH 3D ARROW BUTTONS) ───────────
const FocusKnobs = ({ 
  m, 
  coarseFocus = 50, 
  fineFocus = 50, 
  onKnobPointerDown,
  onAdjustCoarse, 
  onAdjustFine,
  onHoverPart,
  onSelectPart 
}) => {
  const coarseAngle = (coarseFocus / 100) * Math.PI * 4;
  const fineAngle = (fineFocus / 100) * Math.PI * 8;

  const KnobUnit = ({ side }) => {
    const xPos = side * 0.88;
    return (
      <group position={[xPos, 1.25, -0.65]}>
        <mesh material={m.darkBase} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.36, 0.38, 0.08, 24]} />
        </mesh>

        {/* COARSE FOCUS KNOB (MAKROMETER) */}
        <group 
          rotation={[side * coarseAngle, 0, 0]}
          onPointerDown={(e) => {
            e.stopPropagation();
            onKnobPointerDown?.('coarse', e);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onAdjustCoarse?.(6);
            onSelectPart?.('coarse');
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAdjustCoarse?.(-6);
          }}
          onWheel={(e) => {
            e.stopPropagation();
            onAdjustCoarse?.(e.deltaY < 0 ? 5 : -5);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHoverPart?.('⚙️ Makrometer: Geser / Scroll / Gunakan Tombol Panah untuk Naik-Turun Meja');
            document.body.style.cursor = 'ns-resize';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHoverPart?.(null);
            document.body.style.cursor = 'default';
          }}
        >
          <mesh 
            material={m.knobDark} 
            position={[side * 0.11, 0, 0]} 
            rotation={[0, 0, Math.PI / 2]} 
            castShadow
          >
            <cylinderGeometry args={[0.34, 0.34, 0.14, 28]} />
          </mesh>
          <mesh material={m.slateSpine} position={[side * 0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.33, 0.02, 6, 28]} />
          </mesh>
          <mesh material={m.chrome} position={[side * 0.185, 0.26, 0]}>
            <boxGeometry args={[0.02, 0.08, 0.02]} />
          </mesh>
        </group>

        {/* FINE FOCUS KNOB (MIKROMETER) */}
        <group 
          rotation={[side * fineAngle, 0, 0]}
          onPointerDown={(e) => {
            e.stopPropagation();
            onKnobPointerDown?.('fine', e);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onAdjustFine?.(4);
            onSelectPart?.('fine');
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAdjustFine?.(-4);
          }}
          onWheel={(e) => {
            e.stopPropagation();
            onAdjustFine?.(e.deltaY < 0 ? 3 : -3);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHoverPart?.('🎯 Mikrometer: Geser / Scroll / Gunakan Tombol Panah untuk Kunci Ketajaman');
            document.body.style.cursor = 'ns-resize';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHoverPart?.(null);
            document.body.style.cursor = 'default';
          }}
        >
          <mesh 
            material={m.chrome} 
            position={[side * 0.22, 0, 0]} 
            rotation={[0, 0, Math.PI / 2]} 
            castShadow
          >
            <cylinderGeometry args={[0.18, 0.18, 0.12, 24]} />
          </mesh>
          <mesh material={m.knobDark} position={[side * 0.27, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.03, 24]} />
          </mesh>
          <mesh material={m.chrome} position={[side * 0.29, 0.11, 0]}>
            <sphereGeometry args={[0.015, 8, 8]} />
          </mesh>
        </group>

        {/* 3D FLOATING ARROW BUTTONS ON KNOBS (Depan / Belakang: Naik / Turun) */}
        <group position={[side * 0.32, 0, 0]}>
          {/* 1. COARSE (MAKROMETER) ARROW: PUTAR KE DEPAN (NAIK ▲) */}
          <group 
            position={[0, 0.48, 0]} 
            onClick={(e) => { e.stopPropagation(); onAdjustCoarse?.(6); }}
            onPointerOver={(e) => { e.stopPropagation(); onHoverPart?.('▲ Putar Makrometer ke Depan (Meja Naik)'); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); onHoverPart?.(null); document.body.style.cursor = 'default'; }}
          >
            <mesh material={m.darkBase} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.13, 0.13, 0.04, 20]} />
            </mesh>
            <mesh material={m.arrowGlowAmber} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.11, 0.11, 0.05, 20]} />
            </mesh>
            <mesh material={m.whiteBody} position={[0, 0, 0.03]} rotation={[0, 0, 0]}>
              <coneGeometry args={[0.075, 0.14, 14]} />
            </mesh>
            <mesh visible={false}>
              <sphereGeometry args={[0.22, 10, 10]} />
            </mesh>
          </group>

          {/* 2. COARSE (MAKROMETER) ARROW: PUTAR KE BELAKANG (TURUN ▼) */}
          <group 
            position={[0, -0.48, 0]} 
            onClick={(e) => { e.stopPropagation(); onAdjustCoarse?.(-6); }}
            onPointerOver={(e) => { e.stopPropagation(); onHoverPart?.('▼ Putar Makrometer ke Belakang (Meja Turun)'); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); onHoverPart?.(null); document.body.style.cursor = 'default'; }}
          >
            <mesh material={m.darkBase} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.13, 0.13, 0.04, 20]} />
            </mesh>
            <mesh material={m.arrowGlowAmber} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.11, 0.11, 0.05, 20]} />
            </mesh>
            <mesh material={m.whiteBody} position={[0, 0, 0.03]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.075, 0.14, 14]} />
            </mesh>
            <mesh visible={false}>
              <sphereGeometry args={[0.22, 10, 10]} />
            </mesh>
          </group>

          {/* 3. FINE (MIKROMETER) ARROW: DEPAN ▲ */}
          <group 
            position={[side * 0.08, 0.28, 0.22]} 
            onClick={(e) => { e.stopPropagation(); onAdjustFine?.(3); }}
            onPointerOver={(e) => { e.stopPropagation(); onHoverPart?.('▲ Putar Mikrometer ke Depan'); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); onHoverPart?.(null); document.body.style.cursor = 'default'; }}
          >
            <mesh material={m.darkBase} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, 0.04, 18]} />
            </mesh>
            <mesh material={m.arrowGlowCyan} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 0.05, 18]} />
            </mesh>
            <mesh material={m.whiteBody} position={[0, 0, 0.03]} rotation={[0, 0, 0]}>
              <coneGeometry args={[0.05, 0.10, 12]} />
            </mesh>
            <mesh visible={false}>
              <sphereGeometry args={[0.18, 10, 10]} />
            </mesh>
          </group>

          {/* 4. FINE (MIKROMETER) ARROW: BELAKANG ▼ */}
          <group 
            position={[side * 0.08, -0.28, 0.22]} 
            onClick={(e) => { e.stopPropagation(); onAdjustFine?.(-3); }}
            onPointerOver={(e) => { e.stopPropagation(); onHoverPart?.('▼ Putar Mikrometer ke Belakang'); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); onHoverPart?.(null); document.body.style.cursor = 'default'; }}
          >
            <mesh material={m.darkBase} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, 0.04, 18]} />
            </mesh>
            <mesh material={m.arrowGlowCyan} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 0.05, 18]} />
            </mesh>
            <mesh material={m.whiteBody} position={[0, 0, 0.03]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.05, 0.10, 12]} />
            </mesh>
            <mesh visible={false}>
              <sphereGeometry args={[0.18, 10, 10]} />
            </mesh>
          </group>
        </group>
      </group>
    );
  };

  return (
    <>
      <KnobUnit side={-1} />
      <KnobUnit side={1} />
    </>
  );
};

// ─────────── 4. STAGE & SLIDE (WITH COAXIAL X-Y KNOBS & 3D ARROW CONTROLS) ───────────
const StageAssembly = ({ 
  m, 
  coarseFocus = 50, 
  stagePosX = 0, 
  stagePosY = 0, 
  specimenColor = '#ec4899',
  specimenName = 'Spesimen Sel Genetika',
  onKnobPointerDown,
  onAdjustStageX,
  onAdjustStageY, 
  onHoverPart,
  onSelectPart 
}) => {
  const stageY = 1.95 + (coarseFocus / 100) * 0.35;
  // Slide offset on stage (scaled smoothly)
  const slideOffsetX = (stagePosX || 0) * 0.012;
  const slideOffsetZ = (stagePosY || 0) * 0.010;

  return (
    <group>
      {/* Black Stage Carrier Bracket */}
      <mesh material={m.darkBase} position={[0, stageY - 0.28, -0.15]} castShadow>
        <boxGeometry args={[0.95, 0.95, 0.35]} />
      </mesh>
      {/* Dovetail slide rail */}
      <mesh material={m.chrome} position={[0, 2.05, -0.01]}>
        <boxGeometry args={[0.35, 1.4, 0.04]} />
      </mesh>

      {/* Main Mechanical Stage Platform (Meja Objek) */}
      <group 
        position={[0, stageY, 0.42]} 
        onClick={(e) => { e.stopPropagation(); onSelectPart?.('stage'); }}
        onPointerOver={(e) => { e.stopPropagation(); onHoverPart?.('Meja Objek Mekanis & Kaca Preparat'); }}
        onPointerOut={(e) => { e.stopPropagation(); onHoverPart?.(null); }}
      >
        <mesh material={m.stageBlack} castShadow receiveShadow>
          <boxGeometry args={[2.3, 0.09, 1.85]} />
        </mesh>
        <mesh material={m.stageBlack} position={[0, 0, 0.925]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 2.3, 20]} />
        </mesh>

        <mesh material={m.darkBase} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.16, 0.28, 24]} />
        </mesh>

        {/* Caliper Vernier Scale Markings along the top edge */}
        <mesh material={m.chrome} position={[0.4, 0.051, -0.72]}>
          <boxGeometry args={[1.0, 0.005, 0.08]} />
        </mesh>
        {[-0.4, -0.2, 0, 0.2, 0.4].map((xTick, i) => (
          <mesh key={i} material={m.knobDark} position={[0.4 + xTick, 0.055, -0.72]}>
            <boxGeometry args={[0.02, 0.006, 0.06]} />
          </mesh>
        ))}

        {/* MECHANICAL CALIPER & GLASS SLIDE (SHIFTS SEAMLESSLY ACROSS STAGE) */}
        <group 
          position={[slideOffsetX, 0, slideOffsetZ]}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHoverPart?.(`🔬 Kaca Preparat: ${specimenName} (Bergeser mengikuti kenop koaksial)`);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHoverPart?.(null);
          }}
        >
          {/* Caliper arm bracket */}
          <mesh material={m.brushedMetal} position={[-0.45, 0.065, -0.3]}>
            <boxGeometry args={[0.85, 0.03, 0.08]} />
          </mesh>
          <mesh material={m.brushedMetal} position={[-0.85, 0.065, 0.05]}>
            <boxGeometry args={[0.08, 0.03, 0.75]} />
          </mesh>
          {/* Spring-loaded curved caliper arm that clamps the slide */}
          <mesh material={m.chrome} position={[-0.45, 0.07, 0.35]} rotation={[0, 0.15, 0]}>
            <boxGeometry args={[0.70, 0.025, 0.06]} />
          </mesh>
          <mesh material={m.chrome} position={[-0.78, 0.07, 0.45]}>
            <cylinderGeometry args={[0.05, 0.05, 0.04, 14]} />
          </mesh>

          {/* Transparent Glass Specimen Slide */}
          <mesh material={m.glassSlide} position={[0, 0.06, 0]}>
            <boxGeometry args={[0.65, 0.018, 1.45]} />
          </mesh>
          
          {/* Frosted label area on top of glass slide */}
          <mesh material={m.whiteBody} position={[0, 0.07, -0.52]}>
            <boxGeometry args={[0.55, 0.005, 0.30]} />
          </mesh>

          {/* Square Coverslip with Dynamic Stained Genetic Cell Sample */}
          <mesh position={[0, 0.075, 0]}>
            <boxGeometry args={[0.38, 0.012, 0.38]} />
            <meshStandardMaterial 
              color={specimenColor} 
              roughness={0.3} 
              transparent 
              opacity={0.85} 
            />
          </mesh>
        </group>

        {/* ====================================================================== */}
        {/* UNDER-STAGE COAXIAL TRANSLATION KNOBS (KENOP MEKANIS X-Y)               */}
        {/* - KENOP ATAS: Sumbu X (Kiri - Kanan)                                   */}
        {/* - KENOP BAWAH: Sumbu Y (Maju - Mundur)                                 */}
        {/* ====================================================================== */}
        <group position={[1.18, -0.30, 0.25]}>
          {/* Bracket stalk attached under stage */}
          <mesh material={m.darkBase} position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.12, 16]} />
          </mesh>
          <mesh material={m.chrome} position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.65, 16]} />
          </mesh>

          {/* 1. UPPER KNOB: SUMBU X (GESER KIRI ◀ / KANAN ▶) */}
          <group position={[0, 0.10, 0]}>
            <group 
              rotation={[0, (stagePosX || 0) * 0.15, 0]}
              onPointerDown={(e) => {
                e.stopPropagation();
                onKnobPointerDown?.('stageX', e);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onAdjustStageX?.(5);
                onSelectPart?.('stage');
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAdjustStageX?.(-5);
              }}
              onWheel={(e) => {
                e.stopPropagation();
                onAdjustStageX?.(e.deltaY < 0 ? 4 : -4);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                onHoverPart?.('⚙️ Kenop Atas (Sumbu X): Putar / Drag Horizontal untuk geser Kiri ◀ / ▶ Kanan');
                document.body.style.cursor = 'ew-resize';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                onHoverPart?.(null);
                document.body.style.cursor = 'default';
              }}
            >
              <mesh material={m.knobDark} castShadow>
                <cylinderGeometry args={[0.155, 0.155, 0.16, 24]} />
              </mesh>
              <mesh material={m.slateSpine}>
                <torusGeometry args={[0.152, 0.015, 6, 24]} />
              </mesh>
              <mesh material={m.chrome} position={[0, -0.075, 0]}>
                <cylinderGeometry args={[0.16, 0.16, 0.02, 24]} />
              </mesh>
              <mesh material={m.whiteBody} position={[0.15, 0, 0]}>
                <sphereGeometry args={[0.018, 8, 8]} />
              </mesh>
            </group>

            {/* 3D FLOATING ARROW BUTTONS FOR UPPER KNOB (KIRI ◀ / KANAN ▶) */}
            <group position={[0.22, 0, 0]}>
              {/* Left Arrow: ◀ Kiri */}
              <group 
                position={[-0.12, 0, 0.15]}
                onClick={(e) => { e.stopPropagation(); onAdjustStageX?.(-5); }}
                onPointerOver={(e) => { e.stopPropagation(); onHoverPart?.('◀ Putar Kenop Atas: Geser Kiri'); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); onHoverPart?.(null); document.body.style.cursor = 'default'; }}
              >
                <mesh material={m.darkBase} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.09, 0.09, 0.03, 16]} />
                </mesh>
                <mesh material={m.arrowGlowCyan} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.075, 0.075, 0.04, 16]} />
                </mesh>
                <mesh material={m.whiteBody} position={[0, 0, 0.025]} rotation={[0, 0, Math.PI / 2]}>
                  <coneGeometry args={[0.05, 0.10, 12]} />
                </mesh>
                <mesh visible={false}>
                  <sphereGeometry args={[0.18, 10, 10]} />
                </mesh>
              </group>

              {/* Right Arrow: Kanan ▶ */}
              <group 
                position={[0.12, 0, 0.15]}
                onClick={(e) => { e.stopPropagation(); onAdjustStageX?.(5); }}
                onPointerOver={(e) => { e.stopPropagation(); onHoverPart?.('▶ Putar Kenop Atas: Geser Kanan'); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); onHoverPart?.(null); document.body.style.cursor = 'default'; }}
              >
                <mesh material={m.darkBase} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.09, 0.09, 0.03, 16]} />
                </mesh>
                <mesh material={m.arrowGlowCyan} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.075, 0.075, 0.04, 16]} />
                </mesh>
                <mesh material={m.whiteBody} position={[0, 0, 0.025]} rotation={[0, 0, -Math.PI / 2]}>
                  <coneGeometry args={[0.05, 0.10, 12]} />
                </mesh>
                <mesh visible={false}>
                  <sphereGeometry args={[0.18, 10, 10]} />
                </mesh>
              </group>
            </group>
          </group>

          {/* 2. LOWER KNOB: SUMBU Y (GESER MAJU ▲ / MUNDUR ▼) */}
          <group position={[0, -0.16, 0]}>
            <group 
              rotation={[0, (stagePosY || 0) * 0.15, 0]}
              onPointerDown={(e) => {
                e.stopPropagation();
                onKnobPointerDown?.('stageY', e);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onAdjustStageY?.(5);
                onSelectPart?.('stage');
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAdjustStageY?.(-5);
              }}
              onWheel={(e) => {
                e.stopPropagation();
                onAdjustStageY?.(e.deltaY < 0 ? 4 : -4);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                onHoverPart?.('⚙️ Kenop Bawah (Sumbu Y): Putar / Drag Vertikal untuk geser Maju ▲ / ▼ Mundur');
                document.body.style.cursor = 'ns-resize';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                onHoverPart?.(null);
                document.body.style.cursor = 'default';
              }}
            >
              <mesh material={m.knobDark} castShadow>
                <cylinderGeometry args={[0.125, 0.125, 0.16, 24]} />
              </mesh>
              <mesh material={m.slateSpine}>
                <torusGeometry args={[0.122, 0.013, 6, 24]} />
              </mesh>
              <mesh material={m.chrome} position={[0, -0.075, 0]}>
                <cylinderGeometry args={[0.13, 0.13, 0.02, 24]} />
              </mesh>
              <mesh material={m.whiteBody} position={[0.12, 0, 0]}>
                <sphereGeometry args={[0.016, 8, 8]} />
              </mesh>
            </group>

            {/* 3D FLOATING ARROW BUTTONS FOR LOWER KNOB (MAJU ▲ / MUNDUR ▼) */}
            <group position={[0.22, 0, 0]}>
              {/* Forward Arrow: ▲ Maju */}
              <group 
                position={[0, 0.12, 0.14]}
                onClick={(e) => { e.stopPropagation(); onAdjustStageY?.(-5); }}
                onPointerOver={(e) => { e.stopPropagation(); onHoverPart?.('▲ Putar Kenop Bawah: Geser Maju'); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); onHoverPart?.(null); document.body.style.cursor = 'default'; }}
              >
                <mesh material={m.darkBase} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
                </mesh>
                <mesh material={m.arrowGlowCyan} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
                </mesh>
                <mesh material={m.whiteBody} position={[0, 0, 0.025]} rotation={[0, 0, 0]}>
                  <coneGeometry args={[0.045, 0.09, 12]} />
                </mesh>
                <mesh visible={false}>
                  <sphereGeometry args={[0.17, 10, 10]} />
                </mesh>
              </group>

              {/* Backward Arrow: Mundur ▼ */}
              <group 
                position={[0, -0.12, 0.14]}
                onClick={(e) => { e.stopPropagation(); onAdjustStageY?.(5); }}
                onPointerOver={(e) => { e.stopPropagation(); onHoverPart?.('▼ Putar Kenop Bawah: Geser Mundur'); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); onHoverPart?.(null); document.body.style.cursor = 'default'; }}
              >
                <mesh material={m.darkBase} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
                </mesh>
                <mesh material={m.arrowGlowCyan} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
                </mesh>
                <mesh material={m.whiteBody} position={[0, 0, 0.025]} rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.045, 0.09, 12]} />
                </mesh>
                <mesh visible={false}>
                  <sphereGeometry args={[0.17, 10, 10]} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* Abbe Condenser & Iris Diaphragm */}
      <group position={[0, stageY - 0.43, 0.42]} onClick={(e) => { e.stopPropagation(); onSelectPart?.('condenser'); }}>
        <mesh material={m.darkBase} castShadow>
          <cylinderGeometry args={[0.33, 0.36, 0.36, 24]} />
        </mesh>
        <mesh material={m.knobDark} position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.08, 24]} />
        </mesh>
        <mesh material={m.chrome} position={[0.42, -0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.25, 12]} />
        </mesh>
        <mesh material={m.lensGlass} position={[0, 0.19, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.03, 20]} />
        </mesh>
        {[-Math.PI / 4, Math.PI / 4].map((ang, i) => (
          <mesh key={i} material={m.chrome} position={[Math.cos(ang) * 0.42, 0.05, Math.sin(ang) * 0.42]} rotation={[0, -ang, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.16, 12]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ─────────── 5. REVOLVING NOSEPIECE & 4 OBJECTIVES ───────────
const ObjectiveLens = ({ m, band, length, scaleRadius = 1, onSelect, label, onHoverPart }) => {
  const r = 0.095 * scaleRadius;
  return (
    <group 
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHoverPart?.(`Lensa Objektif ${label} (Klik untuk Pilih)`);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHoverPart?.(null);
        document.body.style.cursor = 'default';
      }}
    >
      <mesh material={m.chrome} position={[0, -0.06, 0]}>
        <cylinderGeometry args={[r * 1.15, r * 1.05, 0.10, 18]} />
      </mesh>
      <mesh material={m.chrome} position={[0, -length * 0.42, 0]} castShadow>
        <cylinderGeometry args={[r, r * 0.95, length * 0.65, 18]} />
      </mesh>
      <mesh material={m.knobDark} position={[0, -length * 0.32, 0]}>
        <cylinderGeometry args={[r * 1.04, r * 1.04, 0.10, 18]} />
      </mesh>
      <mesh material={band} position={[0, -length * 0.62, 0]}>
        <cylinderGeometry args={[r * 1.06, r * 1.06, 0.06, 18]} />
      </mesh>
      <mesh material={m.chrome} position={[0, -length * 0.84, 0]}>
        <cylinderGeometry args={[r * 0.85, r * 0.58, length * 0.32, 18]} />
      </mesh>
      <mesh material={m.lensGlass} position={[0, -length, 0]}>
        <cylinderGeometry args={[r * 0.45, r * 0.45, 0.02, 16]} />
      </mesh>
    </group>
  );
};

const RevolvingNosepiece = ({ 
  m, 
  objectiveLens = 10, 
  onCycleLens, 
  onSelectLens,
  onHoverPart,
  onSelectPart 
}) => {
  const turretRotationY = useMemo(() => {
    if (objectiveLens === 4) return Math.PI / 2;     // 4x Red
    if (objectiveLens === 40) return -Math.PI / 2;   // 40x Blue
    if (objectiveLens === 100) return Math.PI;       // 100x Green
    return 0;                                       // 10x Yellow default
  }, [objectiveLens]);

  return (
    <group 
      position={[0, 3.28, 0.38]} 
      onClick={(e) => { 
        e.stopPropagation(); 
        onCycleLens?.(); 
        onSelectPart?.('nosepiece'); 
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHoverPart?.('Revolver: Klik untuk Putar Lensa Objektif (4x → 10x → 40x)');
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHoverPart?.(null);
        document.body.style.cursor = 'default';
      }}
    >
      <group rotation={[-0.20, 0, 0]}>
        <group rotation={[0, turretRotationY, 0]}>
          <mesh material={m.chrome} castShadow>
            <cylinderGeometry args={[0.54, 0.58, 0.16, 28]} />
          </mesh>
          <mesh material={m.slateSpine} position={[0, -0.02, 0]}>
            <torusGeometry args={[0.56, 0.025, 8, 28]} />
          </mesh>
          <mesh material={m.darkBase} position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.38, 0.42, 0.06, 24]} />
          </mesh>

          {/* 1. Yellow 10x */}
          <group position={[0, -0.10, 0.32]} rotation={[0.20, 0, 0]}>
            <ObjectiveLens 
              m={m} 
              band={m.bandYellow} 
              length={0.70} 
              scaleRadius={1.05} 
              label="10x Kuning"
              onSelect={() => onSelectLens?.(10)}
              onHoverPart={onHoverPart}
            />
          </group>

          {/* 2. 4x Scanner (Red) */}
          <group position={[-0.32, -0.08, 0]} rotation={[0, 0, 0.35]}>
            <ObjectiveLens 
              m={m} 
              band={m.bandRed} 
              length={0.48} 
              scaleRadius={0.95} 
              label="4x Merah"
              onSelect={() => onSelectLens?.(4)}
              onHoverPart={onHoverPart}
            />
          </group>

          {/* 3. 40x High-Power (Blue) */}
          <group position={[0.32, -0.08, 0]} rotation={[0, 0, -0.35]}>
            <ObjectiveLens 
              m={m} 
              band={m.bandBlue} 
              length={0.82} 
              scaleRadius={1.0} 
              label="40x Biru"
              onSelect={() => onSelectLens?.(40)}
              onHoverPart={onHoverPart}
            />
          </group>

          {/* 4. 100x Oil Immersion (Green) */}
          <group position={[0, -0.08, -0.32]} rotation={[-0.35, 0, 0]}>
            <ObjectiveLens 
              m={m} 
              band={m.bandGreen} 
              length={0.92} 
              scaleRadius={0.98} 
              label="100x Hijau"
              onSelect={() => onSelectLens?.(100)}
              onHoverPart={onHoverPart}
            />
          </group>
        </group>
      </group>
    </group>
  );
};

// ─────────── 6. HEAD & BINOCULAR EYEPIECES ───────────
const EyepieceUnit = ({ m, xPos, isLeft = false, onHoverPart, onInspectEyepiece }) => (
  <group 
    position={[xPos, 0.28, 0.22]} 
    rotation={[0.48, 0, 0]}
    onClick={(e) => {
      e.stopPropagation();
      onInspectEyepiece?.();
    }}
    onPointerOver={(e) => { 
      e.stopPropagation(); 
      onHoverPart?.('👁️ Lensa Okuler 10x (Klik untuk Mengintip Bidang Pandang Okuler)'); 
      document.body.style.cursor = 'pointer'; 
    }}
    onPointerOut={(e) => { 
      e.stopPropagation(); 
      onHoverPart?.(null); 
      document.body.style.cursor = 'default'; 
    }}
  >
    <mesh material={m.darkBase}>
      <cylinderGeometry args={[0.22, 0.25, 0.16, 20]} />
    </mesh>

    {isLeft && (
      <mesh material={m.chrome} position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.08, 20]} />
      </mesh>
    )}

    <mesh material={m.slateSpine} position={[0, 0.50, 0]} castShadow>
      <cylinderGeometry args={[0.18, 0.19, 0.70, 20]} />
    </mesh>

    <mesh material={m.rubber} position={[0, 0.88, 0]}>
      <cylinderGeometry args={[0.24, 0.18, 0.18, 24]} />
    </mesh>
    <mesh material={m.lensGlass} position={[0, 0.92, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 0.02, 20]} />
    </mesh>
  </group>
);

const HeadAssembly = ({ m, onHoverPart, onSelectPart, onInspectEyepiece }) => (
  <group 
    position={[0, 4.12, 0.12]} 
    onClick={(e) => { 
      e.stopPropagation(); 
      onSelectPart?.('head');
      onInspectEyepiece?.();
    }}
    onPointerOver={(e) => { 
      e.stopPropagation(); 
      onHoverPart?.('👁️ Lensa Okuler & Kepala Binokuler (Klik untuk Mengintip)'); 
      document.body.style.cursor = 'pointer'; 
    }}
    onPointerOut={(e) => { 
      e.stopPropagation(); 
      onHoverPart?.(null); 
      document.body.style.cursor = 'default'; 
    }}
  >
    <mesh material={m.whiteBody} position={[0, 0.08, -0.05]} castShadow>
      <boxGeometry args={[1.30, 0.26, 0.85]} />
    </mesh>
    <mesh material={m.chrome} position={[0.68, 0.08, -0.05]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
    </mesh>

    <group position={[0, 0.26, 0.05]} rotation={[-0.15, 0, 0]}>
      <mesh material={m.slateSpine} castShadow>
        <boxGeometry args={[1.22, 0.38, 0.88]} />
      </mesh>
      <mesh material={m.whiteBody} position={[0, 0.12, 0.38]}>
        <boxGeometry args={[1.15, 0.18, 0.14]} />
      </mesh>

      <EyepieceUnit m={m} xPos={-0.34} isLeft={true} onHoverPart={onHoverPart} onInspectEyepiece={onInspectEyepiece} />
      <EyepieceUnit m={m} xPos={0.34} isLeft={false} onHoverPart={onHoverPart} onInspectEyepiece={onInspectEyepiece} />
    </group>
  </group>
);

// ─────────── 7. COMPLETE MICROSCOPE RIG ───────────
const CompleteMicroscopeModel = ({ 
  lightOn = true, 
  diaphragm = 80,
  coarseFocus = 50,
  fineFocus = 50,
  objectiveLens = 10,
  stagePosX = 0,
  stagePosY = 0,
  specimenColor = '#ec4899',
  specimenName = 'Spesimen Sel Genetika',
  onKnobPointerDown,
  onCycleLens,
  onSelectLens,
  onAdjustCoarse,
  onAdjustFine,
  onAdjustStageX,
  onAdjustStageY,
  onToggleLight,
  onAdjustDiaphragm,
  onHoverPart,
  onSelectPart,
  onInspectEyepiece,
  compact = false 
}) => {
  const m = useMicroscopeMaterials();

  return (
    <group position={[0, -2.15, 0]} scale={compact ? 0.88 : 0.94}>
      <BaseAssembly 
        m={m} 
        lightOn={lightOn} 
        diaphragm={diaphragm}
        onToggleLight={onToggleLight}
        onAdjustDiaphragm={onAdjustDiaphragm}
        onHoverPart={onHoverPart}
        onSelectPart={onSelectPart} 
      />
      <ArmAssembly 
        m={m} 
        onSelectPart={onSelectPart} 
      />
      <FocusKnobs 
        m={m} 
        coarseFocus={coarseFocus}
        fineFocus={fineFocus}
        onKnobPointerDown={onKnobPointerDown}
        onAdjustCoarse={onAdjustCoarse}
        onAdjustFine={onAdjustFine}
        onHoverPart={onHoverPart}
        onSelectPart={onSelectPart} 
      />
      <StageAssembly 
        m={m} 
        coarseFocus={coarseFocus} 
        stagePosX={stagePosX}
        stagePosY={stagePosY}
        specimenColor={specimenColor}
        specimenName={specimenName}
        onKnobPointerDown={onKnobPointerDown}
        onAdjustStageX={onAdjustStageX}
        onAdjustStageY={onAdjustStageY}
        onHoverPart={onHoverPart}
        onSelectPart={onSelectPart} 
      />
      <RevolvingNosepiece 
        m={m} 
        objectiveLens={objectiveLens}
        onCycleLens={onCycleLens}
        onSelectLens={onSelectLens}
        onHoverPart={onHoverPart}
        onSelectPart={onSelectPart} 
      />
      <HeadAssembly 
        m={m} 
        onHoverPart={onHoverPart}
        onSelectPart={onSelectPart} 
        onInspectEyepiece={onInspectEyepiece}
      />
    </group>
  );
};

// ─────────── 8. ANATOMY INFORMATION DATABASE ───────────
const MICROSCOPE_PARTS_INFO = {
  head: {
    title: 'Lensa Okuler & Kepala Binokuler',
    desc: 'Sepasang tabung okuler miring 38° ergonomis dengan perbesaran 10x dan pelindung karet (rubber eyecup). Dilengkapi cincin pengatur diopter untuk menyamakan fokus mata kiri dan kanan.',
    color: '#38bdf8'
  },
  nosepiece: {
    title: 'Revolver & Lensa Objektif (4x, 10x, 40x, 100x)',
    desc: 'Dudukan lensa objektif putar (quadruple nosepiece) dengan kode warna standar DIN: Merah (4x), Kuning (10x), Biru (40x), dan Hijau (100x immersion oil). Klik langsung untuk memutar lensa!',
    color: '#eab308'
  },
  stage: {
    title: 'Meja Objek Mekanis & Preparat Kaca',
    desc: 'Platform baja hitam presisi tempat meletakkan kaca preparat spesimen. Geser kaca preparat dengan tombol panah Kiri/Kanan dan Maju/Mundur.',
    color: '#10b981'
  },
  coarse: {
    title: 'Makrometer (Kenop Pengatur Kasar)',
    desc: 'Kenop berdiameter besar untuk menaikkan atau menurunkan meja objek secara cepat. Gunakan tombol panah [▲ Depan / ▼ Belakang] untuk memutar kenop dengan mudah.',
    color: '#f97316'
  },
  fine: {
    title: 'Mikrometer (Kenop Pengatur Halus)',
    desc: 'Kenop koaksial di tengah makrometer untuk pergerakan vertikal mikro, mengunci ketajaman fokus hingga detail kromosom atau sel tampak kristal jernih.',
    color: '#06b6d4'
  },
  condenser: {
    title: 'Kondensor Abbe & Diafragma Iris',
    desc: 'Unit optik pengumpul cahaya di bawah meja objek. Mengatur intensitas dan sudut kerucut sinar yang melewati spesimen untuk menghasilkan kontras optimal.',
    color: '#8b5cf6'
  },
  light: {
    title: 'Sumber Cahaya LED & Diafragma Lapangan',
    desc: 'Lampu LED putih netral pada dasar mikroskop dengan cincin bertingkat dan lensa kolektor kaca, dikendalikan potensiometer pengatur intensitas daya.',
    color: '#eab308'
  },
  arm: {
    title: 'Lengan C-Curved Ergonomis',
    desc: 'Rangka kokoh penyangga kepala optik dan meja objek dengan desain lengkung C modern. Memiliki panel aksen abu-abu gelap (slate) dan ruang pegangan untuk mobilisasi.',
    color: '#94a3b8'
  },
  base: {
    title: 'Kaki & Dasar Mikroskop',
    desc: 'Pondasi kokoh mikroskop dengan kaki karet antiselip, saklar daya ON/OFF samping, dan kenop putar pengatur kecerahan lampu.',
    color: '#cbd5e1'
  }
};

// Responsive Camera Controller for Mobile Portrait Orientation
function ResponsiveCameraHandler({ compact }) {
  const { camera, size } = useThree();
  const prevIsPortrait = useRef(null);

  useEffect(() => {
    const isPortrait = size.width < size.height;
    if (prevIsPortrait.current === isPortrait) return;
    prevIsPortrait.current = isPortrait;

    if (isPortrait) {
      camera.fov = 46;
      camera.position.set(-6.8, 1.4, 6.2);
    } else {
      camera.fov = compact ? 40 : 35;
      camera.position.set(compact ? -5.4 : -5.6, compact ? 1.4 : 1.8, compact ? 5.0 : 4.2);
    }
    camera.updateProjectionMatrix();
  }, [size.width, size.height, compact, camera]);

  return null;
}

// ─────────── 9. MAIN VIEWER COMPONENT ───────────
export const Microscope3DViewer = ({ 
  className = '', 
  style = {},
  compact = false,
  showEyepieceView = false,
  coarseFocus = 50,
  fineFocus = 50,
  lightPower = true,
  diaphragm = 80,
  objectiveLens = 10,
  stagePosX = 0,
  stagePosY = 0,
  specimenColor = '#ec4899',
  specimenName = 'Spesimen Sel Genetika',
  onLensChange,
  onAdjustCoarse,
  onAdjustFine,
  onAdjustStageX,
  onAdjustStageY,
  onCenterStage,
  onToggleLight,
  onAdjustDiaphragm,
  onInspectEyepiece
}) => {
  const [internalLightOn, setInternalLightOn] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedPartKey, setSelectedPartKey] = useState('head');
  const [hoveredPartText, setHoveredPartText] = useState(null);
  const [actionToast, setActionToast] = useState(null);
  
  // ROTATION LOCK STATE (Default to false so dragging rotates the 3D model freely)
  const [isRotationLocked, setIsRotationLocked] = useState(false);
  // On-screen overlay toggle (Default to FALSE to keep the 3D view clean & minimalist)
  const [showOnScreenDocks, setShowOnScreenDocks] = useState(false);

  const toastTimeoutRef = useRef();
  const controlsRef = useRef();

  const isLightActive = compact ? lightPower : internalLightOn;

  const showToast = (message) => {
    setActionToast(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setActionToast(null);
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Direct Knob Dragging Handler (Makrometer, Mikrometer, Kenop Atas X, Kenop Bawah Y)
  const handleKnobPointerDown = (type, e) => {
    e.stopPropagation();
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
    
    const startX = e.clientX;
    const startY = e.clientY;
    let initialVal = 0;
    if (type === 'coarse') initialVal = coarseFocus;
    else if (type === 'fine') initialVal = fineFocus;
    else if (type === 'stageX') initialVal = stagePosX;
    else if (type === 'stageY') initialVal = stagePosY;
    
    const onPointerMove = (moveEvt) => {
      if (type === 'coarse' || type === 'fine') {
        const deltaY = startY - moveEvt.clientY;
        const factor = type === 'coarse' ? 0.45 : 0.35;
        const updated = Math.max(0, Math.min(100, Math.round(initialVal + deltaY * factor)));
        
        if (type === 'coarse') {
          const step = updated - coarseFocus;
          if (step !== 0) {
            onAdjustCoarse?.(step);
            showToast(`⚙️ Makrometer: Meja ${updated}%`);
          }
        } else {
          const step = updated - fineFocus;
          if (step !== 0) {
            onAdjustFine?.(step);
            showToast(`🎯 Mikrometer: ${updated}%`);
          }
        }
      } else if (type === 'stageX') {
        // Drag horizontally (left-right) to turn Upper Knob
        const deltaX = moveEvt.clientX - startX;
        const factor = 0.35;
        const updated = Math.max(-40, Math.min(40, Math.round(initialVal + deltaX * factor)));
        const step = updated - stagePosX;
        if (step !== 0) {
          onAdjustStageX?.(step);
          showToast(`⚙️ Kenop Atas (X): ${updated < 0 ? '◀ Kiri' : 'Kanan ▶'} ${updated}`);
        }
      } else if (type === 'stageY') {
        // Drag vertically (up-down) to turn Lower Knob
        const deltaY = moveEvt.clientY - startY;
        const factor = 0.35;
        const updated = Math.max(-40, Math.min(40, Math.round(initialVal + deltaY * factor)));
        const step = updated - stagePosY;
        if (step !== 0) {
          onAdjustStageY?.(step);
          showToast(`⚙️ Kenop Bawah (Y): ${updated < 0 ? '▲ Maju' : 'Mundur ▼'} ${updated}`);
        }
      }
    };
    
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (controlsRef.current) {
        controlsRef.current.enabled = !isRotationLocked;
      }
    };
    
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleCycleLensDirect = () => {
    const nextLens = objectiveLens === 4 ? 10 : objectiveLens === 10 ? 40 : 4;
    onLensChange?.(nextLens);
    showToast(`🔄 Revolver Diputar: Lensa ${nextLens}x (Perbesaran ${nextLens * 10}x)`);
  };

  const handleSelectLensDirect = (mag) => {
    onLensChange?.(mag);
    showToast(`🔄 Lensa ${mag}x Dipilih (Perbesaran ${mag * 10}x)`);
  };

  const handleCoarseDirect = (delta) => {
    onAdjustCoarse?.(delta);
    showToast(`⚙️ Makrometer: ${delta > 0 ? '▲ Putar Depan (Naik)' : '▼ Putar Belakang (Turun)'}`);
  };

  const handleFineDirect = (delta) => {
    onAdjustFine?.(delta);
    showToast(`🎯 Mikrometer: ${delta > 0 ? '▲ Putar Depan (+3)' : '▼ Putar Belakang (-3)'}`);
  };

  const handleStageXDirect = (delta) => {
    onAdjustStageX?.(delta);
    showToast(`🔬 Preparat: ${delta > 0 ? '▶ Geser Kanan' : '◀ Geser Kiri'}`);
  };

  const handleStageYDirect = (delta) => {
    onAdjustStageY?.(delta);
    showToast(`🔬 Preparat: ${delta > 0 ? '▼ Geser Mundur' : '▲ Geser Maju'}`);
  };

  const handleCenterStageDirect = () => {
    onCenterStage?.();
    showToast('✛ Preparat Dipusatkan (Tengah)');
  };

  const handleLightDirect = () => {
    if (compact) {
      onToggleLight?.();
    } else {
      setInternalLightOn(prev => !prev);
    }
    showToast(`💡 Saklar Lampu: ${!isLightActive ? 'ON' : 'OFF'}`);
  };

  const handleDiaphragmDirect = (delta = 20) => {
    onAdjustDiaphragm?.(delta);
    showToast(`🔆 Diafragma Diatur`);
  };

  const handleCameraPreset = (type) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    
    if (type === 'side') {
      controls.object.position.set(-6.2, 0.15, 0.2);
      controls.target.set(0, 0.1, 0.15);
      showToast('📷 Tampilan Samping (Sesuai Referensi)');
    } else if (type === 'iso') {
      controls.object.position.set(-4.5, 2.2, 4.2);
      controls.target.set(0, 0.1, 0.15);
    } else if (type === 'front') {
      controls.object.position.set(0, 1.4, 5.6);
      controls.target.set(0, 0.15, 0.2);
      showToast('🎯 Tampilan Depan');
    } else if (type === 'compact_default') {
      const isPortrait = window.innerWidth < window.innerHeight;
      if (isPortrait) {
        controls.object.position.set(-6.8, 1.4, 6.2);
        controls.target.set(0.12, 0.22, 0.05);
      } else {
        controls.object.position.set(-5.4, 1.4, 5.0);
        controls.target.set(0.18, 0.18, 0.05);
      }
      showToast('↺ Sudut Pandang Awal');
    }
    controls.update();
  };

  const selectedPart = MICROSCOPE_PARTS_INFO[selectedPartKey] || MICROSCOPE_PARTS_INFO.head;

  return (
    <div className={`relative w-full h-full flex flex-col ${className}`} style={style}>
      
      {/* 3D WebGL Canvas */}
      <div className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ 
            position: compact ? [-5.4, 1.4, 5.0] : [-5.6, 1.8, 4.2], 
            fov: compact ? 40 : 35 
          }}
          shadows
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <ResponsiveCameraHandler compact={compact} />
          <ambientLight intensity={0.72} />
          
          <directionalLight 
            position={[-5, 7, 5]} 
            intensity={1.6} 
            castShadow 
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />
          
          <directionalLight position={[5, 4, -4]} intensity={0.65} color="#93c5fd" />
          <directionalLight position={[-3, 2, -5]} intensity={0.75} color="#fed7aa" />
          <pointLight position={[0, -0.2, 1.5]} intensity={0.45} color="#ffffff" />

          {/* Model with 3D Arrow Badges for Knobs & Stage */}
          <CompleteMicroscopeModel 
            lightOn={isLightActive} 
            diaphragm={diaphragm}
            coarseFocus={coarseFocus}
            fineFocus={fineFocus}
            objectiveLens={objectiveLens}
            stagePosX={stagePosX}
            stagePosY={stagePosY}
            specimenColor={specimenColor}
            specimenName={specimenName}
            onKnobPointerDown={handleKnobPointerDown}
            onCycleLens={handleCycleLensDirect}
            onSelectLens={handleSelectLensDirect}
            onAdjustCoarse={handleCoarseDirect}
            onAdjustFine={handleFineDirect}
            onAdjustStageX={handleStageXDirect}
            onAdjustStageY={handleStageYDirect}
            onToggleLight={handleLightDirect}
            onAdjustDiaphragm={handleDiaphragmDirect}
            onHoverPart={(txt) => setHoveredPartText(txt)}
            onSelectPart={(key) => setSelectedPartKey(key)} 
            onInspectEyepiece={onInspectEyepiece}
            compact={compact}
          />

          <ContactShadows 
            position={[0, -2.15, 0]} 
            opacity={0.65} 
            scale={9.5} 
            blur={2.4} 
            far={3.5} 
          />

          {/* Orbit Controls with Lock Toggle Support */}
          <OrbitControls
            ref={controlsRef}
            enabled={true}
            enableRotate={!isRotationLocked}
            enablePan={!isRotationLocked}
            enableZoom={true}
            autoRotate={autoRotate && !isRotationLocked}
            autoRotateSpeed={1.5}
            minDistance={2.0}
            maxDistance={12}
            minPolarAngle={0.05}
            maxPolarAngle={Math.PI / 2 + 0.15}
            target={compact ? [0.18, 0.18, 0.05] : [0, 0.28, 0.15]}
          />
        </Canvas>
      </div>

      {/* FLOATING ACTION TOAST */}
      {actionToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-900/95 text-amber-300 font-pixel text-xs px-4 py-1.5 rounded-full border border-amber-400/60 shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>{actionToast}</span>
          </div>
        </div>
      )}

      {/* HOVER TOOLTIP / GUIDANCE */}
      {hoveredPartText && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-25 pointer-events-none transition-all">
          <div className="bg-slate-950/95 text-sky-200 text-xs font-mono px-3.5 py-1.5 rounded-lg border border-sky-400/50 shadow-2xl backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>{hoveredPartText}</span>
          </div>
        </div>
      )}

      {/* COMPACT MODE INTERACTIVE WORKSPACE OVERLAY */}
      {compact ? (
        <>
          {/* Top-Right Control Toolbar: MINIMALIST & UNCLUTTERED */}
          <div className={`absolute top-2.5 z-20 flex items-center gap-1 sm:gap-1.5 transition-all duration-300 ${
            showEyepieceView ? 'hidden sm:flex right-2.5 sm:right-76 xl:right-80' : 'right-2 sm:right-2.5'
          }`}>
            {/* 🔒 THE CAMERA ROTATION LOCK BUTTON (Compact Icon + Text) */}
            <button
              onClick={() => {
                setIsRotationLocked(prev => !prev);
                showToast(!isRotationLocked ? '🔒 Rotasi Terkunci: Sudut mikroskop terkunci' : '🔓 Rotasi Bebas: Drag memutar sudut mikroskop 360°');
              }}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-pixel transition shadow flex items-center gap-1 sm:gap-1.5 border cursor-pointer ${
                isRotationLocked 
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold shadow-emerald-950/40 ring-1 ring-emerald-400/40' 
                  : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
              }`}
              title={isRotationLocked ? "Rotasi Terkunci: Klik untuk buka rotasi 360°" : "Rotasi Bebas: Klik untuk mengunci sudut mikroskop"}
            >
              {isRotationLocked ? (
                <>
                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Terkunci</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Rotasi 360°</span>
                </>
              )}
            </button>

            {/* Reset Camera View */}
            <button
              onClick={() => handleCameraPreset('compact_default')}
              className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-sky-400/60 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-pixel transition shadow flex items-center gap-1 cursor-pointer"
              title="Kembalikan Sudut Kamera Perspektif"
            >
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          {/* DOCK OVERLAYS (ONLY SHOWN IF USER EXPLICITLY CLICKS 'Kenop Layar') */}
          {showOnScreenDocks && (
            <>
              {/* DOCK 1: PANAH PUTAR KNOP FOKUS (DEPAN / BELAKANG) */}
              <div className="absolute top-14 left-3 z-20 flex flex-col gap-2">
                {/* Panel Makrometer */}
                <div className="bg-slate-900/95 border border-amber-500/40 rounded-xl p-2 shadow-2xl backdrop-blur-md flex flex-col gap-1 text-left w-36">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="text-[10px] font-pixel text-amber-400 font-bold uppercase">Makrometer</span>
                    <span className="text-[10px] font-mono text-slate-300">{Math.round(coarseFocus)}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <button
                      onClick={() => handleCoarseDirect(6)}
                      className="bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 hover:text-white py-1 rounded text-[10px] font-bold transition flex items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                      title="Putar kenop ke depan (Menaikkan meja objek)"
                    >
                      <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                      <span>Depan ▲</span>
                    </button>
                    <button
                      onClick={() => handleCoarseDirect(-6)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white py-1 rounded text-[10px] font-bold transition flex items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                      title="Putar kenop ke belakang (Menurunkan meja objek)"
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      <span>Blkg ▼</span>
                    </button>
                  </div>
                </div>

                {/* Panel Mikrometer */}
                <div className="bg-slate-900/95 border border-sky-500/40 rounded-xl p-2 shadow-2xl backdrop-blur-md flex flex-col gap-1 text-left w-36">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="text-[10px] font-pixel text-sky-400 font-bold uppercase">Mikrometer</span>
                    <span className="text-[10px] font-mono text-slate-300">{Math.round(fineFocus)}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <button
                      onClick={() => handleFineDirect(4)}
                      className="bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sky-200 hover:text-white py-1 rounded text-[10px] font-bold transition flex items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                      title="Fokus mikro ke depan"
                    >
                      <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                      <span>Depan ▲</span>
                    </button>
                    <button
                      onClick={() => handleFineDirect(-4)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white py-1 rounded text-[10px] font-bold transition flex items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                      title="Fokus mikro ke belakang"
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      <span>Blkg ▼</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* DOCK 2: KONTROL KENOP MEJA OBJEK & PREPARAT */}
              <div className="absolute top-14 right-3 z-20 flex flex-col gap-1.5">
                <div className="bg-slate-900/95 border border-emerald-500/40 rounded-xl p-2.5 shadow-2xl backdrop-blur-md flex flex-col gap-2 text-left w-44">
                  <div className="w-full flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="text-[10px] font-pixel text-emerald-400 font-bold uppercase flex items-center gap-1">
                      <Move className="w-3 h-3 text-emerald-400" />
                      <span>Kenop Meja (X-Y)</span>
                    </span>
                    <button
                      onClick={handleCenterStageDirect}
                      className="bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-400/60 text-emerald-300 px-1.5 py-0.5 rounded text-[8px] font-pixel transition cursor-pointer flex items-center gap-0.5 active:scale-95"
                      title="Pusatkan posisi kaca preparat ke tengah"
                    >
                      <Crosshair className="w-2.5 h-2.5 text-emerald-400" />
                      <span>Pusat</span>
                    </button>
                  </div>

                  {/* 1. KENOP ATAS: KIRI - KANAN (SUMBU X) */}
                  <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-[9px] font-bold text-sky-300">1. Kenop Atas (X)</span>
                      <span className="text-[9px] font-mono text-emerald-300 font-bold">{stagePosX > 0 ? `+${stagePosX}` : stagePosX}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => handleStageXDirect(-5)}
                        className="bg-slate-800 hover:bg-emerald-950/60 hover:border-emerald-400 border border-slate-700 text-slate-200 py-1 rounded flex items-center justify-center gap-0.5 cursor-pointer transition active:scale-95 text-[10px] font-bold"
                        title="Putar Kenop Atas ke Kiri (◀ Geser Kiri)"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 text-emerald-400" />
                        <span>◀ Kiri</span>
                      </button>
                      <button
                        onClick={() => handleStageXDirect(5)}
                        className="bg-slate-800 hover:bg-emerald-950/60 hover:border-emerald-400 border border-slate-700 text-slate-200 py-1 rounded flex items-center justify-center gap-0.5 cursor-pointer transition active:scale-95 text-[10px] font-bold"
                        title="Putar Kenop Atas ke Kanan (Kanan ▶)"
                      >
                        <span>Kanan ▶</span>
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    </div>
                  </div>

                  {/* 2. KENOP BAWAH: MAJU - MUNDUR (SUMBU Y) */}
                  <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-[9px] font-bold text-amber-300">2. Kenop Bawah (Y)</span>
                      <span className="text-[9px] font-mono text-emerald-300 font-bold">{stagePosY > 0 ? `+${stagePosY}` : stagePosY}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => handleStageYDirect(-5)}
                        className="bg-slate-800 hover:bg-emerald-950/60 hover:border-emerald-400 border border-slate-700 text-slate-200 py-1 rounded flex items-center justify-center gap-0.5 cursor-pointer transition active:scale-95 text-[10px] font-bold"
                        title="Putar Kenop Bawah Maju (▲ Maju)"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span>▲ Maju</span>
                      </button>
                      <button
                        onClick={() => handleStageYDirect(5)}
                        className="bg-slate-800 hover:bg-emerald-950/60 hover:border-emerald-400 border border-slate-700 text-slate-200 py-1 rounded flex items-center justify-center gap-0.5 cursor-pointer transition active:scale-95 text-[10px] font-bold"
                        title="Putar Kenop Bawah Mundur (Mundur ▼)"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mundur ▼</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Direct Interactive Lab Controls (Revolver & Light) */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
                <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
                  <button
                    onClick={handleCycleLensDirect}
                    className="bg-slate-900/95 hover:bg-slate-800 text-amber-300 border border-slate-700 hover:border-amber-400 px-3 py-1.5 rounded-lg text-xs font-pixel transition shadow-lg flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                    title="Klik untuk memutar lensa objektif (4x → 10x → 40x)"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Putar Lensa ({objectiveLens}x)</span>
                  </button>

                  <button
                    onClick={handleLightDirect}
                    className={`px-3 py-1.5 rounded-lg text-xs font-pixel transition shadow-lg flex items-center gap-1.5 border cursor-pointer backdrop-blur-md ${
                      isLightActive 
                        ? 'bg-yellow-500/25 border-yellow-400 text-yellow-300' 
                        : 'bg-slate-900/95 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Nyalakan / Matikan Lampu"
                  >
                    <Lightbulb className={`w-3.5 h-3.5 ${isLightActive ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                    <span>{isLightActive ? 'Lampu ON' : 'Lampu OFF'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Minimalist Bottom Hint when docks are hidden */}
          {!showOnScreenDocks && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-auto max-w-[95%]">
              <div className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800/80 shadow-lg backdrop-blur-md flex items-center gap-2 whitespace-nowrap">
                <span>🖱️ Drag mikroskop untuk rotasi 360°</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400/90">Gunakan kontrol di bawah untuk mengatur mikroskop</span>
              </div>
            </div>
          )}
        </>
      ) : (
        /* FULL SHOWCASE MODE OVERLAY */
        <>
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-20">
            <button
              onClick={() => handleCameraPreset('side')}
              className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-amber-400/60 px-2.5 py-1.5 rounded-lg text-[10px] font-pixel transition shadow-lg flex items-center gap-1.5 cursor-pointer"
              title="Tampilan Profil Samping (Sesuai Foto Referensi)"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Profil Samping (Ref)</span>
            </button>

            <button
              onClick={() => handleCameraPreset('iso')}
              className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-sky-400/60 px-2.5 py-1.5 rounded-lg text-[10px] font-pixel transition shadow-lg flex items-center gap-1.5 cursor-pointer"
              title="Tampilan Isometrik 3D"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Perspektif 3D</span>
            </button>

            <button
              onClick={() => handleCameraPreset('front')}
              className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-400/60 px-2.5 py-1.5 rounded-lg text-[10px] font-pixel transition shadow-lg flex items-center gap-1.5 cursor-pointer"
              title="Tampak Depan"
            >
              <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tampak Depan</span>
            </button>

            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-pixel transition shadow-lg flex items-center gap-1.5 border cursor-pointer ${
                autoRotate 
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300' 
                  : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Putar Otomatis 360°"
            >
              <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin text-amber-400' : ''}`} />
              <span>{autoRotate ? 'Berhenti' : 'Putar 360°'}</span>
            </button>

            <button
              onClick={handleLightDirect}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-pixel transition shadow-lg flex items-center gap-1.5 border cursor-pointer ${
                isLightActive 
                  ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300' 
                  : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Nyalakan / Matikan Lampu Iluminator"
            >
              <Lightbulb className={`w-3.5 h-3.5 ${isLightActive ? 'text-yellow-400 fill-yellow-400' : ''}`} />
              <span>Lampu: {isLightActive ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/92 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-left z-20 transition-all">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: selectedPart.color }}
                />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {selectedPart.title}
                </h4>
              </div>
              <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                Klik Bagian Mikroskop
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {selectedPart.desc}
            </p>

            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
              {[
                { k: 'head', l: 'Okuler' },
                { k: 'nosepiece', l: 'Objektif' },
                { k: 'stage', l: 'Meja Objek' },
                { k: 'coarse', l: 'Makrometer' },
                { k: 'fine', l: 'Mikrometer' },
                { k: 'condenser', l: 'Kondensor' },
                { k: 'light', l: 'Lampu LED' },
                { k: 'arm', l: 'Lengan' },
                { k: 'base', l: 'Dasar' }
              ].map((item) => (
                <button
                  key={item.k}
                  onClick={() => setSelectedPartKey(item.k)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                    selectedPartKey === item.k
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.l}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default Microscope3DViewer;
