"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CityScene } from "./CityScene";
import { DayNight } from "./DayNight";
import {
  Npcs,
  PlayerActor,
  PoliceUnits,
  Stepper,
  Vehicles,
} from "./GameActors";
import { MissionMarkers } from "./MissionMarkers";

// The full 3D world. Mounted client-side only (see play page dynamic import).
export function GameCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [8, 34, 28], fov: 55, near: 0.5, far: 400 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <Stepper />
        <DayNight />
        <CityScene />
        <PlayerActor />
        <Vehicles />
        <Npcs />
        <PoliceUnits />
        <MissionMarkers />
      </Suspense>
    </Canvas>
  );
}
