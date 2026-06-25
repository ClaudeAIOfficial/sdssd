import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { KeyState } from './useKeyboard';
import { useGameStore } from '@/store/gameStore';

const WALK_SPEED = 4;
const RUN_SPEED = 8;
const DRIVE_SPEED = 20;
const TURN_SPEED = 2.5;

export function usePlayerMovement(keys: React.RefObject<KeyState>) {
  const posRef = useRef(new THREE.Vector3(0, 0.5, 0));
  const rotRef = useRef(0);
  const prevPosRef = useRef(new THREE.Vector3(0, 0.5, 0));

  const {
    setPlayerPosition,
    setPlayerRotation,
    setPlayerRunning,
    activeMission,
    addMissionDistance,
  } = useGameStore();

  useFrame((_, delta) => {
    if (!keys.current) return;

    const { forward, backward, left, right, run } = keys.current;
    const speed = run ? RUN_SPEED : WALK_SPEED;
    const isMoving = forward || backward || left || right;

    setPlayerRunning(run && isMoving);

    if (left) rotRef.current += TURN_SPEED * delta;
    if (right) rotRef.current -= TURN_SPEED * delta;

    if (forward || backward) {
      const dir = forward ? 1 : -1;
      posRef.current.x += Math.sin(rotRef.current) * speed * dir * delta;
      posRef.current.z += Math.cos(rotRef.current) * speed * dir * delta;
    }

    // Clamp to city bounds
    posRef.current.x = Math.max(-150, Math.min(150, posRef.current.x));
    posRef.current.z = Math.max(-150, Math.min(150, posRef.current.z));
    posRef.current.y = 0.5;

    const dist = posRef.current.distanceTo(prevPosRef.current);
    if (dist > 0.01 && activeMission) {
      addMissionDistance(dist);
    }

    prevPosRef.current.copy(posRef.current);
    setPlayerPosition([posRef.current.x, posRef.current.y, posRef.current.z]);
    setPlayerRotation(rotRef.current);
  });

  return { posRef, rotRef };
}
