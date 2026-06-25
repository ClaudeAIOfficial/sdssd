import type { Vec2 } from "./types";

export type LandmarkKind =
  | "gas"
  | "bank"
  | "casino"
  | "beach"
  | "harbor"
  | "apartments"
  | "police"
  | "warehouse"
  | "park"
  | "garage"
  | "safehouse";

export interface Landmark {
  id: LandmarkKind;
  name: string;
  pos: Vec2;
  color: string;
  /** Short blurb shown when the player enters. */
  blurb: string;
  /** Icon used on the minimap / phone map. */
  icon: string;
  enterable: boolean;
}

// Hand-placed landmarks for a coherent, readable city layout.
// Coordinates are in world units; the city spans roughly -120..120.
export const LANDMARKS: Landmark[] = [
  {
    id: "bank",
    name: "Solana Reserve Bank",
    pos: { x: -45, z: -45 },
    color: "#22e3ff",
    blurb: "Deposit cash, take loans and check your net worth.",
    icon: "🏦",
    enterable: true,
  },
  {
    id: "casino",
    name: "Neon Royale Casino",
    pos: { x: 48, z: -42 },
    color: "#ffd23f",
    blurb: "High roller tables. Double or nothing — house edge included.",
    icon: "🎰",
    enterable: true,
  },
  {
    id: "police",
    name: "GTS Metro PD",
    pos: { x: -10, z: 60 },
    color: "#3b82f6",
    blurb: "Local precinct. Best admired from a distance.",
    icon: "🚓",
    enterable: false,
  },
  {
    id: "gas",
    name: "PumpFuel Station",
    pos: { x: 30, z: 30 },
    color: "#ff7a00",
    blurb: "Top up your ride. Snacks restore a little energy.",
    icon: "⛽",
    enterable: true,
  },
  {
    id: "warehouse",
    name: "Harbor Warehouse 7",
    pos: { x: 75, z: 55 },
    color: "#8b5cf6",
    blurb: "Shady logistics hub. Plenty of jobs, fewer questions.",
    icon: "📦",
    enterable: true,
  },
  {
    id: "harbor",
    name: "Sunset Harbor",
    pos: { x: 90, z: -15 },
    color: "#1be7b6",
    blurb: "Docks, yachts and salty air.",
    icon: "⚓",
    enterable: false,
  },
  {
    id: "beach",
    name: "Vice Beach",
    pos: { x: -90, z: 30 },
    color: "#ff9ecb",
    blurb: "Palm trees and pastel sunsets.",
    icon: "🏖️",
    enterable: false,
  },
  {
    id: "apartments",
    name: "Palm Heights Apartments",
    pos: { x: -55, z: 15 },
    color: "#d916ff",
    blurb: "Residential towers. Buy a unit to set your spawn point.",
    icon: "🏢",
    enterable: true,
  },
  {
    id: "park",
    name: "Bayfront Park",
    pos: { x: 5, z: -10 },
    color: "#1be7b6",
    blurb: "Green space in the heart of the grid.",
    icon: "🌴",
    enterable: false,
  },
  {
    id: "garage",
    name: "Volt Garage",
    pos: { x: 40, z: 8 },
    color: "#22e3ff",
    blurb: "Buy and store vehicles.",
    icon: "🔧",
    enterable: true,
  },
  {
    id: "safehouse",
    name: "Your Safehouse",
    pos: { x: -20, z: -8 },
    color: "#ffd23f",
    blurb: "Home base. Save progress and change your look.",
    icon: "🏠",
    enterable: true,
  },
];

export function getLandmark(id: LandmarkKind): Landmark | undefined {
  return LANDMARKS.find((l) => l.id === id);
}
