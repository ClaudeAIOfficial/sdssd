import { WORLD } from "@/lib/constants";
import { LANDMARKS } from "@/lib/cityData";

export interface BuildingBox {
  x: number;
  z: number;
  w: number; // size along x
  d: number; // size along z
  h: number; // height
  color: string;
  /** Landmark id if this box is a special building. */
  landmark?: string;
  roof: string;
}

const PALETTE = [
  "#2a1b4a",
  "#1f2a55",
  "#3a1f55",
  "#142447",
  "#34234f",
  "#1c2f4a",
];
const ROOFS = ["#ff2d95", "#22e3ff", "#ffd23f", "#1be7b6", "#d916ff", "#ff7a00"];

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/**
 * Generates a deterministic grid city: roads on a regular grid, buildings filling
 * each block, and the named landmarks placed at their fixed positions.
 */
export function buildCity(): BuildingBox[] {
  const rng = seeded(20260625);
  const boxes: BuildingBox[] = [];
  const { half, blockSize } = WORLD;
  const margin = 4.5; // gap from road for sidewalk

  // Place landmarks first and remember their occupied blocks.
  const occupied = new Set<string>();
  for (const lm of LANDMARKS) {
    const gx = Math.round(lm.pos.x / blockSize);
    const gz = Math.round(lm.pos.z / blockSize);
    occupied.add(`${gx}:${gz}`);
    const isOpen = ["beach", "harbor", "park"].includes(lm.id);
    boxes.push({
      x: gx * blockSize,
      z: gz * blockSize,
      w: isOpen ? 22 : 18,
      d: isOpen ? 22 : 18,
      h: isOpen ? 1 : lm.id === "apartments" ? 34 : 16,
      color: lm.color,
      roof: lm.color,
      landmark: lm.id,
    });
  }

  const blocks = Math.floor(half / blockSize);
  for (let gx = -blocks; gx <= blocks; gx++) {
    for (let gz = -blocks; gz <= blocks; gz++) {
      const key = `${gx}:${gz}`;
      if (occupied.has(key)) continue;
      // Leave the central block open as a plaza near spawn.
      if (gx === 0 && gz === 0) continue;

      const cx = gx * blockSize;
      const cz = gz * blockSize;
      // 1-2 buildings per block for variety.
      const count = rng() > 0.6 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const w = 8 + rng() * (blockSize - 2 * margin - 8);
        const d = 8 + rng() * (blockSize - 2 * margin - 8);
        const offX = count === 1 ? 0 : (i === 0 ? -1 : 1) * (blockSize / 5);
        const offZ = count === 1 ? 0 : (rng() - 0.5) * 6;
        const h = 8 + rng() * 38;
        boxes.push({
          x: cx + offX,
          z: cz + offZ,
          w,
          d,
          h,
          color: PALETTE[Math.floor(rng() * PALETTE.length)],
          roof: ROOFS[Math.floor(rng() * ROOFS.length)],
        });
      }
    }
  }

  return boxes;
}

/** Returns true if the point sits on a road (used for traffic + spawning). */
export function isOnRoad(x: number, z: number): boolean {
  const { blockSize, roadWidth } = WORLD;
  const mx = Math.abs(((x % blockSize) + blockSize) % blockSize);
  const mz = Math.abs(((z % blockSize) + blockSize) % blockSize);
  const half = roadWidth / 2;
  return (
    mx < half ||
    mx > blockSize - half ||
    mz < half ||
    mz > blockSize - half
  );
}

/** Snap a coordinate to the nearest road centre line. */
export function nearestRoadLine(v: number): number {
  const { blockSize } = WORLD;
  return Math.round(v / blockSize) * blockSize;
}
