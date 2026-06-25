"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGame } from "@/lib/store";

// Renders a pulsing neon beacon at the current mission objective.
export function MissionMarkers() {
  const active = useGame((s) => s.active);
  const beam = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (beam.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.15;
      beam.current.scale.set(s, 1, s);
    }
  });

  if (!active) return null;
  const target = active.phase === "to_origin" ? active.mission.origin : active.mission.target;
  const color = active.phase === "to_origin" ? "#ffd23f" : "#22e3ff";

  return (
    <group position={[target.x, 0, target.z]}>
      <mesh ref={beam} position={[0, 8, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 16, 16, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2, 3, 28]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
