'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import { NPC } from '@/types';

const CIVILIAN_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
const SKIN_TONES = ['#F4C88E', '#c68642', '#8d5524', '#FDBCB4', '#d4a17d'];

function NPCMesh({ npc, color, skinColor }: { npc: NPC; color: string; skinColor: string }) {
  const ref = useRef<THREE.Group>(null);
  const timeRef = useRef(Math.random() * 100);
  const walkOffsetRef = useRef({ x: npc.position[0], z: npc.position[2] });
  const walkDirRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!ref.current) return;
    timeRef.current += delta;

    if (npc.behavior === 'walking') {
      walkDirRef.current += (Math.random() - 0.5) * 0.02;
      walkOffsetRef.current.x += Math.sin(walkDirRef.current) * 1.5 * delta;
      walkOffsetRef.current.z += Math.cos(walkDirRef.current) * 1.5 * delta;

      walkOffsetRef.current.x = Math.max(npc.position[0] - 15, Math.min(npc.position[0] + 15, walkOffsetRef.current.x));
      walkOffsetRef.current.z = Math.max(npc.position[2] - 15, Math.min(npc.position[2] + 15, walkOffsetRef.current.z));

      const bob = Math.sin(timeRef.current * 8) * 0.04;
      ref.current.position.set(walkOffsetRef.current.x, 0.5 + bob, walkOffsetRef.current.z);
      ref.current.rotation.y = walkDirRef.current;
    } else {
      ref.current.position.set(npc.position[0], 0.5, npc.position[2]);
      ref.current.rotation.y = timeRef.current * 0.3;
    }
  });

  const isPolice = npc.type === 'police';
  const isGang = npc.type === 'gang';
  const isMissionGiver = npc.type === 'mission_giver';

  return (
    <group ref={ref} position={[npc.position[0], 0.5, npc.position[2]]}>
      {/* Body */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[0.45, 0.65, 0.28]} />
        <meshLambertMaterial
          color={isPolice ? '#1d4ed8' : isGang ? '#7f1d1d' : isMissionGiver ? '#7c3aed' : color}
        />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.15, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshLambertMaterial color={skinColor} />
      </mesh>
      {/* Hair */}
      <mesh castShadow position={[0, 1.38, 0]}>
        <boxGeometry args={[0.35, 0.1, 0.35]} />
        <meshLambertMaterial color="#1c1917" />
      </mesh>
      {/* Legs */}
      <mesh castShadow position={[-0.12, 0.13, 0]}>
        <boxGeometry args={[0.18, 0.45, 0.22]} />
        <meshLambertMaterial color={isPolice ? '#1e3a5f' : '#1e293b'} />
      </mesh>
      <mesh castShadow position={[0.12, 0.13, 0]}>
        <boxGeometry args={[0.18, 0.45, 0.22]} />
        <meshLambertMaterial color={isPolice ? '#1e3a5f' : '#1e293b'} />
      </mesh>
      {/* Mission giver marker */}
      {isMissionGiver && (
        <mesh position={[0, 2, 0]}>
          <coneGeometry args={[0.3, 0.6, 4]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2} />
        </mesh>
      )}
      {/* Police badge */}
      {isPolice && (
        <mesh position={[0, 0.75, 0.15]}>
          <circleGeometry args={[0.08, 6]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
        </mesh>
      )}
    </group>
  );
}

export default function NPCs() {
  const npcs = useGameStore((s) => s.npcs);

  return (
    <>
      {npcs.map((npc, i) => (
        <NPCMesh
          key={npc.id}
          npc={npc}
          color={CIVILIAN_COLORS[i % CIVILIAN_COLORS.length]}
          skinColor={SKIN_TONES[i % SKIN_TONES.length]}
        />
      ))}
    </>
  );
}
