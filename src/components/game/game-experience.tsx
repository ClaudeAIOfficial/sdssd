"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Sky } from "@react-three/drei";
import * as THREE from "three";
import { CHARACTER_SKIN, POI_LOCATIONS } from "@/lib/constants";
import { useGameStore } from "@/store/game-store";
import { distance2d } from "@/lib/utils";

type KeyboardState = Record<string, boolean>;

type GameExperienceProps = {
  onMissionTrigger: () => void;
};

export function GameExperience({ onMissionTrigger }: GameExperienceProps) {
  const keyState = useRef<KeyboardState>({});

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      keyState.current[event.key.toLowerCase()] = true;
      const store = useGameStore.getState();
      if (event.repeat) {
        return;
      }
      if (event.key.toLowerCase() === "p") {
        store.togglePhone();
      }
      if (event.key.toLowerCase() === "f") {
        if (store.playerVehicleId) {
          store.exitVehicle();
        } else {
          store.enterNearestVehicle();
        }
      }
      if (event.key.toLowerCase() === "t") {
        store.interactWithNpc();
      }
      if (event.key.toLowerCase() === "c") {
        store.registerCrime();
      }
      if (event.key.toLowerCase() === "e") {
        const nearbyPoi = Object.entries(POI_LOCATIONS).find(
          ([, pos]) => distance2d(pos, store.playerPosition) < 12,
        );
        if (!nearbyPoi) {
          store.interactWithNpc();
          return;
        }
        if (store.activeInterior) {
          store.exitBuilding();
        } else {
          store.enterBuilding(nearbyPoi[0] as keyof typeof POI_LOCATIONS);
        }
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keyState.current[event.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <Canvas camera={{ position: [0, 48, 40], fov: 48 }} shadows gl={{ antialias: true }}>
      <SceneController keyState={keyState} onMissionTrigger={onMissionTrigger} />
    </Canvas>
  );
}

function SceneController({
  keyState,
  onMissionTrigger,
}: {
  keyState: React.RefObject<KeyboardState>;
  onMissionTrigger: () => void;
}) {
  const {
    playerPosition,
    playerHeading,
    playerVehicleId,
    vehicles,
    npcs,
    customization,
    dayTime,
    activeMission,
    phoneOpen,
  } = useGameStore((state) => ({
    playerPosition: state.playerPosition,
    playerHeading: state.playerHeading,
    playerVehicleId: state.playerVehicleId,
    vehicles: state.vehicles,
    npcs: state.npcs,
    customization: state.customization,
    dayTime: state.dayTime,
    activeMission: state.activeMission,
    phoneOpen: state.phoneOpen,
  }));

  const { camera } = useThree();
  const missionTriggeredRef = useRef<string | null>(null);

  useFrame((_state, delta) => {
    const game = useGameStore.getState();
    game.tickWorld(delta);
    if (!phoneOpen && !game.activeInterior) {
      const forward = (keyState.current["w"] ? 1 : 0) - (keyState.current["s"] ? 1 : 0);
      const sideways = (keyState.current["d"] ? 1 : 0) - (keyState.current["a"] ? 1 : 0);
      const dir = new THREE.Vector2(sideways, forward);
      if (dir.length() > 0.01) {
        dir.normalize();
        game.applyMovement(
          {
            x: dir.x,
            z: dir.y,
          },
          delta,
          Boolean(keyState.current["shift"]),
        );
      }
    }

    const player = game.playerPosition;
    const targetPos = new THREE.Vector3(player.x + 18, 46, player.z + 26);
    camera.position.lerp(targetPos, 0.08);
    camera.lookAt(player.x, 0, player.z);

    if (game.activeMission) {
      const distanceToDropoff = distance2d(game.activeMission.dropoff, game.playerPosition);
      if (distanceToDropoff < 8 && missionTriggeredRef.current !== game.activeMission.id) {
        missionTriggeredRef.current = game.activeMission.id;
        game.reportMissionCompleted();
        onMissionTrigger();
      }
    } else {
      missionTriggeredRef.current = null;
    }
  });

  const skyIntensity = Math.max(0.12, Math.sin((dayTime / 24) * Math.PI));

  return (
    <>
      <color attach="background" args={["#01040a"]} />
      <ambientLight intensity={0.3 + skyIntensity * 0.6} />
      <directionalLight
        position={[50, 80, 20]}
        intensity={0.3 + skyIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Sky distance={450000} sunPosition={[100, Math.max(1, skyIntensity * 100), 20]} />
      <Environment preset="city" />

      <CityGround />
      <RoadNetwork />
      <Landmarks />
      <TrafficVehicles vehicles={vehicles} />
      <NpcActors npcs={npcs} />
      {!playerVehicleId && (
        <PlayerAvatar
          position={playerPosition}
          heading={playerHeading}
          skinColor={CHARACTER_SKIN[customization.skinTone]}
        />
      )}

      {activeMission && (
        <mesh position={[activeMission.dropoff.x, 1, activeMission.dropoff.z]}>
          <cylinderGeometry args={[0.5, 0.5, 5, 12]} />
          <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.8} />
        </mesh>
      )}
    </>
  );
}

function CityGround() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#0f5132" />
      </mesh>
      <mesh position={[-115, 0.05, -100]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 80]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
      <mesh position={[-108, 0.06, -100]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[42, 74]} />
        <meshStandardMaterial color="#f4d58d" />
      </mesh>
    </group>
  );
}

function RoadNetwork() {
  const roads = [
    { pos: [0, 0.02, 0], scale: [240, 1, 22] },
    { pos: [0, 0.02, 46], scale: [200, 1, 16] },
    { pos: [0, 0.02, -48], scale: [190, 1, 16] },
    { pos: [0, 0.02, 0], scale: [20, 1, 240] },
    { pos: [56, 0.02, 0], scale: [16, 1, 220] },
    { pos: [-52, 0.02, 0], scale: [16, 1, 220] },
  ];
  return (
    <group>
      {roads.map((road, index) => (
        <mesh key={index} position={road.pos as [number, number, number]} receiveShadow>
          <boxGeometry args={road.scale as [number, number, number]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}
    </group>
  );
}

function Landmarks() {
  const buildings = useMemo(
    () => [
      { name: "Gas", x: -70, z: 45, h: 10, color: "#f97316" },
      { name: "Bank", x: 38, z: -12, h: 16, color: "#60a5fa" },
      { name: "Casino", x: 66, z: 54, h: 20, color: "#f472b6" },
      { name: "Apartments", x: -22, z: 18, h: 15, color: "#a78bfa" },
      { name: "Police", x: -44, z: -22, h: 12, color: "#93c5fd" },
      { name: "Warehouse", x: 76, z: -26, h: 11, color: "#f59e0b" },
      { name: "Harbor", x: 96, z: -76, h: 9, color: "#38bdf8" },
      { name: "Park", x: -4, z: 70, h: 8, color: "#4ade80" },
      { name: "Safehouse", x: 8, z: -70, h: 10, color: "#22c55e" },
      { name: "Garage", x: -60, z: -56, h: 7, color: "#facc15" },
    ],
    [],
  );

  return (
    <group>
      {buildings.map((building) => (
        <group key={building.name} position={[building.x, 0, building.z]}>
          <mesh castShadow receiveShadow position={[0, building.h / 2, 0]}>
            <boxGeometry args={[12, building.h, 12]} />
            <meshStandardMaterial color={building.color} />
          </mesh>
          <mesh position={[0, building.h + 1.2, 0]}>
            <boxGeometry args={[6, 2, 6]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </group>
      ))}

      {Array.from({ length: 28 }).map((_, idx) => (
        <group
          key={`palm-${idx}`}
          position={[Math.cos((idx / 28) * Math.PI * 2) * 95, 0, Math.sin((idx / 28) * Math.PI * 2) * 95]}
        >
          <mesh position={[0, 3.2, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.65, 6, 8]} />
            <meshStandardMaterial color="#92400e" />
          </mesh>
          <mesh position={[0, 6.5, 0]} castShadow>
            <coneGeometry args={[2.8, 3, 7]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PlayerAvatar({
  position,
  heading,
  skinColor,
}: {
  position: { x: number; z: number };
  heading: number;
  skinColor: string;
}) {
  return (
    <group position={[position.x, 0.2, position.z]} rotation={[0, heading, 0]}>
      <mesh castShadow position={[0, 1.4, 0]}>
        <capsuleGeometry args={[0.8, 1.5, 6, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh castShadow position={[0, 2.8, 0]}>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    </group>
  );
}

function TrafficVehicles({ vehicles }: { vehicles: ReturnType<typeof useGameStore.getState>["vehicles"] }) {
  const colorMap: Record<string, string> = {
    sports_car: "#f43f5e",
    motorcycle: "#8b5cf6",
    van: "#f59e0b",
    truck: "#0ea5e9",
    electric_car: "#10b981",
  };
  return (
    <group>
      {vehicles.map((vehicle) => (
        <group
          key={vehicle.id}
          position={[vehicle.position.x, 1.2, vehicle.position.z]}
          rotation={[0, vehicle.heading, 0]}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[vehicle.type === "motorcycle" ? 1.4 : 2.8, 1.1, 4.2]} />
            <meshStandardMaterial color={colorMap[vehicle.type]} />
          </mesh>
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[vehicle.type === "motorcycle" ? 1 : 2.2, 0.6, 2.4]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function NpcActors({ npcs }: { npcs: ReturnType<typeof useGameStore.getState>["npcs"] }) {
  const roleColors: Record<string, string> = {
    civilian: "#22d3ee",
    police: "#60a5fa",
    gang: "#fb7185",
    mission_giver: "#4ade80",
  };
  return (
    <group>
      {npcs.map((npc) => (
        <mesh key={npc.id} position={[npc.position.x, 1.1, npc.position.z]} castShadow>
          <capsuleGeometry args={[0.45, 0.9, 4, 8]} />
          <meshStandardMaterial color={roleColors[npc.role]} />
        </mesh>
      ))}
    </group>
  );
}

