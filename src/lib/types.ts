export type Vec2 = {
  x: number;
  z: number;
};

export type VehicleType =
  | "sports_car"
  | "motorcycle"
  | "van"
  | "truck"
  | "electric_car";

export type MissionType =
  | "deliver_package"
  | "taxi_run"
  | "street_race"
  | "collect_wallets"
  | "defeat_gang"
  | "protect_npc"
  | "steal_package"
  | "find_hardware_wallet";

export type PoiType =
  | "gas_station"
  | "bank"
  | "casino"
  | "beach"
  | "harbor"
  | "apartments"
  | "police_station"
  | "warehouse"
  | "park"
  | "garage"
  | "safehouse";

export type PlayerCustomization = {
  hair: "buzz" | "curly" | "mohawk" | "ponytail";
  clothes: "street" | "formal" | "racer" | "beach";
  shoes: "sneakers" | "boots" | "sandals";
  skinTone: "light" | "tan" | "brown" | "dark";
};

export type InventoryItem =
  | "phone"
  | "backpack"
  | "crypto_wallet"
  | "keys"
  | "mission_item"
  | "food";

export type PlayerStats = {
  cash: number;
  sol: number;
  xp: number;
  reputation: number;
  wantedLevel: 0 | 1 | 2 | 3 | 4 | 5;
};

export type MissionDefinition = {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  pickup: Vec2;
  dropoff: Vec2;
  targetPoi: PoiType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  expectedSeconds: number;
};

export type ActiveMission = MissionDefinition & {
  acceptedAt: number;
  acceptedPosition: Vec2;
  distanceTravelled: number;
};

export type MissionReward = {
  cash: number;
  xp: number;
  reputation: number;
  sol: number;
  verified: boolean;
  rewardId?: string;
};

export type VehicleState = {
  id: string;
  type: VehicleType;
  position: Vec2;
  heading: number;
  speed: number;
  playerOwned: boolean;
  occupiedByPlayer: boolean;
};

export type NpcRole = "civilian" | "police" | "gang" | "mission_giver";

export type NpcState = {
  id: string;
  role: NpcRole;
  name: string;
  position: Vec2;
  heading: number;
  mood: "neutral" | "scared" | "angry" | "friendly";
  dialogue: string;
};

export type MissionReport = {
  missionId: string;
  missionType: MissionType;
  walletAddress?: string;
  startedAt: number;
  completedAt: number;
  elapsedSeconds: number;
  distanceTravelled: number;
  startPosition: Vec2;
  endPosition: Vec2;
  wantedLevelDuringMission: number;
};

export type LeaderboardEntry = {
  walletAddress: string;
  reputation: number;
  cash: number;
  solEarned: number;
  missionsCompleted: number;
};

export type AdminLog = {
  id: string;
  action:
    | "create_mission"
    | "approve_reward"
    | "ban_player"
    | "spawn_event"
    | "change_economy";
  createdAt: string;
  actor: string;
  payload: Record<string, unknown>;
};

