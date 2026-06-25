"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { getWorld } from "@/game/world";
import { stepWorld } from "@/game/simulate";
import { LowPolyCharacter } from "./LowPolyCharacter";
import { VehicleMesh } from "./VehicleMesh";
import { useGame } from "@/lib/store";

/**
 * Runs the simulation once per frame (registered first so all actors read fresh
 * state), drives the chase camera, syncs HUD telemetry and handles mission
 * progress + arrests.
 */
export function Stepper() {
  const { camera } = useThree();
  const camTarget = useRef(new THREE.Vector3());
  const telemetryAccum = useRef(0);
  const distAccum = useRef(0);
  const completing = useRef(false);

  useEffect(() => {
    const world = getWorld();
    world.onLandmarkChange = (id) => useGame.getState().setNearLandmark(id);
    world.onArrest = () => {
      const s = useGame.getState();
      const fine = Math.min(s.profile.cash, 250);
      if (fine > 0) s.addCash(-fine);
      s.notify({ title: "BUSTED!", body: fine > 0 ? `Lost $${fine} in fines.` : "The cops got you.", kind: "warn" });
      if (s.active) s.abandonMission();
    };
    return () => {
      world.onLandmarkChange = undefined;
      world.onArrest = undefined;
    };
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = useGame.getState();
    const world = getWorld();

    if (!s.paused) {
      stepWorld(world, dt);
    }

    const p = world.player;

    // Chase camera — angled top-down following the player.
    camTarget.current.set(p.x, 0, p.z);
    const desired = new THREE.Vector3(p.x, 34, p.z + 20);
    camera.position.lerp(desired, 1 - Math.pow(0.001, dt));
    camera.lookAt(camTarget.current);

    // Mission progress.
    if (!s.paused && s.active && !completing.current) {
      const m = s.active.mission;
      distAccum.current += p.speed * dt;
      if (s.active.phase === "to_origin") {
        const d = Math.hypot(p.x - m.origin.x, p.z - m.origin.z);
        if (d < 6) {
          s.advanceMissionPhase();
          s.notify({ title: "Objective updated", body: "Head to the marked drop-off.", kind: "info" });
        }
      } else {
        const d = Math.hypot(p.x - m.target.x, p.z - m.target.z);
        if (d < 6) {
          completing.current = true;
          s.addDistance(distAccum.current);
          distAccum.current = 0;
          void s.completeActiveMission().finally(() => {
            completing.current = false;
          });
        }
      }
    } else if (!s.active) {
      distAccum.current = 0;
    }

    // Throttled telemetry push for HUD + minimap (~8 Hz).
    telemetryAccum.current += dt;
    if (telemetryAccum.current > 0.12) {
      telemetryAccum.current = 0;
      const drivingVeh = p.drivingId !== null ? world.vehicles.find((v) => v.id === p.drivingId) : null;
      s.setPlayerTelemetry({
        playerPos: { x: p.x, z: p.z },
        playerHeading: p.heading,
        inVehicle: drivingVeh ? drivingVeh.kind : null,
        wanted: world.wanted,
        speed: p.speed,
      });
    }
  });

  return null;
}

export function PlayerActor() {
  const ref = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const appearance = useGame((s) => s.profile.appearance);

  useFrame((_, delta) => {
    const world = getWorld();
    const p = world.player;
    if (!ref.current) return;
    const driving = p.drivingId !== null;
    ref.current.visible = !driving;
    if (!driving) {
      ref.current.position.set(p.x, 0, p.z);
      ref.current.rotation.y = p.heading;
      if (p.speed > 0.3) phase.current += delta * p.speed * 1.4;
    }
  });

  return (
    <group ref={ref}>
      <LowPolyCharacter appearance={appearance} phase={phase.current} moving />
      {/* Subtle neon ground glow under the player */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.8, 1.1, 24]} />
        <meshBasicMaterial color="#22e3ff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

export function Vehicles() {
  const world = getWorld();
  return (
    <>
      {world.vehicles.map((v) => (
        <VehicleMesh key={v.id} id={v.id} kind={v.kind} color={v.color} drivable={v.drivable} />
      ))}
    </>
  );
}

export function Npcs() {
  const world = getWorld();
  const refs = useRef<(THREE.Group | null)[]>([]);
  const phases = useRef<number[]>(world.npcs.map(() => Math.random() * 10));

  useFrame((_, delta) => {
    const w = getWorld();
    w.npcs.forEach((n, i) => {
      const g = refs.current[i];
      if (!g) return;
      g.position.set(n.x, 0, n.z);
      g.rotation.y = n.heading;
      const moving = Math.hypot(n.vx, n.vz) > 0.1;
      if (moving) phases.current[i] += delta * 6;
    });
  });

  return (
    <>
      {world.npcs.map((n, i) => (
        <group key={n.id} ref={(el) => { refs.current[i] = el; }}>
          <LowPolyCharacter
            appearance={{
              skin: n.color,
              hair: "#1c1c1c",
              hairStyle: i % 2 === 0 ? "short" : "buzz",
              shirt: n.shirt,
              pants: "#22304a",
              shoes: "#0a0612",
            }}
            phase={phases.current[i]}
            moving
          />
        </group>
      ))}
    </>
  );
}

export function PoliceUnits() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  // Police list size changes at runtime; render a fixed pool and toggle visibility.
  const POOL = 5;

  useFrame(() => {
    const w = getWorld();
    for (let i = 0; i < POOL; i++) {
      const g = refs.current[i];
      if (!g) continue;
      const unit = w.police[i];
      if (unit) {
        g.visible = true;
        g.position.set(unit.x, 0, unit.z);
        g.rotation.y = unit.heading;
      } else {
        g.visible = false;
      }
    }
  });

  return (
    <>
      {Array.from({ length: POOL }).map((_, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }} visible={false}>
          <PoliceCar />
        </group>
      ))}
    </>
  );
}

function PoliceCar() {
  const flash = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (flash.current) {
      const t = Math.sin(clock.elapsedTime * 12) > 0;
      flash.current.color.set(t ? "#ff2d3a" : "#2d6bff");
      flash.current.emissive.set(t ? "#ff2d3a" : "#2d6bff");
    }
  });
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[2, 0.7, 4]} />
        <meshStandardMaterial color="#0b1530" />
      </mesh>
      <mesh position={[0, 1.1, -0.2]}>
        <boxGeometry args={[1.7, 0.6, 2]} />
        <meshStandardMaterial color="#eef2ff" />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.8, 0.18, 0.4]} />
        <meshStandardMaterial ref={flash} color="#2d6bff" emissive="#2d6bff" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}
