'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import { Vehicle } from '@/types';

function CarMesh({ vehicle }: { vehicle: Vehicle }) {
  const ref = useRef<THREE.Group>(null);
  const timeRef = useRef(Math.random() * 100);
  const posRef = useRef(new THREE.Vector3(...vehicle.position));
  const dirRef = useRef(Math.random() * Math.PI * 2);
  const speedRef = useRef(vehicle.speed * 0.3);

  useFrame((_, delta) => {
    if (!ref.current) return;
    timeRef.current += delta;

    // Simple patrol AI
    dirRef.current += (Math.random() - 0.5) * 0.01;
    posRef.current.x += Math.sin(dirRef.current) * speedRef.current * delta;
    posRef.current.z += Math.cos(dirRef.current) * speedRef.current * delta;

    posRef.current.x = Math.max(vehicle.position[0] - 30, Math.min(vehicle.position[0] + 30, posRef.current.x));
    posRef.current.z = Math.max(vehicle.position[2] - 30, Math.min(vehicle.position[2] + 30, posRef.current.z));

    ref.current.position.set(posRef.current.x, 0.3, posRef.current.z);
    ref.current.rotation.y = dirRef.current + Math.PI;
  });

  const isSports = vehicle.type === 'sports';
  const isMotorcycle = vehicle.type === 'motorcycle';
  const isTruck = vehicle.type === 'truck';

  if (isMotorcycle) {
    return (
      <group ref={ref} position={vehicle.position} castShadow>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.5, 0.4, 1.8]} />
          <meshLambertMaterial color={vehicle.color} />
        </mesh>
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.4, 0.35, 0.6]} />
          <meshLambertMaterial color="#1e293b" />
        </mesh>
        {/* Wheels */}
        <mesh position={[0, 0.3, 0.7]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.15, 12]} />
          <meshLambertMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0.3, -0.7]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.15, 12]} />
          <meshLambertMaterial color="#0f172a" />
        </mesh>
      </group>
    );
  }

  const carWidth = isTruck ? 2.4 : isSports ? 1.8 : 2;
  const carLength = isTruck ? 4.5 : isSports ? 4 : 3.5;
  const carHeight = isTruck ? 1.8 : isSports ? 0.7 : 1.2;
  const cabHeight = isTruck ? 1.5 : isSports ? 0.7 : 1;

  return (
    <group ref={ref} position={vehicle.position} castShadow>
      {/* Main body */}
      <mesh castShadow position={[0, 0.3 + carHeight / 2, 0]}>
        <boxGeometry args={[carWidth, carHeight, carLength]} />
        <meshLambertMaterial color={vehicle.color} />
      </mesh>
      {/* Cabin */}
      <mesh castShadow position={[0, 0.3 + carHeight + cabHeight / 2, isSports ? -0.2 : 0]}>
        <boxGeometry args={[carWidth - 0.2, cabHeight, carLength * 0.55]} />
        <meshLambertMaterial color={new THREE.Color(vehicle.color).multiplyScalar(0.8).getHexString()} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.3 + carHeight + cabHeight / 2, carLength * 0.18]}>
        <boxGeometry args={[carWidth - 0.3, cabHeight - 0.1, 0.05]} />
        <meshLambertMaterial color="#88ccff" transparent opacity={0.5} />
      </mesh>
      {/* Wheels */}
      {[
        [-carWidth / 2 - 0.1, 0.3, carLength / 2 - 0.6],
        [carWidth / 2 + 0.1, 0.3, carLength / 2 - 0.6],
        [-carWidth / 2 - 0.1, 0.3, -(carLength / 2 - 0.6)],
        [carWidth / 2 + 0.1, 0.3, -(carLength / 2 - 0.6)],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.25, 12]} />
          <meshLambertMaterial color="#0f172a" />
        </mesh>
      ))}
      {/* Headlights */}
      <pointLight position={[0, 0.3 + carHeight / 2, carLength / 2 + 0.1]} intensity={0.5} distance={10} color="#fffef0" />
    </group>
  );
}

export default function Vehicles() {
  const vehicles = useGameStore((s) => s.vehicles);

  return (
    <>
      {vehicles.map((v) => (
        <CarMesh key={v.id} vehicle={v} />
      ))}
    </>
  );
}
