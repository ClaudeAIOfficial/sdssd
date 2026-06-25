import type { InventoryItem, Mission, Vehicle } from "@/lib/types";

export const cityLandmarks = [
  { id: "gas", name: "Volt Palm Gas", district: "Neon Beach", position: [-28, -22] as [number, number], kind: "Gas Station" },
  { id: "bank", name: "SolTrust Bank", district: "Downtown", position: [8, 10] as [number, number], kind: "Bank" },
  { id: "casino", name: "Mirage Byte Casino", district: "Casino Row", position: [28, 5] as [number, number], kind: "Casino" },
  { id: "beach", name: "Validator Beach", district: "Neon Beach", position: [-36, 24] as [number, number], kind: "Beach" },
  { id: "harbor", name: "Ledger Harbor", district: "Harbor", position: [34, -28] as [number, number], kind: "Harbor" },
  { id: "apartments", name: "Airdrop Apartments", district: "Downtown", position: [-8, 18] as [number, number], kind: "Safehouse" },
  { id: "police", name: "Civic Node PD", district: "Civic Center", position: [-28, 10] as [number, number], kind: "Police" },
  { id: "warehouse", name: "Cold Storage Warehouse", district: "Warehouse Ward", position: [4, -30] as [number, number], kind: "Warehouse" },
  { id: "park", name: "Lamport Park", district: "Civic Center", position: [18, 26] as [number, number], kind: "Park" },
] as const;

export const vehicleCatalog: Vehicle[] = [
  { id: "neon-raptor", name: "Neon Raptor", type: "sports", price: 4200, speed: 13, handling: 0.85, color: "#ff3dbd", owned: true },
  { id: "byte-bike", name: "Byte Bike", type: "motorcycle", price: 2600, speed: 15, handling: 1.15, color: "#38bdf8", owned: false },
  { id: "parcel-van", name: "Parcel Van", type: "van", price: 3100, speed: 9, handling: 0.65, color: "#facc15", owned: false },
  { id: "harbor-hauler", name: "Harbor Hauler", type: "truck", price: 5200, speed: 8, handling: 0.55, color: "#22c55e", owned: false },
  { id: "volt-runner", name: "Volt Runner", type: "electric", price: 6400, speed: 12, handling: 1, color: "#a78bfa", owned: false },
];

export const starterInventory: InventoryItem[] = [
  { id: "phone", name: "Encrypted Phone", category: "tool", description: "Open with P to manage map, missions, wallet, and contacts.", quantity: 1 },
  { id: "backpack", name: "Courier Backpack", category: "tool", description: "Carries packages, food, keys, and mission loot.", quantity: 1 },
  { id: "crypto-wallet", name: "Cold Crypto Wallet", category: "tool", description: "Stores verified SOL reward claims safely off the client.", quantity: 1 },
  { id: "keys", name: "Garage Keys", category: "key", description: "Access your safehouse garage and owned vehicles.", quantity: 1 },
  { id: "snacks", name: "Neon Noodles", category: "consumable", description: "Restores stamina during long jobs.", quantity: 3 },
];

const missionTemplates = [
  {
    type: "delivery",
    title: "Neon Drop",
    briefing: "A beach vendor needs a sealed validator modem delivered before sunset.",
    objective: "Drive from Volt Palm Gas to Airdrop Apartments.",
    district: "Neon Beach",
    start: [-28, -22] as [number, number],
    target: [-8, 18] as [number, number],
    minSeconds: 14,
    maxSeconds: 150,
    requiredDistance: 34,
    rewards: { cash: 450, sol: 0.004, xp: 80, reputation: 12 },
    solEligible: true,
  },
  {
    type: "taxi",
    title: "Founder Fare",
    briefing: "A builder leaving the casino needs a clean ride to the harbor launch.",
    objective: "Pick up the founder at Mirage Byte Casino and reach Ledger Harbor.",
    district: "Casino Row",
    start: [28, 5] as [number, number],
    target: [34, -28] as [number, number],
    minSeconds: 12,
    maxSeconds: 130,
    requiredDistance: 28,
    rewards: { cash: 380, sol: 0, xp: 70, reputation: 10 },
    solEligible: false,
  },
  {
    type: "race",
    title: "Seafront Sprint",
    briefing: "Race a street crew across the palm-lined loop without clipping traffic.",
    objective: "Start at Validator Beach and finish at Lamport Park.",
    district: "Neon Beach",
    start: [-36, 24] as [number, number],
    target: [18, 26] as [number, number],
    minSeconds: 10,
    maxSeconds: 95,
    requiredDistance: 48,
    rewards: { cash: 720, sol: 0.003, xp: 110, reputation: 18 },
    solEligible: true,
  },
  {
    type: "collect",
    title: "Hidden Wallet Sweep",
    briefing: "Lost hardware wallets are pinging around the park after a drone show.",
    objective: "Collect three wallets around Lamport Park.",
    district: "Civic Center",
    start: [18, 26] as [number, number],
    target: [23, 18] as [number, number],
    minSeconds: 18,
    maxSeconds: 180,
    requiredDistance: 24,
    rewards: { cash: 520, sol: 0.002, xp: 90, reputation: 16 },
    solEligible: true,
  },
  {
    type: "defeat",
    title: "Warehouse Firewall",
    briefing: "A rogue bot crew is shaking down couriers near cold storage.",
    objective: "Confront the crew and return the encrypted crate.",
    district: "Warehouse Ward",
    start: [4, -30] as [number, number],
    target: [12, -18] as [number, number],
    minSeconds: 16,
    maxSeconds: 170,
    requiredDistance: 22,
    rewards: { cash: 850, sol: 0.005, xp: 135, reputation: 22 },
    solEligible: true,
  },
  {
    type: "protect",
    title: "Bodyguard Block",
    briefing: "Protect an NPC auditor walking from the bank to Civic Node PD.",
    objective: "Escort the auditor without triggering more than two collisions.",
    district: "Downtown",
    start: [8, 10] as [number, number],
    target: [-28, 10] as [number, number],
    minSeconds: 20,
    maxSeconds: 190,
    requiredDistance: 34,
    rewards: { cash: 680, sol: 0.003, xp: 120, reputation: 20 },
    solEligible: true,
  },
  {
    type: "heist",
    title: "Package Reversal",
    briefing: "Intercept a stolen package before the thieves get it offshore.",
    objective: "Recover the package near SolTrust Bank and escape to Cold Storage.",
    district: "Downtown",
    start: [8, 10] as [number, number],
    target: [4, -30] as [number, number],
    minSeconds: 18,
    maxSeconds: 160,
    requiredDistance: 40,
    rewards: { cash: 920, sol: 0.004, xp: 145, reputation: 24 },
    solEligible: true,
  },
  {
    type: "recover",
    title: "Lost Ledger",
    briefing: "A developer dropped a signing device between the apartments and beach.",
    objective: "Search the beach marker and return the device to the safehouse.",
    district: "Neon Beach",
    start: [-8, 18] as [number, number],
    target: [-36, 24] as [number, number],
    minSeconds: 12,
    maxSeconds: 120,
    requiredDistance: 24,
    rewards: { cash: 400, sol: 0.0015, xp: 75, reputation: 11 },
    solEligible: true,
  },
] satisfies Omit<Mission, "id" | "status">[];

export function generateMissions(seed = Date.now()): Mission[] {
  return missionTemplates.map((mission, index) => {
    const variance = ((seed + index * 7919) % 9) - 4;
    return {
      ...mission,
      id: `${mission.type}-${seed.toString(36)}-${index}`,
      rewards: {
        cash: mission.rewards.cash + variance * 15,
        xp: mission.rewards.xp + variance * 2,
        reputation: mission.rewards.reputation + Math.max(0, variance),
        sol: mission.rewards.sol,
      },
      status: "available",
    };
  });
}

export const defaultCharacter = {
  hair: "Solar Fade",
  clothes: "Mint Bomber",
  shoes: "Chrome Runners",
  skinTone: "#b77955",
};

export const customizationOptions = {
  hair: ["Solar Fade", "Neon Curls", "Palm Buzz", "Midnight Waves"],
  clothes: ["Mint Bomber", "Coral Hoodie", "Validator Vest", "Harbor Jacket"],
  shoes: ["Chrome Runners", "Beach Hi-Tops", "Courier Boots", "Volt Sneakers"],
  skinTone: ["#8d5524", "#b77955", "#d6a77a", "#f1c27d", "#f5d0b5", "#5c3a2e"],
};
