'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';

function Building({
  position,
  width,
  depth,
  height,
  color,
  hasWindows = true,
}: {
  position: [number, number, number];
  width: number;
  depth: number;
  height: number;
  color: string;
  hasWindows?: boolean;
}) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {hasWindows && (
        <mesh position={[0, height / 2, depth / 2 + 0.01]}>
          <boxGeometry args={[width * 0.8, height * 0.8, 0.05]} />
          <meshLambertMaterial color="#88ccff" transparent opacity={0.3} />
        </mesh>
      )}
      {/* Rooftop detail */}
      <mesh castShadow position={[0, height + 0.2, 0]}>
        <boxGeometry args={[width + 0.2, 0.4, depth + 0.2]} />
        <meshLambertMaterial color={new THREE.Color(color).offsetHSL(0, 0, -0.1).getHexString()} />
      </mesh>
    </group>
  );
}

function PalmTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh castShadow position={[0, 2, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 4, 8]} />
        <meshLambertMaterial color="#8B6914" />
      </mesh>
      {/* Leaves */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.sin((angle * Math.PI) / 180) * 1.2,
            4.2,
            Math.cos((angle * Math.PI) / 180) * 1.2,
          ]}
          rotation={[
            -0.3,
            (angle * Math.PI) / 180,
            0.4,
          ]}
        >
          <coneGeometry args={[0.6, 1.5, 4]} />
          <meshLambertMaterial color="#22c55e" />
        </mesh>
      ))}
    </group>
  );
}

function Road({
  start,
  end,
  width = 8,
}: {
  start: [number, number];
  end: [number, number];
  width?: number;
}) {
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const cx = (start[0] + end[0]) / 2;
  const cz = (start[1] + end[1]) / 2;
  const angle = Math.atan2(dx, dz);

  return (
    <group>
      <mesh
        receiveShadow
        position={[cx, 0.01, cz]}
        rotation={[-Math.PI / 2, 0, -angle]}
      >
        <planeGeometry args={[width, length]} />
        <meshLambertMaterial color="#374151" />
      </mesh>
      {/* Lane markings */}
      <mesh
        position={[cx, 0.02, cz]}
        rotation={[-Math.PI / 2, 0, -angle]}
      >
        <planeGeometry args={[0.3, length * 0.9]} />
        <meshLambertMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
}

function NeonSign({
  position,
  text,
  color,
}: {
  position: [number, number, number];
  text: string;
  color: string;
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[3, 1, 0.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function Beach({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 20]} />
        <meshLambertMaterial color="#f5d485" />
      </mesh>
      <mesh receiveShadow position={[0, -0.05, -12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 10]} />
        <meshLambertMaterial color="#38bdf8" transparent opacity={0.7} />
      </mesh>
      {/* Wave effect */}
      <mesh position={[0, 0.05, -7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 1]} />
        <meshLambertMaterial color="#bae6fd" transparent opacity={0.6} />
      </mesh>
      <PalmTree position={[-20, 0, 5]} />
      <PalmTree position={[-10, 0, 3]} />
      <PalmTree position={[10, 0, 6]} />
      <PalmTree position={[20, 0, 4]} />
      <PalmTree position={[0, 0, 2]} />
    </group>
  );
}

function GasStation({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Building position={[0, 0, 0]} width={8} depth={6} height={4} color="#e2e8f0" />
      {/* Canopy */}
      <mesh position={[8, 4, 0]} castShadow>
        <boxGeometry args={[10, 0.5, 8]} />
        <meshLambertMaterial color="#ef4444" />
      </mesh>
      {/* Pumps */}
      {[-2, 2].map((x, i) => (
        <mesh key={i} position={[8 + x, 1, 0]} castShadow>
          <boxGeometry args={[1, 2, 0.5]} />
          <meshLambertMaterial color="#1e293b" />
        </mesh>
      ))}
      <NeonSign position={[0, 5, 3.1]} text="GAS" color="#22c55e" />
    </group>
  );
}

function Bank({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Building position={[0, 0, 0]} width={12} depth={10} height={8} color="#1e3a5f" />
      {/* Columns */}
      {[-4, -1.5, 1.5, 4].map((x, i) => (
        <mesh key={i} position={[x, 4, 5.1]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 8, 8]} />
          <meshLambertMaterial color="#e2e8f0" />
        </mesh>
      ))}
      <NeonSign position={[0, 9.5, 5.1]} text="SOLANA BANK" color="#9333ea" />
    </group>
  );
}

function Casino({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Building position={[0, 0, 0]} width={15} depth={12} height={12} color="#1a0533" />
      <mesh position={[0, 13, 0]} castShadow>
        <coneGeometry args={[9, 4, 6]} />
        <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.5} />
      </mesh>
      <NeonSign position={[0, 14, 7]} text="CASINO" color="#f59e0b" />
      <NeonSign position={[0, 11, 7]} text="WIN SOL" color="#ec4899" />
    </group>
  );
}

function Harbor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pier */}
      <mesh receiveShadow position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 40]} />
        <meshLambertMaterial color="#7c5e3c" />
      </mesh>
      {/* Warehouse */}
      <Building position={[0, 0, -15]} width={18} depth={12} height={6} color="#6b7280" />
      {/* Boat */}
      <mesh position={[8, 0.5, 10]} castShadow>
        <boxGeometry args={[6, 1.5, 12]} />
        <meshLambertMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[8, 2, 6]} castShadow>
        <boxGeometry args={[4, 3, 6]} />
        <meshLambertMaterial color="#e2e8f0" />
      </mesh>
    </group>
  );
}

function Park({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshLambertMaterial color="#16a34a" />
      </mesh>
      <PalmTree position={[-8, 0, -8]} />
      <PalmTree position={[8, 0, -8]} />
      <PalmTree position={[-8, 0, 8]} />
      <PalmTree position={[8, 0, 8]} />
      <PalmTree position={[0, 0, 0]} />
      {/* Pond */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 16]} />
        <meshLambertMaterial color="#38bdf8" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function PoliceStation({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Building position={[0, 0, 0]} width={14} depth={10} height={7} color="#1e3a5f" />
      <mesh position={[-5, 7, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 8, 8]} />
        <meshLambertMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[5, 7, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 8, 8]} />
        <meshLambertMaterial color="#94a3b8" />
      </mesh>
      <NeonSign position={[0, 8, 5.1]} text="POLICE" color="#3b82f6" />
    </group>
  );
}

function Apartments({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[0, 10, -10].map((x, i) => (
        <Building
          key={i}
          position={[x, 0, 0]}
          width={8}
          depth={8}
          height={12 + i * 4}
          color={['#1e3a5f', '#334155', '#1e293b'][i]}
        />
      ))}
    </group>
  );
}

export default function City() {
  const timeOfDay = useGameStore((s) => s.timeOfDay);

  const skyColor = useMemo(() => {
    const t = timeOfDay;
    if (t < 0.25) return new THREE.Color(0.02, 0.05, 0.15);
    if (t < 0.35) return new THREE.Color(0.8, 0.4, 0.2);
    if (t < 0.75) return new THREE.Color(0.4, 0.7, 1.0);
    if (t < 0.85) return new THREE.Color(0.9, 0.5, 0.2);
    return new THREE.Color(0.02, 0.05, 0.15);
  }, [timeOfDay]);

  const ambientIntensity = useMemo(() => {
    const t = timeOfDay;
    if (t < 0.25) return 0.15;
    if (t < 0.35) return 0.4;
    if (t < 0.75) return 0.8;
    if (t < 0.85) return 0.4;
    return 0.15;
  }, [timeOfDay]);

  return (
    <>
      {/* Lighting */}
      <color attach="background" args={[skyColor]} />
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        castShadow
        position={[50, 80, 30]}
        intensity={timeOfDay > 0.3 && timeOfDay < 0.8 ? 1.2 : 0.2}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={300}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
        color={timeOfDay > 0.6 ? '#ff9966' : '#fffef0'}
      />
      {/* Night street lights */}
      {timeOfDay < 0.3 || timeOfDay > 0.75 ? (
        <>
          <pointLight position={[0, 8, 0]} intensity={2} distance={30} color="#ffd700" />
          <pointLight position={[40, 8, 40]} intensity={2} distance={30} color="#ffd700" />
          <pointLight position={[-40, 8, -40]} intensity={2} distance={30} color="#ffd700" />
          <pointLight position={[40, 8, -40]} intensity={2} distance={30} color="#ff6b6b" />
          <pointLight position={[-40, 8, 40]} intensity={2} distance={30} color="#6bc5ff" />
        </>
      ) : null}

      {/* Ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshLambertMaterial color="#1a2e1a" />
      </mesh>

      {/* Main roads */}
      <Road start={[-150, 0]} end={[150, 0]} />
      <Road start={[0, -150]} end={[0, 150]} />
      <Road start={[-150, 40]} end={[150, 40]} />
      <Road start={[-150, -40]} end={[150, -40]} />
      <Road start={[40, -150]} end={[40, 150]} />
      <Road start={[-40, -150]} end={[-40, 150]} />
      <Road start={[80, -100]} end={[80, 100]} />
      <Road start={[-80, -100]} end={[-80, 100]} />

      {/* City blocks - Downtown */}
      <Building position={[15, 0, 20]} width={10} depth={10} height={20} color="#1e3a5f" />
      <Building position={[-15, 0, 20]} width={8} depth={8} height={15} color="#334155" />
      <Building position={[15, 0, -20]} width={12} depth={10} height={25} color="#1e293b" />
      <Building position={[-15, 0, -20]} width={10} depth={10} height={18} color="#0f172a" />
      <Building position={[55, 0, 20]} width={8} depth={8} height={14} color="#1e3a5f" />
      <Building position={[-55, 0, -20]} width={10} depth={10} height={22} color="#312e81" />
      <Building position={[55, 0, -20]} width={10} depth={8} height={16} color="#1e1b4b" />
      <Building position={[-55, 0, 20]} width={8} depth={10} height={19} color="#14213d" />

      {/* Midrise buildings */}
      <Building position={[95, 0, 60]} width={8} depth={8} height={10} color="#374151" />
      <Building position={[-95, 0, -60]} width={8} depth={8} height={8} color="#4b5563" />
      <Building position={[95, 0, -60]} width={10} depth={8} height={12} color="#1f2937" />
      <Building position={[-95, 0, 60]} width={8} depth={10} height={9} color="#374151" />
      <Building position={[20, 0, 60]} width={6} depth={6} height={7} color="#475569" />
      <Building position={[-20, 0, -60]} width={6} depth={6} height={6} color="#334155" />
      <Building position={[60, 0, 60]} width={8} depth={6} height={11} color="#1e293b" />
      <Building position={[-60, 0, 60]} width={6} depth={8} height={8} color="#334155" />
      <Building position={[60, 0, -60]} width={7} depth={7} height={9} color="#1e3a5f" />
      <Building position={[-60, 0, -60]} width={8} depth={8} height={13} color="#312e81" />

      {/* Key landmarks */}
      <Bank position={[0, 0, 55]} />
      <Casino position={[-20, 0, 90]} />
      <GasStation position={[70, 0, 0]} />
      <PoliceStation position={[-70, 0, -10]} />
      <Apartments position={[0, 0, -70]} />
      <Harbor position={[0, 0, 120]} />
      <Beach position={[0, 0, 140]} />
      <Park position={[-90, 0, 0]} />

      {/* Palm trees along roads */}
      {[-100, -60, -20, 20, 60, 100].map((x, i) => (
        <PalmTree key={`pt_${i}`} position={[x, 0, 50]} />
      ))}
      {[-100, -60, -20, 20, 60, 100].map((x, i) => (
        <PalmTree key={`pt2_${i}`} position={[x, 0, -50]} />
      ))}

      {/* Neon district */}
      <NeonSign position={[-30, 6, 22]} text="NEON" color="#f43f5e" />
      <NeonSign position={[30, 8, 22]} text="SOL" color="#a855f7" />
      <NeonSign position={[-30, 5, -22]} text="DEFI" color="#06b6d4" />
    </>
  );
}
