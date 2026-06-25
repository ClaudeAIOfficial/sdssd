export type District =
  | "Downtown"
  | "Neon Beach"
  | "Harbor"
  | "Casino Row"
  | "Warehouse Ward"
  | "Civic Center";

export type Currency = {
  cash: number;
  sol: number;
  xp: number;
  reputation: number;
};

export type CharacterLoadout = {
  hair: string;
  clothes: string;
  shoes: string;
  skinTone: string;
};

export type VehicleType = "sports" | "motorcycle" | "van" | "truck" | "electric";

export type Vehicle = {
  id: string;
  name: string;
  type: VehicleType;
  price: number;
  speed: number;
  handling: number;
  color: string;
  owned: boolean;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: "tool" | "mission" | "consumable" | "key";
  description: string;
  quantity: number;
};

export type MissionType =
  | "delivery"
  | "taxi"
  | "race"
  | "collect"
  | "defeat"
  | "protect"
  | "heist"
  | "recover";

export type MissionStatus = "available" | "active" | "completed" | "failed";

export type Mission = {
  id: string;
  title: string;
  type: MissionType;
  district: District;
  briefing: string;
  objective: string;
  start: [number, number];
  target: [number, number];
  minSeconds: number;
  maxSeconds: number;
  requiredDistance: number;
  rewards: Currency;
  solEligible: boolean;
  status: MissionStatus;
};

export type ActiveMission = Mission & {
  acceptedAt: number;
  distanceTravelled: number;
};

export type Player = {
  id: string;
  walletAddress: string;
  handle: string;
  createdAt: string;
  currencies: Currency;
  character: CharacterLoadout;
  inventory: InventoryItem[];
  vehicles: Vehicle[];
  wantedStars: number;
  banned: boolean;
  missionsCompleted: number;
};

export type RewardRecord = {
  id: string;
  playerId: string;
  missionId: string;
  cash: number;
  xp: number;
  reputation: number;
  sol: number;
  status: "pending" | "approved" | "paid" | "rejected";
  createdAt: string;
};

export type MissionTelemetry = {
  missionId: string;
  walletAddress: string;
  elapsedSeconds: number;
  distanceTravelled: number;
  start: [number, number];
  finish: [number, number];
  maxSpeed: number;
  collisions: number;
};

export type LeaderboardEntry = {
  id: string;
  handle: string;
  walletAddress: string;
  reputation: number;
  cash: number;
  solEarned: number;
  missionsCompleted: number;
};

export type AdminLog = {
  id: string;
  actor: string;
  action: string;
  details: string;
  createdAt: string;
};
