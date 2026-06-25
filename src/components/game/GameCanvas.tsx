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
import { useGame } from "@/lib/store";

// The full 3D world. Mounted client-side only (see play page dynamic import).
export function GameCanvas() {
  const quality = useGame((s) => s.graphicsQuality);
  const dpr: [number, number] =
    quality === "low" ? [0.65, 0.9] : quality === "medium" ? [0.9, 1.25] : [1, 1.65];
  const pixelated = quality !== "retroHigh";

  return (
    <Canvas
      shadows={quality !== "low"}
      dpr={dpr}
      camera={{ position: [8, 28, 30], fov: 58, near: 0.5, far: 420 }}
      gl={{ antialias: quality === "retroHigh", powerPreference: "high-performance" }}
      style={{
        imageRendering: pixelated ? "pixelated" : "auto",
        filter: quality === "low" ? "contrast(1.08) saturate(0.9)" : "contrast(1.1) saturate(1.12)",
      }}
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
