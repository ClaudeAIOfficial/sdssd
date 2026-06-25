"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getWorld } from "@/game/world";
import type { VehicleKind } from "@/lib/constants";

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
          <cylinderGeometry args={[0.35, 0.35, 0.3, 10]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      ))}
    </>
  );
}

function Body({ kind, color }: { kind: VehicleKind; color: string }) {
  switch (kind) {
    case "motorcycle":
      return (
        <group>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[0.5, 0.5, 1.8]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.4, 0.8]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.25, 12]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
          <mesh position={[0, 0.4, -0.8]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.25, 12]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
        </group>
      );
    case "van":
      return (
        <group>
          <mesh position={[0, 1.0, 0]} castShadow>
            <boxGeometry args={[2.2, 1.6, 4.6]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.4, 1.6]}>
            <boxGeometry args={[2.0, 0.8, 1.2]} />
            <meshStandardMaterial color="#bfe9ff" />
          </mesh>
          <Wheels w={1.0} l={1.6} />
        </group>
      );
    case "truck":
      return (
        <group>
          <mesh position={[0, 1.0, -1.4]} castShadow>
            <boxGeometry args={[2.4, 1.4, 2.4]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 1.6, 1.3]} castShadow>
            <boxGeometry args={[2.4, 2.4, 3.4]} />
            <meshStandardMaterial color="#1a1f33" />
          </mesh>
          <Wheels w={1.1} l={1.9} />
        </group>
      );
    case "electric":
      return (
        <group>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[1.9, 0.9, 4.0]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.25} />
          </mesh>
          <mesh position={[0, 1.25, -0.1]}>
            <boxGeometry args={[1.7, 0.7, 2.2]} />
            <meshStandardMaterial color="#0a0612" metalness={0.6} roughness={0.1} />
          </mesh>
          <Wheels w={0.95} l={1.45} />
        </group>
      );
    case "sports":
    default:
      return (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[1.9, 0.55, 4.2]} />
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.95, -0.2]} castShadow>
            <boxGeometry args={[1.6, 0.55, 2.0]} />
            <meshStandardMaterial color="#120018" metalness={0.7} roughness={0.1} />
          </mesh>
          {/* Headlights */}
          <mesh position={[-0.6, 0.55, 2.1]}>
            <boxGeometry args={[0.3, 0.18, 0.1]} />
            <meshStandardMaterial color="#fff7cc" emissive="#fff7cc" emissiveIntensity={1.4} />
          </mesh>
          <mesh position={[0.6, 0.55, 2.1]}>
            <boxGeometry args={[0.3, 0.18, 0.1]} />
            <meshStandardMaterial color="#fff7cc" emissive="#fff7cc" emissiveIntensity={1.4} />
          </mesh>
          <Wheels w={0.95} l={1.5} />
        </group>
      );
  }
}
