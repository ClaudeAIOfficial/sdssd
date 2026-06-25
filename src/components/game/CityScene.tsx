"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { buildCity } from "@/game/cityLayout";
import { WORLD } from "@/lib/constants";
import { LANDMARKS } from "@/lib/cityData";
import { retroMaterial, signTexture } from "@/game/retroMaterials";
import { useGame } from "@/lib/store";

// Renders the static city. The core buildings remain instanced for performance,
// while detail layers (facade windows, signs, street props and road markings)
// use tiny procedural/pixel textures to achieve a gritty PS1/PS2 crime-city look
// without shipping any external asset packs.
export function CityScene() {
  const quality = useGame((s) => s.graphicsQuality);
  const buildings = useMemo(() => buildCity(), []);

  const { geo, mat, instances, windowData, doorData, roofData } = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = retroMaterial("brick", {
      tint: "#6f4b58",
      repeat: [2, 4],
      vertexColors: true,
      roughness: 0.92,
    });
    const facade = buildFacadeData(buildings);
    return { geo, mat, instances: buildings, ...facade };
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

  const detailLimit = quality === "low" ? 0.45 : quality === "medium" ? 0.75 : 1;

  return (
    <group>
      {/* Gritty concrete ground under the whole city grid. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[WORLD.half * 2.6, WORLD.half * 2.6]} />
        <primitive object={retroMaterial("concrete", { tint: "#172033", repeat: [28, 28] })} attach="material" />
      </mesh>

      {/* Beach sand near Vice Beach */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-90, 0.01, 30]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <primitive object={retroMaterial("sand", { tint: "#d6b06a", repeat: [10, 10] })} attach="material" />
      </mesh>
      {/* Harbor water + dock boards */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[100, 0.01, -15]}>
        <planeGeometry args={[60, 80]} />
        <meshStandardMaterial color="#062c3e" emissive="#083a4d" emissiveIntensity={0.18} transparent opacity={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[78, 0.04, -14]} receiveShadow>
        <planeGeometry args={[20, 70]} />
        <primitive object={retroMaterial("dock", { tint: "#5b3b25", repeat: [6, 16] })} attach="material" />
      </mesh>

      {/* Roads */}
      {roadLines.map((r, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={r.pos} receiveShadow>
          <planeGeometry args={r.size} />
          <primitive object={retroMaterial("asphalt", { tint: "#101016", repeat: [16, 3] })} attach="material" />
        </mesh>
      ))}
      <RoadDetails />

      {/* Buildings (instanced for performance) */}
      <Buildings geo={geo} mat={mat} instances={instances} />
      {detailLimit > 0 && (
        <>
          <FacadeWindows data={windowData.slice(0, Math.floor(windowData.length * detailLimit))} />
          <FacadeDoors data={doorData} />
          <RoofDetails data={roofData.slice(0, Math.floor(roofData.length * detailLimit))} />
        </>
      )}

      <NeonSigns />
      <CityProps density={detailLimit} />

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
      // Per-building vertex colour multiplies the shared brick texture, giving
      // variety without one material per building.
      color.set(b.landmark ? b.color : b.color);
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
          <primitive object={retroMaterial("roof", { tint: b.roof, emissive: b.roof, emissiveIntensity: 0.45 })} attach="material" />
        </mesh>
      ))}
    </>
  );
}

interface FacadeRect {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
}

function buildFacadeData(buildings: ReturnType<typeof buildCity>): {
  windowData: FacadeRect[];
  doorData: FacadeRect[];
  roofData: FacadeRect[];
} {
  const windowData: FacadeRect[] = [];
  const doorData: FacadeRect[] = [];
  const roofData: FacadeRect[] = [];

  buildings.forEach((b, idx) => {
    if (b.h <= 2) return;
    const floors = Math.max(1, Math.floor((b.h - 3) / 4));
    const colsFront = Math.max(1, Math.floor(b.w / 4));
    const colsSide = Math.max(1, Math.floor(b.d / 4));
    const yBase = 3;

    // Front/back windows.
    for (let floor = 0; floor < floors; floor++) {
      const y = yBase + floor * 3.8;
      for (let c = 0; c < colsFront; c++) {
        if ((c + floor + idx) % 4 === 0) continue;
        const x = b.x - b.w * 0.38 + (c / Math.max(1, colsFront - 1)) * b.w * 0.76;
        windowData.push({ x, y, z: b.z + b.d / 2 + 0.04, sx: 1.1, sy: 1.45, sz: 0.07 });
        if ((c + floor + idx) % 3 !== 0) {
          windowData.push({ x, y, z: b.z - b.d / 2 - 0.04, sx: 1.1, sy: 1.45, sz: 0.07 });
        }
      }
      for (let c = 0; c < colsSide; c++) {
        if ((c + floor + idx) % 5 === 0) continue;
        const z = b.z - b.d * 0.38 + (c / Math.max(1, colsSide - 1)) * b.d * 0.76;
        windowData.push({ x: b.x + b.w / 2 + 0.04, y, z, sx: 0.07, sy: 1.3, sz: 1.0 });
      }
    }

    doorData.push({ x: b.x, y: 1.35, z: b.z + b.d / 2 + 0.07, sx: 2.0, sy: 2.7, sz: 0.12 });
    roofData.push({ x: b.x, y: b.h + 0.7, z: b.z, sx: b.w * 0.34, sy: 0.7, sz: b.d * 0.24 });
  });

  return { windowData, doorData, roofData };
}

function FacadeWindows({ data }: { data: FacadeRect[] }) {
  const mesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = retroMaterial("glass", {
      tint: "#174863",
      emissive: "#0a87b8",
      emissiveIntensity: 0.18,
      roughness: 0.35,
      metalness: 0.2,
    });
    const inst = new THREE.InstancedMesh(geo, mat, data.length);
    const dummy = new THREE.Object3D();
    data.forEach((r, i) => {
      dummy.position.set(r.x, r.y, r.z);
      dummy.scale.set(r.sx, r.sy, r.sz);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
    return inst;
  }, [data]);
  return <primitive object={mesh} />;
}

function FacadeDoors({ data }: { data: FacadeRect[] }) {
  const mesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = retroMaterial("metal", { tint: "#555b66", repeat: [1, 2], metalness: 0.35, roughness: 0.75 });
    const inst = new THREE.InstancedMesh(geo, mat, data.length);
    const dummy = new THREE.Object3D();
    data.forEach((r, i) => {
      dummy.position.set(r.x, r.y, r.z);
      dummy.scale.set(r.sx, r.sy, r.sz);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
    return inst;
  }, [data]);
  return <primitive object={mesh} />;
}

function RoofDetails({ data }: { data: FacadeRect[] }) {
  const mesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = retroMaterial("rust", { tint: "#6b4a33", repeat: [1, 1] });
    const inst = new THREE.InstancedMesh(geo, mat, data.length);
    const dummy = new THREE.Object3D();
    data.forEach((r, i) => {
      dummy.position.set(r.x, r.y, r.z);
      dummy.scale.set(r.sx, r.sy, r.sz);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
    return inst;
  }, [data]);
  return <primitive object={mesh} />;
}

function RoadDetails() {
  const count = Math.floor(WORLD.half / WORLD.blockSize);
  const lines = [];
  const crosswalks = [];
  for (let i = -count; i <= count; i++) {
    const v = i * WORLD.blockSize;
    lines.push(<LaneLine key={`ew-${i}`} x={0} z={v} sx={WORLD.half * 2.1} sz={0.28} />);
    lines.push(<LaneLine key={`ns-${i}`} x={v} z={0} sx={0.28} sz={WORLD.half * 2.1} />);
    for (let j = -count; j <= count; j++) {
      if ((i + j) % 2 !== 0) continue;
      crosswalks.push(<Crosswalk key={`${i}:${j}:a`} x={v - 5.6} z={j * WORLD.blockSize} rot={0} />);
      crosswalks.push(<Crosswalk key={`${i}:${j}:b`} x={v} z={j * WORLD.blockSize - 5.6} rot={Math.PI / 2} />);
    }
  }
  return (
    <>
      {lines}
      {crosswalks}
      <ParkingLot x={42} z={20} />
      <ParkingLot x={-56} z={-22} />
    </>
  );
}

function LaneLine({ x, z, sx, sz }: { x: number; z: number; sx: number; sz: number }) {
  return (
    <mesh position={[x, 0.06, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[sx, sz]} />
      <meshBasicMaterial color="#d7bd4c" transparent opacity={0.58} />
    </mesh>
  );
}

function Crosswalk({ x, z, rot }: { x: number; z: number; rot: number }) {
  return (
    <group position={[x, 0.075, z]} rotation={[0, rot, 0]}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[i * 1.4 - 2.8, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.8, 4.6]} />
          <meshBasicMaterial color="#ded8c7" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function ParkingLot({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.08, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 14]} />
        <primitive object={retroMaterial("asphalt", { tint: "#15151c", repeat: [4, 3] })} attach="material" />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-8 + i * 4, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.18, 10]} />
          <meshBasicMaterial color="#ded8c7" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function NeonSigns() {
  const signs = useMemo(
    () => [
      { text: "SOLANA RESERVE", x: -45, y: 14, z: -34, color: "#22e3ff" },
      { text: "NEON ROYALE", x: 48, y: 18, z: -31, color: "#ffd23f" },
      { text: "GTS METRO PD", x: -10, y: 16, z: 70, color: "#4b8bff" },
      { text: "PUMPFUEL", x: 30, y: 10, z: 41, color: "#ff7a00" },
      { text: "HARBOR WAREHOUSE 7", x: 75, y: 14, z: 66, color: "#d916ff" },
      { text: "PHANTOM PAY", x: 10, y: 24, z: -45, color: "#9d6cff" },
      { text: "DEX DRIVE-IN", x: -75, y: 18, z: -18, color: "#1be7b6" },
    ],
    [],
  );

  return (
    <>
      {signs.map((s) => (
        <group key={s.text} position={[s.x, s.y, s.z]}>
          <mesh>
            <boxGeometry args={[10.5, 4.1, 0.25]} />
            <meshBasicMaterial color="#09020f" />
          </mesh>
          <mesh position={[0, 0, 0.16]}>
            <planeGeometry args={[10, 3.6]} />
            <meshBasicMaterial
              map={signTexture(s.text, { bg: "#09020f", fg: s.color, accent: "#ff2d95" })}
              transparent={false}
              toneMapped={false}
            />
          </mesh>
          <pointLight color={s.color} intensity={1.2} distance={18} />
        </group>
      ))}
    </>
  );
}

function CityProps({ density }: { density: number }) {
  const props = useMemo(() => {
    const out: { kind: string; x: number; z: number; r: number; color?: string }[] = [];
    const count = Math.floor(WORLD.half / WORLD.blockSize);
    for (let i = -count; i <= count; i++) {
      const line = i * WORLD.blockSize;
      for (let j = -count; j <= count; j++) {
        const cross = j * WORLD.blockSize;
        if ((i + j) % 2 === 0) {
          out.push({ kind: "lamp", x: line + 5.6, z: cross + 5.6, r: 0 });
          out.push({ kind: "traffic", x: line - 5.2, z: cross - 5.2, r: Math.PI / 2 });
        }
        if ((i * 7 + j * 3) % 5 === 0) out.push({ kind: "hydrant", x: line + 6.6, z: cross - 8, r: 0 });
        if ((i * 5 + j) % 7 === 0) out.push({ kind: "dumpster", x: line - 8, z: cross + 9, r: 0 });
        if ((i + j * 2) % 6 === 0) out.push({ kind: "bench", x: line + 9, z: cross + 7, r: Math.PI / 2 });
        if ((i * 2 - j) % 8 === 0) out.push({ kind: "phone", x: line - 9, z: cross - 7, r: 0 });
        if ((i * 3 + j * 11) % 9 === 0) out.push({ kind: "cone", x: line + 3, z: cross - 12, r: 0 });
      }
    }
    // Harbor/warehouse clutter.
    for (let i = 0; i < 18; i++) {
      out.push({ kind: i % 2 ? "barrel" : "crate", x: 62 + (i % 6) * 5, z: 42 + Math.floor(i / 6) * 6, r: 0 });
    }
    // Beach vending/posters.
    out.push({ kind: "vending", x: -82, z: 12, r: Math.PI / 2 });
    out.push({ kind: "vending", x: 35, z: 23, r: 0 });
    return out.slice(0, Math.floor(out.length * density));
  }, [density]);

  return (
    <>
      {props.map((p, i) => (
        <RetroProp key={`${p.kind}-${i}`} {...p} />
      ))}
      <Fences />
    </>
  );
}

function RetroProp({ kind, x, z, r }: { kind: string; x: number; z: number; r: number }) {
  switch (kind) {
    case "lamp":
      return (
        <group position={[x, 0, z]}>
          <mesh position={[0, 2.4, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 4.8, 6]} />
            <meshStandardMaterial color="#1d2230" metalness={0.6} roughness={0.45} />
          </mesh>
          <mesh position={[0.45, 4.75, 0]}>
            <boxGeometry args={[0.9, 0.15, 0.15]} />
            <meshStandardMaterial color="#1d2230" />
          </mesh>
          <mesh position={[0.9, 4.62, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#ffdca3" emissive="#ffdca3" emissiveIntensity={1.4} />
          </mesh>
          <pointLight color="#ffdca3" intensity={0.65} distance={13} />
        </group>
      );
    case "traffic":
      return (
        <group position={[x, 0, z]} rotation={[0, r, 0]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 3, 6]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh position={[0, 3.1, 0]}>
            <boxGeometry args={[0.45, 1.0, 0.35]} />
            <meshStandardMaterial color="#101010" />
          </mesh>
          {["#ff2d3a", "#ffd23f", "#1be7b6"].map((c, i) => (
            <mesh key={c} position={[0, 3.42 - i * 0.28, 0.2]}>
              <sphereGeometry args={[0.09, 8, 8]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={i === 2 ? 1.2 : 0.35} />
            </mesh>
          ))}
        </group>
      );
    case "hydrant":
      return (
        <group position={[x, 0, z]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 0.8, 8]} />
            <meshStandardMaterial color="#e83a2e" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <sphereGeometry args={[0.22, 8, 8]} />
            <meshStandardMaterial color="#e83a2e" />
          </mesh>
        </group>
      );
    case "dumpster":
      return (
        <group position={[x, 0, z]} rotation={[0, r, 0]}>
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[2.6, 1.3, 1.4]} />
            <primitive object={retroMaterial("rust", { tint: "#1d5c44", repeat: [2, 1] })} attach="material" />
          </mesh>
        </group>
      );
    case "bench":
      return (
        <group position={[x, 0, z]} rotation={[0, r, 0]}>
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[2.4, 0.18, 0.55]} />
            <primitive object={retroMaterial("dock", { tint: "#7b4d2b", repeat: [3, 1] })} attach="material" />
          </mesh>
          <mesh position={[0, 1.05, -0.25]}>
            <boxGeometry args={[2.4, 0.18, 0.22]} />
            <primitive object={retroMaterial("dock", { tint: "#7b4d2b", repeat: [3, 1] })} attach="material" />
          </mesh>
        </group>
      );
    case "phone":
      return (
        <group position={[x, 0, z]} rotation={[0, r, 0]}>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.9, 2.4, 0.75]} />
            <meshStandardMaterial color="#174863" emissive="#0a87b8" emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0, 2.3, 0.43]}>
            <boxGeometry args={[0.7, 0.28, 0.08]} />
            <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={0.8} />
          </mesh>
        </group>
      );
    case "vending":
      return (
        <group position={[x, 0, z]} rotation={[0, r, 0]}>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[1.2, 2.4, 0.9]} />
            <meshStandardMaterial color="#5d163d" emissive="#ff2d95" emissiveIntensity={0.12} />
          </mesh>
          <mesh position={[0, 1.35, 0.48]}>
            <boxGeometry args={[0.8, 1.2, 0.08]} />
            <meshStandardMaterial color="#22e3ff" emissive="#22e3ff" emissiveIntensity={0.6} />
          </mesh>
        </group>
      );
    case "barrel":
      return (
        <mesh position={[x, 0.55, z]}>
          <cylinderGeometry args={[0.45, 0.45, 1.1, 10]} />
          <primitive object={retroMaterial("rust", { tint: "#7d321e" })} attach="material" />
        </mesh>
      );
    case "crate":
      return (
        <mesh position={[x, 0.55, z]}>
          <boxGeometry args={[1.3, 1.1, 1.3]} />
          <primitive object={retroMaterial("dock", { tint: "#755030", repeat: [2, 2] })} attach="material" />
        </mesh>
      );
    case "cone":
    default:
      return (
        <mesh position={[x, 0.45, z]}>
          <coneGeometry args={[0.35, 0.9, 6]} />
          <meshStandardMaterial color="#ff7a00" />
        </mesh>
      );
  }
}

function Fences() {
  const runs = [
    { x: 74, z: 76, sx: 38, sz: 0.15 },
    { x: 96, z: 55, sx: 0.15, sz: 42 },
    { x: -96, z: 2, sx: 44, sz: 0.15 },
  ];
  return (
    <>
      {runs.map((r, i) => (
        <group key={i} position={[r.x, 0.7, r.z]}>
          <mesh>
            <boxGeometry args={[r.sx, 1.4, r.sz]} />
            <meshStandardMaterial color="#27313f" transparent opacity={0.72} wireframe />
          </mesh>
        </group>
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
