export interface Player {
  id: string;
  wallet_address: string;
  username: string;
  cash: number;
  sol_earned: number;
  xp: number;
  reputation: number;
  level: number;
  skin_tone: string;
  hair_style: string;
  clothes_style: string;
  shoes_style: string;
  created_at: string;
  updated_at: string;
}

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cash_reward: number;
  xp_reward: number;
  reputation_reward: number;
  sol_reward: number;
  time_limit: number; // seconds
  location: { x: number; y: number; z: number };
  is_active: boolean;
}

export type MissionType =
  | 'delivery'
  | 'taxi'
  | 'race'
  | 'collect_wallets'
  | 'defeat_gang'
  | 'protect_npc'
  | 'steal_package'
  | 'find_hardware_wallet';

export interface MissionCompletion {
  mission_id: string;
  player_id: string;
  start_time: number;
  end_time: number;
  distance_traveled: number;
  completed: boolean;
}

export interface Vehicle {
  id: string;
  type: 'sports' | 'motorcycle' | 'van' | 'truck' | 'electric';
  name: string;
  color: string;
  position: [number, number, number];
  speed: number;
  price: number;
}

export interface NPC {
  id: string;
  type: 'civilian' | 'gang' | 'police' | 'mission_giver';
  position: [number, number, number];
  rotation: number;
  behavior: 'idle' | 'walking' | 'driving' | 'chasing' | 'fleeing';
  mission?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'phone' | 'backpack' | 'crypto_wallet' | 'keys' | 'mission_item' | 'food';
  quantity: number;
}

export interface GameState {
  player: PlayerState;
  missions: Mission[];
  activeMission: Mission | null;
  vehicles: Vehicle[];
  npcs: NPC[];
  wantedLevel: number;
  timeOfDay: number;
  isPhoneOpen: boolean;
  currentVehicle: string | null;
  inventory: InventoryItem[];
}

export interface PlayerState {
  id: string;
  position: [number, number, number];
  rotation: number;
  velocity: [number, number, number];
  isRunning: boolean;
  isDriving: boolean;
  health: number;
  cash: number;
  xp: number;
  reputation: number;
  sol_earned: number;
  level: number;
  skin_tone: string;
  hair_style: string;
  clothes_style: string;
  shoes_style: string;
  wallet_address: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  wallet_address: string;
  reputation: number;
  cash: number;
  sol_earned: number;
  missions_completed: number;
  level: number;
}

export interface RewardTransaction {
  id: string;
  player_id: string;
  mission_id: string;
  amount_sol: number;
  tx_signature: string;
  status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
}
