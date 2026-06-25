"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

// Drives a continuous day/night cycle: orbiting sun, shifting ambient + sky
// colour. A full cycle lasts ~3 minutes.
const CYCLE = 180;

const DAY_SKY = new THREE.Color("#24324e");
const NIGHT_SKY = new THREE.Color("#05030a");
const DAY_LIGHT = new THREE.Color("#ffe2aa");
const NIGHT_LIGHT = new THREE.Color("#9b6bff");

export function DayNight() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const { scene } = useThree();
  const tmp = useRef(new THREE.Color());

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime % CYCLE) / CYCLE; // 0..1
    const angle = t * Math.PI * 2;
    // Daylight factor: 1 at noon, 0 at midnight.
    const day = Math.max(0, Math.sin(angle));

    if (sun.current) {
      sun.current.position.set(Math.cos(angle) * 80, Math.sin(angle) * 90 + 5, 40);
      sun.current.intensity = 0.16 + day * 1.35;
      sun.current.color.copy(tmp.current.copy(NIGHT_LIGHT).lerp(DAY_LIGHT, day));
    }
    if (ambient.current) {
      ambient.current.intensity = 0.42 + day * 0.35;
    }
    const sky = tmp.current.copy(NIGHT_SKY).lerp(DAY_SKY, day);
    scene.background = sky;
    if (!scene.fog) scene.fog = new THREE.Fog(sky.getHex(), 54, 205);
    else {
      (scene.fog as THREE.Fog).color.copy(sky);
      (scene.fog as THREE.Fog).near = 54 - day * 8;
      (scene.fog as THREE.Fog).far = 205 + day * 25;
    }
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.6} />
      <directionalLight
        ref={sun}
        position={[60, 80, 40]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={260}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
      />
      {/* Fill light so the night side never goes fully black. */}
      <hemisphereLight args={["#5330a0", "#14060b", 0.55]} />
      {/* Static sodium/neon city wash: cheap atmosphere in place of expensive post FX. */}
      <pointLight position={[50, 16, -44]} color="#ff2d95" intensity={1.2} distance={75} />
      <pointLight position={[-42, 14, -48]} color="#22e3ff" intensity={0.9} distance={60} />
      <pointLight position={[78, 12, 54]} color="#ff7a00" intensity={0.8} distance={50} />
    </>
  );
}
