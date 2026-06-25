'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import { getMissionIcon } from '@/lib/missions';

function MissionMarker({
  position,
  label,
  color,
  isActive,
}: {
  position: [number, number, number];
  label: string;
  color: string;
  isActive: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (ref.current) {
      ref.current.position.y = 1.5 + Math.sin(timeRef.current * 2) * 0.3;
      ref.current.rotation.y += delta * 2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2;
      const scale = 1 + Math.sin(timeRef.current * 3) * 0.2;
      ringRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      {/* Ground ring */}
      <mesh ref={ringRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.8, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Floating star/diamond */}
      <mesh ref={ref} position={[0, 1.5, 0]} castShadow>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      {/* Beam of light */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.05, 0.3, 8, 8, 1, true]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function MissionMarkers() {
  const missions = useGameStore((s) => s.missions);
  const activeMission = useGameStore((s) => s.activeMission);

  const displayMissions = activeMission ? [activeMission] : missions.slice(0, 3);

  return (
    <>
      {displayMissions.map((mission) => (
        <MissionMarker
          key={mission.id}
          position={[mission.location.x, 0, mission.location.z]}
          label={`${getMissionIcon(mission.type)} ${mission.title}`}
          color={activeMission?.id === mission.id ? '#f59e0b' : '#a855f7'}
          isActive={activeMission?.id === mission.id}
        />
      ))}
    </>
  );
}
