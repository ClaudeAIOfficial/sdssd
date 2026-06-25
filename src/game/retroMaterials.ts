"use client";

import * as THREE from "three";

export type RetroTextureKind =
  | "brick"
  | "concrete"
  | "asphalt"
  | "sidewalk"
  | "glass"
  | "metal"
  | "sand"
  | "dock"
  | "rust"
  | "cloth"
  | "roof";

const textureCache = new Map<string, THREE.CanvasTexture>();
const materialCache = new Map<string, THREE.MeshStandardMaterial>();

/**
 * Procedural retro texture system.
 *
 * The game deliberately avoids external asset packs. Instead we generate tiny
 * 32-128px canvas textures, turn off smoothing and use nearest filtering. The
 * result reads like late-PS1/early-PS2 urban grime while remaining cheap enough
 * for browser rendering and reusable across many instanced meshes.
 */
export function retroTexture(kind: RetroTextureKind, tint = "#ffffff"): THREE.CanvasTexture {
  const key = `${kind}:${tint}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const size = kind === "asphalt" || kind === "sidewalk" ? 128 : 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.imageSmoothingEnabled = false;

  drawTexture(ctx, size, kind, tint);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestMipmapNearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export function retroMaterial(
  kind: RetroTextureKind,
  options: {
    tint?: string;
    repeat?: [number, number];
    emissive?: string;
    emissiveIntensity?: number;
    roughness?: number;
    metalness?: number;
    transparent?: boolean;
    opacity?: number;
    vertexColors?: boolean;
  } = {},
): THREE.MeshStandardMaterial {
  const {
    tint = "#ffffff",
    repeat = [1, 1],
    emissive = "#000000",
    emissiveIntensity = 0,
    roughness = 0.85,
    metalness = 0.05,
    transparent = false,
    opacity = 1,
    vertexColors = false,
  } = options;
  const key = `${kind}:${tint}:${repeat.join(",")}:${emissive}:${emissiveIntensity}:${roughness}:${metalness}:${transparent}:${opacity}:${vertexColors}`;
  const cached = materialCache.get(key);
  if (cached) return cached;

  const map = retroTexture(kind, tint).clone();
  map.repeat.set(repeat[0], repeat[1]);
  map.needsUpdate = true;

  const mat = new THREE.MeshStandardMaterial({
    color: tint,
    map,
    emissive,
    emissiveIntensity,
    roughness,
    metalness,
    transparent,
    opacity,
    vertexColors,
  });
  materialCache.set(key, mat);
  return mat;
}

export function signTexture(
  label: string,
  palette: { bg: string; fg: string; accent?: string } = { bg: "#110018", fg: "#22e3ff", accent: "#ff2d95" },
): THREE.CanvasTexture {
  const key = `sign:${label}:${palette.bg}:${palette.fg}:${palette.accent}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = palette.accent ?? palette.fg;
  for (let x = 0; x < canvas.width; x += 16) {
    ctx.fillRect(x, 0, 8, 4);
    ctx.fillRect(x + 4, canvas.height - 4, 8, 4);
  }
  ctx.strokeStyle = palette.accent ?? palette.fg;
  ctx.lineWidth = 5;
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
  ctx.fillStyle = palette.fg;
  ctx.font = "bold 26px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  wrapText(ctx, label.toUpperCase(), canvas.width / 2, canvas.height / 2, 220, 26);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestMipmapNearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

function drawTexture(
  ctx: CanvasRenderingContext2D,
  size: number,
  kind: RetroTextureKind,
  tint: string,
) {
  const rnd = seeded(`${kind}:${tint}`);
  const base = new THREE.Color(tint);
  const fill = (color: THREE.Color, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `#${color.getHexString()}`;
    ctx.fillRect(0, 0, size, size);
    ctx.globalAlpha = 1;
  };
  fill(base);

  if (kind === "brick") {
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 2;
    const brickH = 10;
    const brickW = 22;
    for (let y = 0; y < size; y += brickH) {
      const off = (y / brickH) % 2 === 0 ? 0 : brickW / 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
      for (let x = -off; x < size; x += brickW) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + brickH);
        ctx.stroke();
      }
    }
  }

  if (kind === "concrete" || kind === "asphalt" || kind === "sidewalk") {
    for (let i = 0; i < size * 3; i++) {
      const shade = rnd() > 0.5 ? 1.2 : 0.65;
      const c = base.clone().multiplyScalar(shade);
      ctx.fillStyle = `#${c.getHexString()}`;
      ctx.fillRect(Math.floor(rnd() * size), Math.floor(rnd() * size), 1 + Math.floor(rnd() * 3), 1);
    }
    if (kind === "sidewalk") {
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      for (let i = 0; i < size; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
        ctx.stroke();
      }
    }
  }

  if (kind === "glass") {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#061827");
    grad.addColorStop(0.45, tint);
    grad.addColorStop(1, "#c9f7ff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(6, 6, size / 2, 4);
    ctx.fillRect(10, 18, size / 3, 3);
  }

  if (kind === "metal") {
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 2;
    for (let y = 4; y < size; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  }

  if (kind === "sand") {
    for (let i = 0; i < 180; i++) {
      ctx.fillStyle = rnd() > 0.5 ? "#f5dfa9" : "#b88f55";
      ctx.fillRect(rnd() * size, rnd() * size, 1, 1);
    }
  }

  if (kind === "dock") {
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 3;
    for (let x = 0; x < size; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 4, size);
      ctx.stroke();
    }
  }

  if (kind === "rust") {
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = rnd() > 0.45 ? "#8f3f1f" : "#24130c";
      ctx.fillRect(rnd() * size, rnd() * size, 2 + rnd() * 6, 1 + rnd() * 4);
    }
  }

  if (kind === "cloth") {
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    for (let i = 0; i < size; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }
  }

  if (kind === "roof") {
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 2;
    for (let y = 0; y < size; y += 9) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y + 5);
      ctx.stroke();
    }
  }

  // Shared pixel dirt/specular breakup pass.
  for (let i = 0; i < size * 0.8; i++) {
    ctx.globalAlpha = 0.08 + rnd() * 0.18;
    ctx.fillStyle = rnd() > 0.5 ? "#000000" : "#ffffff";
    const n = 1 + Math.floor(rnd() * 3);
    ctx.fillRect(Math.floor(rnd() * size), Math.floor(rnd() * size), n, n);
  }
  ctx.globalAlpha = 1;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  lines.push(line);
  const top = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, top + i * lineHeight));
}

function seeded(seedText: string) {
  let seed = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    seed ^= seedText.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  return () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
