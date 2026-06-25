"use client";

import type { CharacterAppearance } from "@/lib/types";

interface Props {
  appearance: Pick<CharacterAppearance, "skin" | "hair" | "hairStyle" | "shirt" | "pants" | "shoes">;
  /** Walk animation phase (radians) for leg/arm swing. */
  phase?: number;
  moving?: boolean;
}

/**
 * A fully procedural low-poly humanoid built from primitive boxes/spheres.
 * No external models — everything is original geometry.
 */
export function LowPolyCharacter({ appearance, phase = 0, moving = false }: Props) {
  const swing = moving ? Math.sin(phase) * 0.5 : 0;
  const swing2 = moving ? Math.sin(phase + Math.PI) * 0.5 : 0;

  return (
    <group>
      {/* Legs */}
      <mesh position={[-0.16, 0.45 + swing * 0.05, swing * 0.18]} rotation={[swing, 0, 0]} castShadow>
        <boxGeometry args={[0.22, 0.55, 0.22]} />
        <meshStandardMaterial color={appearance.pants} />
      </mesh>
      <mesh position={[0.16, 0.45 + swing2 * 0.05, swing2 * 0.18]} rotation={[swing2, 0, 0]} castShadow>
        <boxGeometry args={[0.22, 0.55, 0.22]} />
        <meshStandardMaterial color={appearance.pants} />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.16, 0.16, 0.06 + swing * 0.18]}>
        <boxGeometry args={[0.24, 0.14, 0.34]} />
        <meshStandardMaterial color={appearance.shoes} />
      </mesh>
      <mesh position={[0.16, 0.16, 0.06 + swing2 * 0.18]}>
        <boxGeometry args={[0.24, 0.14, 0.34]} />
        <meshStandardMaterial color={appearance.shoes} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.52, 0.62, 0.3]} />
        <meshStandardMaterial color={appearance.shirt} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.36, 1.0, swing2 * 0.18]} rotation={[swing2, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.55, 0.16]} />
        <meshStandardMaterial color={appearance.shirt} />
      </mesh>
      <mesh position={[0.36, 1.0, swing * 0.18]} rotation={[swing, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.55, 0.16]} />
        <meshStandardMaterial color={appearance.shirt} />
      </mesh>
      {/* Hands */}
      <mesh position={[-0.36, 0.7, swing2 * 0.3]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color={appearance.skin} />
      </mesh>
      <mesh position={[0.36, 0.7, swing * 0.3]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color={appearance.skin} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[0.34, 0.34, 0.32]} />
        <meshStandardMaterial color={appearance.skin} />
      </mesh>

      <Hair appearance={appearance} />
    </group>
  );
}

function Hair({ appearance }: { appearance: Props["appearance"] }) {
  const c = appearance.hair;
  switch (appearance.hairStyle) {
    case "buzz":
      return (
        <mesh position={[0, 1.74, 0]}>
          <boxGeometry args={[0.36, 0.08, 0.34]} />
          <meshStandardMaterial color={c} />
        </mesh>
      );
    case "afro":
      return (
        <mesh position={[0, 1.78, 0]}>
          <sphereGeometry args={[0.27, 10, 10]} />
          <meshStandardMaterial color={c} />
        </mesh>
      );
    case "mohawk":
      return (
        <mesh position={[0, 1.82, 0]}>
          <boxGeometry args={[0.08, 0.2, 0.36]} />
          <meshStandardMaterial color={c} />
        </mesh>
      );
    case "long":
      return (
        <group>
          <mesh position={[0, 1.76, 0]}>
            <boxGeometry args={[0.4, 0.12, 0.38]} />
            <meshStandardMaterial color={c} />
          </mesh>
          <mesh position={[0, 1.5, -0.18]}>
            <boxGeometry args={[0.36, 0.45, 0.1]} />
            <meshStandardMaterial color={c} />
          </mesh>
        </group>
      );
    case "short":
    default:
      return (
        <mesh position={[0, 1.76, 0]}>
          <boxGeometry args={[0.38, 0.14, 0.36]} />
          <meshStandardMaterial color={c} />
        </mesh>
      );
  }
}
