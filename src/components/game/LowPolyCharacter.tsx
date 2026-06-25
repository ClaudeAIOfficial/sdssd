"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CharacterAppearance } from "@/lib/types";
import { retroMaterial } from "@/game/retroMaterials";

export type CharacterRole = "player" | "civilian" | "police" | "gang" | "taxi" | "casino" | "harbor";

interface Props {
  appearance: Pick<CharacterAppearance, "skin" | "hair" | "hairStyle" | "shirt" | "pants" | "shoes">;
  /** Walk animation phase (radians) for leg/arm swing. */
  phase?: number;
  moving?: boolean;
  role?: CharacterRole;
}

/**
 * A fully procedural retro humanoid. Clothing uses generated nearest-neighbour
 * canvas textures, and the shape is still just primitive boxes/spheres so many
 * NPCs remain cheap. The extra role props give readable old-crime-game crowds:
 * cops, gang lookouts, taxi drivers, casino patrons and harbor workers.
 */
export function LowPolyCharacter({ appearance, phase = 0, moving = false, role = "civilian" }: Props) {
  const root = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Mesh>(null);
  const rightLeg = useRef<THREE.Mesh>(null);
  const leftArm = useRef<THREE.Mesh>(null);
  const rightArm = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Mesh>(null);
  const localPhase = useRef(phase);

  const mats = useMemo(
    () => ({
      shirt: retroMaterial("cloth", { tint: appearance.shirt, repeat: [2, 2] }),
      pants: retroMaterial("cloth", { tint: appearance.pants, repeat: [1, 2] }),
      shoes: new THREE.MeshStandardMaterial({ color: appearance.shoes, roughness: 0.75 }),
      skin: new THREE.MeshStandardMaterial({ color: appearance.skin, roughness: 0.55 }),
      hair: new THREE.MeshStandardMaterial({ color: appearance.hair, roughness: 0.9 }),
      badge: new THREE.MeshStandardMaterial({ color: "#ffd23f", emissive: "#ffd23f", emissiveIntensity: 0.25 }),
    }),
    [appearance],
  );

  useFrame((_, delta) => {
    localPhase.current += delta * (moving ? 7.5 : 1.6);
    const walk = moving ? Math.sin(localPhase.current) * 0.65 : Math.sin(localPhase.current) * 0.05;
    const walk2 = moving ? Math.sin(localPhase.current + Math.PI) * 0.65 : -walk;
    if (root.current) {
      root.current.position.y = Math.sin(localPhase.current * (moving ? 2 : 1)) * (moving ? 0.035 : 0.025);
    }
    if (leftLeg.current) leftLeg.current.rotation.x = walk;
    if (rightLeg.current) rightLeg.current.rotation.x = walk2;
    if (leftArm.current) leftArm.current.rotation.x = walk2 * 0.8;
    if (rightArm.current) rightArm.current.rotation.x = walk * 0.8;
    if (head.current) head.current.rotation.y = Math.sin(localPhase.current * 0.7) * (moving ? 0.02 : 0.08);
  });

  return (
    <group ref={root}>
      {/* Legs */}
      <mesh ref={leftLeg} position={[-0.18, 0.5, 0]} castShadow>
        <boxGeometry args={[0.22, 0.55, 0.22]} />
        <primitive object={mats.pants} attach="material" />
      </mesh>
      <mesh ref={rightLeg} position={[0.18, 0.5, 0]} castShadow>
        <boxGeometry args={[0.22, 0.55, 0.22]} />
        <primitive object={mats.pants} attach="material" />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.18, 0.16, 0.08]}>
        <boxGeometry args={[0.24, 0.14, 0.34]} />
        <primitive object={mats.shoes} attach="material" />
      </mesh>
      <mesh position={[0.18, 0.16, 0.08]}>
        <boxGeometry args={[0.24, 0.14, 0.34]} />
        <primitive object={mats.shoes} attach="material" />
      </mesh>

      {/* Torso + blocky shoulders for a stronger PS2-era silhouette */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.58, 0.64, 0.34]} />
        <primitive object={mats.shirt} attach="material" />
      </mesh>
      <mesh position={[0, 1.33, 0]} castShadow>
        <boxGeometry args={[0.76, 0.16, 0.36]} />
        <primitive object={mats.shirt} attach="material" />
      </mesh>

      {/* Arms */}
      <mesh ref={leftArm} position={[-0.43, 1.0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.55, 0.16]} />
        <primitive object={mats.shirt} attach="material" />
      </mesh>
      <mesh ref={rightArm} position={[0.43, 1.0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.55, 0.16]} />
        <primitive object={mats.shirt} attach="material" />
      </mesh>
      {/* Hands */}
      <mesh position={[-0.43, 0.68, 0]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <primitive object={mats.skin} attach="material" />
      </mesh>
      <mesh position={[0.43, 0.68, 0]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <primitive object={mats.skin} attach="material" />
      </mesh>

      {/* Head */}
      <mesh ref={head} position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[0.34, 0.34, 0.32]} />
        <primitive object={mats.skin} attach="material" />
      </mesh>
      <mesh position={[0, 1.55, 0.17]}>
        <boxGeometry args={[0.08, 0.08, 0.04]} />
        <meshStandardMaterial color="#24130c" />
      </mesh>

      <Hair appearance={appearance} material={mats.hair} />
      <RoleDetails role={role} mats={mats} />
    </group>
  );
}

function Hair({
  appearance,
  material,
}: {
  appearance: Props["appearance"];
  material: THREE.MeshStandardMaterial;
}) {
  switch (appearance.hairStyle) {
    case "buzz":
      return (
        <mesh position={[0, 1.74, 0]}>
          <boxGeometry args={[0.36, 0.08, 0.34]} />
          <primitive object={material} attach="material" />
        </mesh>
      );
    case "afro":
      return (
        <mesh position={[0, 1.78, 0]}>
          <sphereGeometry args={[0.27, 10, 10]} />
          <primitive object={material} attach="material" />
        </mesh>
      );
    case "mohawk":
      return (
        <mesh position={[0, 1.82, 0]}>
          <boxGeometry args={[0.08, 0.2, 0.36]} />
          <primitive object={material} attach="material" />
        </mesh>
      );
    case "long":
      return (
        <group>
          <mesh position={[0, 1.76, 0]}>
            <boxGeometry args={[0.4, 0.12, 0.38]} />
            <primitive object={material} attach="material" />
          </mesh>
          <mesh position={[0, 1.5, -0.18]}>
            <boxGeometry args={[0.36, 0.45, 0.1]} />
            <primitive object={material} attach="material" />
          </mesh>
        </group>
      );
    case "short":
    default:
      return (
        <mesh position={[0, 1.76, 0]}>
          <boxGeometry args={[0.38, 0.14, 0.36]} />
          <primitive object={material} attach="material" />
        </mesh>
      );
  }
}

function RoleDetails({
  role,
  mats,
}: {
  role: CharacterRole;
  mats: Record<string, THREE.MeshStandardMaterial>;
}) {
  if (role === "police") {
    return (
      <>
        <mesh position={[0, 1.82, 0.02]}>
          <boxGeometry args={[0.46, 0.12, 0.34]} />
          <meshStandardMaterial color="#102044" />
        </mesh>
        <mesh position={[0, 1.02, 0.19]}>
          <boxGeometry args={[0.14, 0.14, 0.04]} />
          <primitive object={mats.badge} attach="material" />
        </mesh>
      </>
    );
  }
  if (role === "gang") {
    return (
      <mesh position={[0, 1.78, 0.03]}>
        <boxGeometry args={[0.5, 0.08, 0.38]} />
        <meshStandardMaterial color="#ff2d95" emissive="#ff2d95" emissiveIntensity={0.25} />
      </mesh>
    );
  }
  if (role === "taxi") {
    return (
      <mesh position={[0, 1.34, 0.19]}>
        <boxGeometry args={[0.5, 0.08, 0.04]} />
        <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={0.25} />
      </mesh>
    );
  }
  if (role === "casino") {
    return (
      <mesh position={[0, 1.06, 0.2]}>
        <boxGeometry args={[0.13, 0.55, 0.05]} />
        <meshStandardMaterial color="#f6f0ff" />
      </mesh>
    );
  }
  if (role === "harbor") {
    return (
      <mesh position={[0, 1.82, 0]}>
        <boxGeometry args={[0.42, 0.12, 0.36]} />
        <meshStandardMaterial color="#ff7a00" />
      </mesh>
    );
  }
  return null;
}
