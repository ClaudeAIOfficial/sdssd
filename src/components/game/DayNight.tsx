"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

// Drives a continuous day/night cycle: orbiting sun, shifting ambient + sky
// colour. A full cycle lasts ~3 minutes.
const CYCLE = 180;

const DAY_SKY = new THREE.Color("#1b3a6b");
const NIGHT_SKY = new THREE.Color("#070210");
const DAY_LIGHT = new THREE.Color("#fff2d6");
const NIGHT_LIGHT = new THREE.Color("#5a6bff");

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
      sun.current.intensity = 0.25 + day * 1.4;
      sun.current.color.copy(tmp.current.copy(NIGHT_LIGHT).lerp(DAY_LIGHT, day));
    }
    if (ambient.current) {
      ambient.current.intensity = 0.35 + day * 0.5;
    }
    const sky = tmp.current.copy(NIGHT_SKY).lerp(DAY_SKY, day);
    scene.background = sky;
    if (!scene.fog) scene.fog = new THREE.Fog(sky.getHex(), 70, 230);
    else {
      (scene.fog as THREE.Fog).color.copy(sky);
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
      <hemisphereLight args={["#3a2a6b", "#0a0612", 0.4]} />
    </>
  );
}
