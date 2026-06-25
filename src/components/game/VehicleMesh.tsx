"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getWorld } from "@/game/world";
import type { VehicleKind } from "@/lib/constants";
import { retroMaterial } from "@/game/retroMaterials";

interface Props {
  id: number;
  kind: VehicleKind;
  color: string;
  drivable: boolean;
}

// A single vehicle. Geometry varies by kind for visual variety; transform is
// synced from the world simulation each frame.
export function VehicleMesh({ id, kind, color, drivable }: Props) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    const world = getWorld();
    const v = world.vehicles.find((x) => x.id === id);
    if (!v || !ref.current) return;
    ref.current.position.set(v.x, 0, v.z);
    ref.current.rotation.y = v.heading;
  });

  return (
    <group ref={ref}>
      <Body kind={kind} color={color} />
      {drivable && (
        // Floating marker over enterable vehicles.
        <mesh position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.6, 16]} />
          <meshBasicMaterial color="#ffd23f" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function Wheels({ w, l }: { w: number; l: number }) {
  const positions: [number, number, number][] = [
    [-w, 0.35, l],
    [w, 0.35, l],
    [-w, 0.35, -l],
    [w, 0.35, -l],
  ];
  return (
    <>
      {positions.map((p, i) => (
        <mesh key={i} position={p} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.37, 0.37, 0.34, 12]} />
          <meshStandardMaterial color="#0a0a0a" />
          <mesh position={[0, 0, 0.18]}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 8]} />
            <meshStandardMaterial color="#9aa0a6" metalness={0.55} roughness={0.35} />
          </mesh>
        </mesh>
      ))}
    </>
  );
}

function Lights({ w = 0.65, front = 2.15, back = -2.15, strong = false }: { w?: number; front?: number; back?: number; strong?: boolean }) {
  return (
    <>
      {[-w, w].map((x) => (
        <mesh key={`h-${x}`} position={[x, 0.62, front]}>
          <boxGeometry args={[0.34, 0.16, 0.08]} />
          <meshStandardMaterial color="#fff1ba" emissive="#fff1ba" emissiveIntensity={strong ? 1.8 : 1.1} />
        </mesh>
      ))}
      {[-w, w].map((x) => (
        <mesh key={`t-${x}`} position={[x, 0.62, back]}>
          <boxGeometry args={[0.28, 0.15, 0.08]} />
          <meshStandardMaterial color="#ff2d3a" emissive="#ff2d3a" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {strong && <pointLight position={[0, 0.8, front + 1.6]} color="#fff1ba" intensity={0.9} distance={16} />}
    </>
  );
}

function PaintStripe({ color = "#ffffff", z = 0, width = 0.09 }: { color?: string; z?: number; width?: number }) {
  return (
    <mesh position={[0, 0.98, z]}>
      <boxGeometry args={[1.82, width, 0.05]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.12} />
    </mesh>
  );
}

function Body({ kind, color }: { kind: VehicleKind; color: string }) {
  switch (kind) {
    case "motorcycle":
      return (
        <group>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[0.46, 0.42, 1.8]} />
            <primitive object={retroMaterial("metal", { tint: color, repeat: [1, 2], metalness: 0.45, roughness: 0.45 })} attach="material" />
          </mesh>
          <mesh position={[0, 1.05, -0.15]} castShadow>
            <boxGeometry args={[0.55, 0.22, 0.65]} />
            <meshStandardMaterial color="#111" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.4, 0.8]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.25, 12]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
          <mesh position={[0, 0.4, -0.8]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.25, 12]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
          <Lights w={0.18} front={1.0} back={-1.05} />
        </group>
      );
    case "van":
      return (
        <group>
          <mesh position={[0, 1.0, 0]} castShadow>
            <boxGeometry args={[2.2, 1.6, 4.6]} />
            <primitive object={retroMaterial("metal", { tint: color, repeat: [2, 4], metalness: 0.25, roughness: 0.62 })} attach="material" />
          </mesh>
          <mesh position={[0, 1.4, 1.6]}>
            <boxGeometry args={[2.0, 0.8, 1.2]} />
            <meshStandardMaterial color="#bfe9ff" />
          </mesh>
          <mesh position={[0, 1.85, -0.4]}>
            <boxGeometry args={[2.05, 0.12, 3.6]} />
            <meshStandardMaterial color="#1a1020" />
          </mesh>
          <Lights w={0.75} front={2.35} back={-2.35} />
          <Wheels w={1.0} l={1.6} />
        </group>
      );
    case "truck":
      return (
        <group>
          <mesh position={[0, 1.0, -1.4]} castShadow>
            <boxGeometry args={[2.4, 1.4, 2.4]} />
            <primitive object={retroMaterial("rust", { tint: color, repeat: [2, 2] })} attach="material" />
          </mesh>
          <mesh position={[0, 1.6, 1.3]} castShadow>
            <boxGeometry args={[2.4, 2.4, 3.4]} />
            <primitive object={retroMaterial("metal", { tint: "#1a1f33", repeat: [2, 3], metalness: 0.25 })} attach="material" />
          </mesh>
          <mesh position={[0, 2.05, 2.45]}>
            <boxGeometry args={[1.7, 0.55, 0.1]} />
            <meshStandardMaterial color="#bfe9ff" />
          </mesh>
          <Lights w={0.82} front={3.05} back={-2.55} />
          <Wheels w={1.1} l={1.9} />
        </group>
      );
    case "electric":
      return (
        <group>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[1.9, 0.9, 4.0]} />
            <primitive object={retroMaterial("metal", { tint: color, repeat: [2, 3], metalness: 0.5, roughness: 0.28 })} attach="material" />
          </mesh>
          <mesh position={[0, 1.25, -0.1]}>
            <boxGeometry args={[1.7, 0.7, 2.2]} />
            <meshStandardMaterial color="#0a0612" metalness={0.6} roughness={0.1} />
          </mesh>
          <mesh position={[0, 1.7, -0.1]}>
            <boxGeometry args={[1.1, 0.08, 1.4]} />
            <meshStandardMaterial color="#22e3ff" emissive="#22e3ff" emissiveIntensity={0.35} />
          </mesh>
          <Lights w={0.68} front={2.05} back={-2.05} strong />
          <Wheels w={0.95} l={1.45} />
        </group>
      );
    case "sports":
    default:
      return (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[1.95, 0.55, 4.35]} />
            <primitive object={retroMaterial("metal", { tint: color, repeat: [2, 4], metalness: 0.58, roughness: 0.24 })} attach="material" />
          </mesh>
          <mesh position={[0, 0.95, -0.18]} castShadow>
            <boxGeometry args={[1.55, 0.55, 1.9]} />
            <meshStandardMaterial color="#120018" metalness={0.7} roughness={0.1} />
          </mesh>
          <mesh position={[0, 1.28, -0.22]}>
            <boxGeometry args={[1.22, 0.08, 1.05]} />
            <meshStandardMaterial color="#22e3ff" emissive="#22e3ff" emissiveIntensity={0.18} />
          </mesh>
          <mesh position={[0, 0.5, 2.22]}>
            <boxGeometry args={[1.7, 0.18, 0.12]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <PaintStripe color="#ffd23f" z={2.23} />
          <Lights w={0.6} front={2.23} back={-2.24} strong />
          <Wheels w={0.95} l={1.5} />
        </group>
      );
  }
}
