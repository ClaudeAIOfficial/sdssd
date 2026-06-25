"use client";

/* eslint-disable react-hooks/immutability */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { cityLandmarks, vehicleCatalog } from "@/lib/gameData";
import { useGameStore } from "@/lib/store";

const keys = new Set<string>();

function KeyboardCapture() {
  useEffect(() => {
    const down = (event: KeyboardEvent) => keys.add(event.key.toLowerCase());
    const up = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      keys.clear();
    };
  }, []);
  return null;
}

export function GameCanvas() {
  return (
    <div className="absolute inset-0">
      <Canvas shadows orthographic camera={{ position: [0, 58, 48], zoom: 12, near: 0.1, far: 220 }}>
        <color attach="background" args={["#08111f"]} />
        <ambientLight intensity={0.75} />
        <directionalLight castShadow position={[18, 40, 22]} intensity={1.3} shadow-mapSize={[1024, 1024]} />
        <fog attach="fog" args={["#08111f", 70, 135]} />
        <KeyboardCapture />
        <CityGround />
        <RoadGrid />
        <Buildings />
        <PalmGroves />
        <Traffic />
        <NpcCrowds />
        <MissionMarkers />
        <PoliceUnits />
        <PlayerRig />
      </Canvas>
    </div>
  );
}

function CityGround() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[96, 96]} />
        <meshStandardMaterial color="#17314a" roughness={0.78} />
      </mesh>
      <mesh position={[-37, 0.03, 25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 38]} />
        <meshStandardMaterial color="#f4c989" roughness={0.9} />
      </mesh>
      <mesh position={[36, 0.02, -31]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#0f5270" roughness={0.8} />
      </mesh>
      <mesh position={[18, 0.04, 26]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[11, 20]} />
        <meshStandardMaterial color="#1f8f5a" roughness={0.8} />
      </mesh>
    </group>
  );
}

function RoadGrid() {
  const roads = useMemo(
    () => [
      { position: [0, 0.06, 0], scale: [92, 0.08, 7] },
      { position: [0, 0.07, 20], scale: [78, 0.08, 5] },
      { position: [0, 0.07, -22], scale: [72, 0.08, 5] },
      { position: [-24, 0.08, 0], scale: [6, 0.08, 86] },
      { position: [10, 0.08, 0], scale: [6, 0.08, 88] },
      { position: [32, 0.08, 0], scale: [5, 0.08, 72] },
    ],
    [],
  );
  return (
    <group>
      {roads.map((road, index) => (
        <mesh key={index} position={road.position as [number, number, number]} scale={road.scale as [number, number, number]} receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#1d2434" roughness={0.92} />
        </mesh>
      ))}
      {Array.from({ length: 22 }).map((_, index) => (
        <mesh key={index} position={[-42 + index * 4, 0.14, 0]} scale={[1.4, 0.03, 0.08]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f8fafc" emissive="#facc15" emissiveIntensity={0.12} />
        </mesh>
      ))}
    </group>
  );
}

function Buildings() {
  const buildings = useMemo(
    () =>
      cityLandmarks.map((landmark, index) => ({
        ...landmark,
        height: 3 + ((index * 17) % 9),
        color: ["#0ea5e9", "#ec4899", "#f97316", "#8b5cf6", "#22c55e", "#facc15"][index % 6],
      })),
    [],
  );

  return (
    <group>
      {buildings.map((building) => (
        <group key={building.id} position={[building.position[0], 0, building.position[1]]}>
          <mesh castShadow receiveShadow position={[0, building.height / 2, 0]}>
            <boxGeometry args={[8, building.height, 8]} />
            <meshStandardMaterial color={building.color} roughness={0.58} />
          </mesh>
          <mesh position={[0, building.height + 0.35, 0]}>
            <coneGeometry args={[5.8, 1.1, 4]} />
            <meshStandardMaterial color="#111827" emissive={building.color} emissiveIntensity={0.16} />
          </mesh>
          <mesh position={[0, 0.09, 5.2]} scale={[7, 0.06, 0.7]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ffffff" emissive={building.color} emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 34 }).map((_, index) => {
        const x = -40 + ((index * 13) % 76);
        const z = -38 + ((index * 19) % 74);
        const nearRoad = Math.abs(z) < 7 || Math.abs(z - 20) < 5 || Math.abs(z + 22) < 5 || Math.abs(x + 24) < 7 || Math.abs(x - 10) < 7;
        if (nearRoad) return null;
        const height = 2.8 + ((index * 11) % 10);
        return (
          <mesh key={index} castShadow receiveShadow position={[x, height / 2, z]} rotation={[0, ((index % 4) * Math.PI) / 2, 0]}>
            <boxGeometry args={[5 + (index % 3), height, 5 + ((index + 1) % 3)]} />
            <meshStandardMaterial color={index % 2 ? "#334155" : "#475569"} emissive={index % 5 === 0 ? "#06b6d4" : "#000000"} emissiveIntensity={0.1} />
          </mesh>
        );
      })}
    </group>
  );
}

function PalmGroves() {
  return (
    <group>
      {Array.from({ length: 28 }).map((_, index) => {
        const x = -44 + (index % 7) * 4.2;
        const z = 10 + Math.floor(index / 7) * 8;
        return (
          <group key={index} position={[x, 0, z]} rotation={[0, index, 0]}>
            <mesh castShadow position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.25, 0.38, 2.4, 6]} />
              <meshStandardMaterial color="#8b5a2b" />
            </mesh>
            <mesh castShadow position={[0, 2.8, 0]} rotation={[0, 0, Math.PI / 4]}>
              <coneGeometry args={[1.8, 1.1, 6]} />
              <meshStandardMaterial color="#16a34a" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Traffic() {
  const refs = useRef<THREE.Group[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((ref, index) => {
      if (!ref) return;
      const lane = index % 3;
      ref.position.x = ((clock.elapsedTime * (4 + lane) * (index % 2 ? -1 : 1) + index * 13 + 45) % 92) - 46;
      ref.position.z = lane === 0 ? -22 : lane === 1 ? 0 : 20;
      ref.rotation.y = index % 2 ? -Math.PI / 2 : Math.PI / 2;
    });
  });

  return (
    <group>
      {Array.from({ length: 15 }).map((_, index) => {
        const vehicle = vehicleCatalog[index % vehicleCatalog.length];
        return (
          <group key={index} ref={(node: THREE.Group | null) => { if (node) refs.current[index] = node; }}>
            <mesh castShadow position={[0, 0.55, 0]} scale={[1.8, 0.55, 3]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={vehicle.color} roughness={0.42} />
            </mesh>
            <mesh castShadow position={[0, 1.05, -0.3]} scale={[1.25, 0.45, 1.2]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#dbeafe" emissive="#38bdf8" emissiveIntensity={0.18} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function NpcCrowds() {
  const refs = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((ref, index) => {
      if (!ref) return;
      const radius = 4 + (index % 4);
      ref.position.x = Math.cos(clock.elapsedTime * 0.35 + index) * radius + (-25 + (index % 6) * 10);
      ref.position.z = Math.sin(clock.elapsedTime * 0.35 + index) * radius + (-14 + Math.floor(index / 6) * 12);
    });
  });

  return (
    <group>
      {Array.from({ length: 24 }).map((_, index) => (
        <mesh key={index} castShadow ref={(node: THREE.Mesh | null) => { if (node) refs.current[index] = node; }} position={[0, 0.75, 0]}>
          <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
          <meshStandardMaterial color={index % 3 === 0 ? "#f472b6" : index % 3 === 1 ? "#38bdf8" : "#facc15"} />
        </mesh>
      ))}
    </group>
  );
}

function MissionMarkers() {
  const activeMission = useGameStore((state) => state.activeMission);
  const missions = useGameStore((state) => state.missions);
  const markerRefs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    markerRefs.current.forEach((ref, index) => {
      if (!ref) return;
      ref.position.y = 1.2 + Math.sin(clock.elapsedTime * 2 + index) * 0.25;
      ref.rotation.y += 0.03;
    });
  });

  const markers = activeMission
    ? [{ id: activeMission.id, position: activeMission.target, color: "#22c55e" }]
    : missions.slice(0, 8).map((mission) => ({ id: mission.id, position: mission.start, color: mission.solEligible ? "#facc15" : "#06b6d4" }));

  return (
    <group>
      {markers.map((marker, index) => (
        <mesh key={marker.id} ref={(node: THREE.Mesh | null) => { if (node) markerRefs.current[index] = node; }} position={[marker.position[0], 1.2, marker.position[1]]}>
          <octahedronGeometry args={[1.2]} />
          <meshStandardMaterial color={marker.color} emissive={marker.color} emissiveIntensity={0.75} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function PoliceUnits() {
  const wantedStars = useGameStore((state) => state.player?.wantedStars ?? 0);
  const position = useGameStore((state) => state.position);
  const refs = useRef<THREE.Group[]>([]);

  useFrame(({ clock }) => {
    refs.current.forEach((ref, index) => {
      if (!ref) return;
      const angle = clock.elapsedTime * (0.45 + index * 0.08) + index;
      const radius = 12 + index * 3;
      ref.position.x = position[0] + Math.cos(angle) * radius;
      ref.position.z = position[1] + Math.sin(angle) * radius;
      ref.rotation.y = -angle;
    });
  });

  return (
    <group>
      {Array.from({ length: wantedStars }).map((_, index) => (
        <group key={index} ref={(node: THREE.Group | null) => { if (node) refs.current[index] = node; }}>
          <mesh castShadow position={[0, 0.55, 0]} scale={[1.7, 0.6, 2.8]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#0f172a" emissive="#ef4444" emissiveIntensity={0.18} />
          </mesh>
          <mesh position={[0, 1.1, 0]} scale={[0.7, 0.16, 0.25]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PlayerRig() {
  const group = useRef<THREE.Group>(null);
  const updateMovement = useGameStore((state) => state.updateMovement);
  const enterVehicle = useGameStore((state) => state.enterVehicle);
  const tickDayPhase = useGameStore((state) => state.tickDayPhase);
  const position = useGameStore((state) => state.position);
  const isDriving = useGameStore((state) => state.isDriving);
  const currentVehicle = useGameStore((state) => state.currentVehicle);
  const character = useGameStore((state) => state.player?.character);
  const { camera } = useThree();

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    tickDayPhase(delta);

    const xAxis = (keys.has("a") || keys.has("arrowleft") ? -1 : 0) + (keys.has("d") || keys.has("arrowright") ? 1 : 0);
    const zAxis = (keys.has("w") || keys.has("arrowup") ? -1 : 0) + (keys.has("s") || keys.has("arrowdown") ? 1 : 0);
    const inputLength = Math.hypot(xAxis, zAxis) || 1;
    const baseSpeed = state.isDriving && state.currentVehicle ? state.currentVehicle.speed : keys.has("shift") ? 8.5 : 5.4;
    const next: [number, number] = [
      THREE.MathUtils.clamp(state.position[0] + (xAxis / inputLength) * baseSpeed * delta, -45, 45),
      THREE.MathUtils.clamp(state.position[1] + (zAxis / inputLength) * baseSpeed * delta, -45, 45),
    ];
    const moving = xAxis !== 0 || zAxis !== 0;

    if (moving) {
      updateMovement(next, baseSpeed);
      if (group.current) {
        group.current.rotation.y = Math.atan2(xAxis, zAxis);
      }
    }

    if (keys.has("q") && state.isDriving) {
      enterVehicle(null);
      keys.delete("q");
    }

    if (group.current) {
      group.current.position.x = state.position[0];
      group.current.position.z = state.position[1];
      group.current.position.y = state.isDriving ? 0.25 : 0;
    }
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, state.position[0], 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, state.position[1] + 42, 0.08);
    camera.lookAt(state.position[0], 0, state.position[1]);
  });

  return (
    <group ref={group} position={[position[0], 0, position[1]]}>
      {isDriving && currentVehicle ? (
        <group>
          <mesh castShadow position={[0, 0.55, 0]} scale={[2.1, 0.65, 3.3]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={currentVehicle.color} roughness={0.35} />
          </mesh>
          <mesh castShadow position={[0, 1.1, -0.4]} scale={[1.25, 0.45, 1.2]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#dbeafe" emissive="#67e8f9" emissiveIntensity={0.25} />
          </mesh>
        </group>
      ) : (
        <group>
          <mesh castShadow position={[0, 1.55, 0]}>
            <sphereGeometry args={[0.42, 12, 10]} />
            <meshStandardMaterial color={character?.skinTone ?? "#b77955"} />
          </mesh>
          <mesh castShadow position={[0, 0.85, 0]}>
            <capsuleGeometry args={[0.42, 0.9, 6, 10]} />
            <meshStandardMaterial color={character?.clothes.includes("Coral") ? "#fb7185" : character?.clothes.includes("Validator") ? "#34d399" : "#22d3ee"} />
          </mesh>
          <mesh castShadow position={[0, 1.95, -0.05]} scale={[0.9, 0.28, 0.7]}>
            <sphereGeometry args={[0.45, 10, 8]} />
            <meshStandardMaterial color={character?.hair.includes("Midnight") ? "#111827" : "#facc15"} />
          </mesh>
          <mesh castShadow position={[-0.18, 0.25, 0]} scale={[0.18, 0.22, 0.5]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh castShadow position={[0.18, 0.25, 0]} scale={[0.18, 0.22, 0.5]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      )}
    </group>
  );
}
