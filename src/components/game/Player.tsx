'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { KeyState } from '@/hooks/useKeyboard';

const WALK_SPEED = 5;
const RUN_SPEED = 10;
const TURN_SPEED = 2.8;

interface PlayerProps {
  keys: React.RefObject<KeyState>;
  onPhoneToggle: () => void;
}

export default function Player({ keys, onPhoneToggle }: PlayerProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const player = useGameStore((s) => s.player);
  const {
    setPlayerPosition,
    setPlayerRotation,
    setPlayerRunning,
    activeMission,
    addMissionDistance,
    isPhoneOpen,
    togglePhone,
  } = useGameStore();

  const posRef = useRef(new THREE.Vector3(0, 0.5, 0));
  const rotRef = useRef(0);
  const prevPosRef = useRef(new THREE.Vector3(0, 0.5, 0));
  const phonePressed = useRef(false);
  const bobRef = useRef(0);

  useFrame((_, delta) => {
    if (!keys.current || !meshRef.current) return;

    const { forward, backward, left, right, run, phone } = keys.current;

    // Phone toggle on P press
    if (phone && !phonePressed.current) {
      phonePressed.current = true;
      togglePhone();
      onPhoneToggle();
    }
    if (!phone) phonePressed.current = false;

    if (isPhoneOpen) return;

    const speed = run ? RUN_SPEED : WALK_SPEED;
    const isMoving = forward || backward;

    setPlayerRunning(run && isMoving);

    if (left) rotRef.current += TURN_SPEED * delta;
    if (right) rotRef.current -= TURN_SPEED * delta;

    if (forward || backward) {
      const dir = forward ? 1 : -1;
      posRef.current.x += Math.sin(rotRef.current) * speed * dir * delta;
      posRef.current.z += Math.cos(rotRef.current) * speed * dir * delta;
    }

    posRef.current.x = Math.max(-145, Math.min(145, posRef.current.x));
    posRef.current.z = Math.max(-145, Math.min(145, posRef.current.z));

    const dist = posRef.current.distanceTo(prevPosRef.current);
    if (dist > 0.01 && activeMission) {
      addMissionDistance(dist);
    }
    prevPosRef.current.copy(posRef.current);

    // Bob effect when walking
    if (isMoving) {
      bobRef.current += delta * (run ? 12 : 8);
    }
    const bobY = isMoving ? Math.sin(bobRef.current) * 0.08 : 0;

    // Update mesh
    meshRef.current.position.set(posRef.current.x, posRef.current.y + bobY, posRef.current.z);
    meshRef.current.rotation.y = rotRef.current;

    // Camera follow
    const cameraOffset = new THREE.Vector3(
      -Math.sin(rotRef.current) * 12,
      8,
      -Math.cos(rotRef.current) * 12,
    );
    camera.position.lerp(
      posRef.current.clone().add(cameraOffset),
      0.08,
    );
    camera.lookAt(posRef.current.x, posRef.current.y + 1, posRef.current.z);

    setPlayerPosition([posRef.current.x, posRef.current.y, posRef.current.z]);
    setPlayerRotation(rotRef.current);
  });

  const skinColor = player.skin_tone || '#F4C88E';

  return (
    <group ref={meshRef} castShadow>
      {/* Body */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <meshLambertMaterial color={player.clothes_style === 'suit' ? '#1e293b' : '#3b82f6'} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshLambertMaterial color={skinColor} />
      </mesh>
      {/* Hair */}
      <mesh castShadow position={[0, 1.45, 0]}>
        <boxGeometry args={[0.38, 0.12, 0.38]} />
        <meshLambertMaterial color={player.hair_style === 'blonde' ? '#fbbf24' : player.hair_style === 'red' ? '#ef4444' : '#1c1917'} />
      </mesh>
      {/* Legs */}
      <mesh castShadow position={[-0.13, 0.15, 0]}>
        <boxGeometry args={[0.2, 0.5, 0.25]} />
        <meshLambertMaterial color="#1e293b" />
      </mesh>
      <mesh castShadow position={[0.13, 0.15, 0]}>
        <boxGeometry args={[0.2, 0.5, 0.25]} />
        <meshLambertMaterial color="#1e293b" />
      </mesh>
      {/* Shoes */}
      <mesh castShadow position={[-0.13, -0.05, 0.05]}>
        <boxGeometry args={[0.2, 0.12, 0.3]} />
        <meshLambertMaterial color={player.shoes_style === 'boots' ? '#78350f' : '#0f172a'} />
      </mesh>
      <mesh castShadow position={[0.13, -0.05, 0.05]}>
        <boxGeometry args={[0.2, 0.12, 0.3]} />
        <meshLambertMaterial color={player.shoes_style === 'boots' ? '#78350f' : '#0f172a'} />
      </mesh>
      {/* Arms */}
      <mesh castShadow position={[-0.35, 0.6, 0]}>
        <boxGeometry args={[0.18, 0.55, 0.2]} />
        <meshLambertMaterial color={skinColor} />
      </mesh>
      <mesh castShadow position={[0.35, 0.6, 0]}>
        <boxGeometry args={[0.18, 0.55, 0.2]} />
        <meshLambertMaterial color={skinColor} />
      </mesh>
    </group>
  );
}
