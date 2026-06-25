export type CurrencyLedger = {
  cash: number;
  sol: number;
  xp: number;
  reputation: number;
};

export type PlayerCosmetics = {
  hair: string;
  clothes: string;
  shoes: string;
  skinTone: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  type: "tool" | "mission" | "food" | "key" | "wallet";
  quantity: number;
};

export type VehicleKind = "sports" | "motorcycle" | "van" | "truck" | "electric";

export type Vehicle = {
  id: VehicleKind;
  name: string;
  speed: number;
  handling: number;
  price: number;
  color: string;
};

export type District =
  | "Neon Beach"
  | "Harbor"
  | "Financial"
  | "Old Warehouse"
  | "Palm Park"
  | "Casino Strip"
  | "Civic";

export type MissionKind =
  | "delivery"
  | "taxi"
  | "race"
  | "collect"
  | "combat"
  | "escort"
  | "heist"
  | "recovery";

export type Mission = {
  id: string;
  title: string;
  kind: MissionKind;
  district: District;
  description: string;
  target: [number, number];
  distanceRequired: number;
  minDurationSeconds: number;
  rewards: CurrencyLedger;
  solRewardEligible: boolean;
};

export type MissionAttempt = {
  missionId: string;
  startedAt: number;
  completedAt: number;
  distanceTravelled: number;
  maxSpeed: number;
  walletAddress?: string;
  playerPosition: [number, number];
};

export type VerificationResult = {
  ok: boolean;
  reason?: string;
  rewards?: CurrencyLedger;
  mission?: Mission;
  claimId?: string;
};

export type PlayerProfile = {
  id: string;
  handle: string;
  walletAddress?: string;
  cosmetics: PlayerCosmetics;
  ledger: CurrencyLedger;
  ownedVehicles: VehicleKind[];
  inventory: InventoryItem[];
  completedMissions: string[];
  wantedStars: number;
  banned: boolean;
};

export type LeaderboardRow = {
  id: string;
  handle: string;
  reputation: number;
  cash: number;
  solEarned: number;
  missions: number;
};

export type AdminEconomy = {
  cashMultiplier: number;
  xpMultiplier: number;
  solBudget: number;
  activeEvent: string;
};
