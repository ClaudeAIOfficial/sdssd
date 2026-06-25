"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { buildCity } from "@/game/cityLayout";
import { WORLD } from "@/lib/constants";
import { LANDMARKS } from "@/lib/cityData";

// Renders the static city: ground, road grid, buildings (instanced) and the
// floating neon labels for each landmark.
export function CityScene() {
  const buildings = useMemo(() => buildCity(), []);

  const { geo, mat, instances } = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ vertexColors: false });
    return { geo, mat, instances: buildings };
  }, [buildings]);

  const roadLines = useMemo(() => {
    const lines: { pos: [number, number, number]; size: [number, number] }[] = [];
    const span = WORLD.half * 2 + WORLD.blockSize;
    const count = Math.floor(WORLD.half / WORLD.blockSize);
    for (let i = -count; i <= count; i++) {
      const v = i * WORLD.blockSize;
      lines.push({ pos: [0, 0.02, v], size: [span, WORLD.roadWidth] }); // east-west
      lines.push({ pos: [v, 0.021, 0], size: [WORLD.roadWidth, span] }); // north-south
    }
    return lines;
  }, []);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[WORLD.half * 2.6, WORLD.half * 2.6]} />
        <meshStandardMaterial color="#10203a" />
      </mesh>

      {/* Beach sand near Vice Beach */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-90, 0.01, 30]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#e7c98f" />
      </mesh>
      {/* Harbor water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[100, 0.01, -15]}>
        <planeGeometry args={[60, 80]} />
        <meshStandardMaterial color="#0b6b7a" transparent opacity={0.85} />
      </mesh>

      {/* Roads */}
      {roadLines.map((r, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={r.pos} receiveShadow>
          <planeGeometry args={r.size} />
          <meshStandardMaterial color="#0a0a14" />
        </mesh>
      ))}

      {/* Buildings (instanced for performance) */}
      <Buildings geo={geo} mat={mat} instances={instances} />

      {/* Landmark labels */}
      {LANDMARKS.map((lm) => (
        <Html
          key={lm.id}
          position={[lm.pos.x, lm.id === "apartments" ? 38 : 20, lm.pos.z]}
          center
          distanceFactor={70}
          occlude={false}
          zIndexRange={[10, 0]}
        >
          <div
            className="no-select pointer-events-none whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-bold"
            style={{
              background: "rgba(5,2,12,0.7)",
              border: `1px solid ${lm.color}`,
              color: lm.color,
              boxShadow: `0 0 10px ${lm.color}`,
            }}
          >
            {lm.icon} {lm.name}
          </div>
        </Html>
      ))}

      {/* Palm trees scattered along the beach + park */}
      <PalmTrees />
    </group>
  );
}

function Buildings({
  geo,
  mat,
  instances,
}: {
  geo: THREE.BoxGeometry;
  mat: THREE.MeshStandardMaterial;
  instances: ReturnType<typeof buildCity>;
}) {
  const ref = useMemo(() => {
    const mesh = new THREE.InstancedMesh(geo, mat, instances.length);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    instances.forEach((b, i) => {
      dummy.position.set(b.x, b.h / 2, b.z);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.set(b.color);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }, [geo, mat, instances]);

  return (
    <>
      <primitive object={ref} />
      {/* Neon roof accents */}
      {instances.map((b, i) => (
        <mesh key={i} position={[b.x, b.h + 0.3, b.z]}>
          <boxGeometry args={[b.w * 0.9, 0.4, b.d * 0.9]} />
          <meshStandardMaterial
            color={b.roof}
            emissive={b.roof}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </>
  );
}

function PalmTrees() {
  const spots = useMemo(() => {
    const out: [number, number][] = [];
    // Beach line
    for (let i = 0; i < 10; i++) out.push([-110 + i * 4, 5 + (i % 3) * 6]);
    // Park
    for (let i = 0; i < 6; i++) out.push([0 + (i - 3) * 4, -10 + ((i * 7) % 12)]);
    return out;
  }, []);
  return (
    <>
      {spots.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.4, 4, 6]} />
            <meshStandardMaterial color="#6b4a2b" />
          </mesh>
          {[0, 1, 2, 3, 4].map((f) => (
            <mesh key={f} position={[0, 4, 0]} rotation={[0.5, (f / 5) * Math.PI * 2, 0]}>
              <coneGeometry args={[0.4, 2.4, 4]} />
              <meshStandardMaterial color="#1be7b6" />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}
