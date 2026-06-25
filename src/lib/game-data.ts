import type {
  AdminEconomy,
  InventoryItem,
  LeaderboardRow,
  Mission,
  PlayerCosmetics,
  PlayerProfile,
  Vehicle
} from "@/lib/types";

export const defaultCosmetics: PlayerCosmetics = {
  hair: "#161223",
  clothes: "#14f195",
  shoes: "#ffffff",
  skinTone: "#b87850"
};

export const starterInventory: InventoryItem[] = [
  { id: "phone", name: "Neon Phone", type: "tool", quantity: 1 },
  { id: "backpack", name: "Street Backpack", type: "tool", quantity: 1 },
  { id: "crypto-wallet", name: "Hardware Wallet", type: "wallet", quantity: 1 },
  { id: "keys", name: "Garage Keys", type: "key", quantity: 1 },
  { id: "snack", name: "Mango Energy Bar", type: "food", quantity: 2 }
];

export const vehicles: Vehicle[] = [
  { id: "sports", name: "Solaris Sprint", speed: 1.9, handling: 1.55, price: 6000, color: "#ff4fd8" },
  { id: "motorcycle", name: "Palm Runner", speed: 2.1, handling: 1.85, price: 3500, color: "#2de2e6" },
  { id: "van", name: "Harbor Van", speed: 1.25, handling: 1.05, price: 2600, color: "#ffd166" },
  { id: "truck", name: "Dock Titan", speed: 1.05, handling: 0.9, price: 4800, color: "#f97316" },
  { id: "electric", name: "Volt Coupe", speed: 1.7, handling: 1.65, price: 5200, color: "#14f195" }
];

export const cityLandmarks = [
  { name: "Gas Station", district: "Neon Beach", position: [-18, -11], color: "#ffb000" },
  { name: "Sol Bank", district: "Financial", position: [10, 9], color: "#14f195" },
  { name: "Casino", district: "Casino Strip", position: [18, -6], color: "#ff4fd8" },
  { name: "Beach", district: "Neon Beach", position: [-24, -18], color: "#2de2e6" },
  { name: "Harbor", district: "Harbor", position: [24, -18], color: "#00c2ff" },
  { name: "Apartments", district: "Civic", position: [-6, 17], color: "#9945ff" },
  { name: "Police Station", district: "Civic", position: [18, 16], color: "#4f8cff" },
  { name: "Warehouse", district: "Old Warehouse", position: [25, 3], color: "#94a3b8" },
  { name: "Palm Park", district: "Palm Park", position: [-19, 11], color: "#a3ff12" },
  { name: "Garage", district: "Financial", position: [3, -15], color: "#f97316" }
] as const;

export const missionTemplates: Mission[] = [
  {
    id: "mission-delivery-harbor",
    title: "Harbor Handshake",
    kind: "delivery",
    district: "Harbor",
    description: "Move an encrypted package from the apartments to the harbor broker.",
    target: [24, -18],
    distanceRequired: 54,
    minDurationSeconds: 22,
    rewards: { cash: 450, sol: 0, xp: 90, reputation: 12 },
    solRewardEligible: false
  },
  {
    id: "mission-taxi-strip",
    title: "Neon Taxi Run",
    kind: "taxi",
    district: "Casino Strip",
    description: "Pick up a synthwave DJ and get them to the casino before the show.",
    target: [18, -6],
    distanceRequired: 45,
    minDurationSeconds: 18,
    rewards: { cash: 520, sol: 0, xp: 80, reputation: 10 },
    solRewardEligible: false
  },
  {
    id: "mission-race-beach",
    title: "Palm Circuit",
    kind: "race",
    district: "Neon Beach",
    description: "Hit the coastal checkpoints with clean driving and no shortcuts.",
    target: [-24, -18],
    distanceRequired: 72,
    minDurationSeconds: 28,
    rewards: { cash: 900, sol: 0.002, xp: 150, reputation: 24 },
    solRewardEligible: true
  },
  {
    id: "mission-wallet-park",
    title: "Lost Hardware Wallet",
    kind: "recovery",
    district: "Palm Park",
    description: "Search Palm Park for a misplaced hardware wallet before scavengers find it.",
    target: [-19, 11],
    distanceRequired: 36,
    minDurationSeconds: 16,
    rewards: { cash: 380, sol: 0.001, xp: 70, reputation: 14 },
    solRewardEligible: true
  },
  {
    id: "mission-collect-keys",
    title: "Hidden Seed Phrases",
    kind: "collect",
    district: "Financial",
    description: "Collect four paper wallet fragments around the bank district.",
    target: [10, 9],
    distanceRequired: 50,
    minDurationSeconds: 24,
    rewards: { cash: 650, sol: 0, xp: 130, reputation: 18 },
    solRewardEligible: false
  },
  {
    id: "mission-escort-civic",
    title: "Validator Escort",
    kind: "escort",
    district: "Civic",
    description: "Protect a validator engineer while they reaches the police station.",
    target: [18, 16],
    distanceRequired: 48,
    minDurationSeconds: 25,
    rewards: { cash: 780, sol: 0.0015, xp: 140, reputation: 20 },
    solRewardEligible: true
  },
  {
    id: "mission-heist-warehouse",
    title: "Warehouse Intercept",
    kind: "heist",
    district: "Old Warehouse",
    description: "Steal a package from a rival crew and drop it at the garage.",
    target: [3, -15],
    distanceRequired: 66,
    minDurationSeconds: 30,
    rewards: { cash: 1100, sol: 0, xp: 180, reputation: 30 },
    solRewardEligible: false
  },
  {
    id: "mission-combat-bank",
    title: "Bank Blockade",
    kind: "combat",
    district: "Financial",
    description: "Defeat the NPC gang blocking the Sol Bank service entrance.",
    target: [10, 9],
    distanceRequired: 28,
    minDurationSeconds: 14,
    rewards: { cash: 720, sol: 0.0025, xp: 160, reputation: 26 },
    solRewardEligible: true
  }
];

export const defaultEconomy: AdminEconomy = {
  cashMultiplier: 1,
  xpMultiplier: 1,
  solBudget: 0.2,
  activeEvent: "Launch Week Neon Drops"
};

export function createLocalPlayer(walletAddress?: string): PlayerProfile {
  const suffix = walletAddress ? walletAddress.slice(0, 4).toUpperCase() : Math.random().toString(36).slice(2, 6).toUpperCase();

  return {
    id: walletAddress ?? `guest-${suffix.toLowerCase()}`,
    handle: `Runner-${suffix}`,
    walletAddress,
    cosmetics: defaultCosmetics,
    ledger: { cash: 1250, sol: 0, xp: 0, reputation: 0 },
    ownedVehicles: ["electric"],
    inventory: starterInventory,
    completedMissions: [],
    wantedStars: 0,
    banned: false
  };
}

export const seedLeaderboard: LeaderboardRow[] = [
  { id: "runner-1", handle: "NovaDock", reputation: 420, cash: 12800, solEarned: 0.024, missions: 28 },
  { id: "runner-2", handle: "PalmByte", reputation: 370, cash: 10300, solEarned: 0.018, missions: 24 },
  { id: "runner-3", handle: "NeonLedger", reputation: 355, cash: 9800, solEarned: 0.016, missions: 21 },
  { id: "runner-4", handle: "HarborHash", reputation: 290, cash: 7600, solEarned: 0.011, missions: 18 }
];

export function nextMission(completed: string[]): Mission {
  return missionTemplates.find((mission) => !completed.includes(mission.id)) ?? missionTemplates[completed.length % missionTemplates.length];
}
