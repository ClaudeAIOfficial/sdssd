import { create } from 'zustand';
import { Mission, PlayerState, Vehicle, NPC, InventoryItem } from '@/types';
import { generateMissionPool } from '@/lib/missions';
import { getLevelFromXP } from '@/lib/utils';

interface GameStore {
  // Player state
  player: PlayerState;
  setPlayerPosition: (pos: [number, number, number]) => void;
  setPlayerRotation: (rot: number) => void;
  setPlayerVelocity: (vel: [number, number, number]) => void;
  setPlayerRunning: (running: boolean) => void;
  setPlayerDriving: (driving: boolean) => void;
  addCash: (amount: number) => void;
  addXP: (amount: number) => void;
  addReputation: (amount: number) => void;
  addSOL: (amount: number) => void;
  setWalletAddress: (address: string) => void;
  updatePlayerStats: (stats: Partial<PlayerState>) => void;

  // Missions
  missions: Mission[];
  activeMission: Mission | null;
  missionStartTime: number | null;
  missionDistance: number;
  setActiveMission: (mission: Mission | null) => void;
  completeMission: (missionId: string) => void;
  refreshMissions: () => void;
  addMissionDistance: (dist: number) => void;

  // World
  vehicles: Vehicle[];
  npcs: NPC[];
  wantedLevel: number;
  timeOfDay: number;
  setWantedLevel: (level: number) => void;
  incrementWantedLevel: () => void;
  decrementWantedLevel: () => void;
  setTimeOfDay: (time: number) => void;

  // Vehicle
  currentVehicleId: string | null;
  enterVehicle: (vehicleId: string) => void;
  exitVehicle: () => void;

  // UI state
  isPhoneOpen: boolean;
  togglePhone: () => void;
  phoneTab: string;
  setPhoneTab: (tab: string) => void;
  showMissionComplete: boolean;
  missionCompleteData: { cash: number; xp: number; reputation: number; sol: number } | null;
  setMissionComplete: (data: { cash: number; xp: number; reputation: number; sol: number } | null) => void;
  showCharacterCustomizer: boolean;
  setShowCharacterCustomizer: (show: boolean) => void;

  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem: (itemId: string) => void;

  // Game status
  gameStarted: boolean;
  setGameStarted: (started: boolean) => void;
}

const defaultPlayer: PlayerState = {
  id: '',
  position: [0, 0.5, 0],
  rotation: 0,
  velocity: [0, 0, 0],
  isRunning: false,
  isDriving: false,
  health: 100,
  cash: 1000,
  xp: 0,
  reputation: 0,
  sol_earned: 0,
  level: 1,
  skin_tone: '#F4C88E',
  hair_style: 'short',
  clothes_style: 'casual',
  shoes_style: 'sneakers',
  wallet_address: '',
};

const defaultNPCs: NPC[] = [
  { id: 'npc_1', type: 'civilian', position: [15, 0, 10], rotation: 0, behavior: 'walking' },
  { id: 'npc_2', type: 'civilian', position: [-20, 0, 5], rotation: 1.5, behavior: 'idle' },
  { id: 'npc_3', type: 'mission_giver', position: [5, 0, 25], rotation: 0, behavior: 'idle', mission: 'delivery' },
  { id: 'npc_4', type: 'civilian', position: [30, 0, -15], rotation: 3, behavior: 'walking' },
  { id: 'npc_5', type: 'mission_giver', position: [-15, 0, -20], rotation: 1.5, behavior: 'idle', mission: 'race' },
  { id: 'npc_6', type: 'gang', position: [60, 0, 40], rotation: 0, behavior: 'idle' },
  { id: 'npc_7', type: 'civilian', position: [-40, 0, 30], rotation: 2, behavior: 'walking' },
];

const defaultVehicles: Vehicle[] = [
  { id: 'v1', type: 'sports', name: 'NeonRacer', color: '#ff6b6b', position: [8, 0, 8], speed: 25, price: 5000 },
  { id: 'v2', type: 'motorcycle', name: 'CryptoKick', color: '#6bc5ff', position: [-10, 0, 12], speed: 30, price: 3000 },
  { id: 'v3', type: 'van', name: 'BlockVan', color: '#a8ff6b', position: [25, 0, -5], speed: 18, price: 2500 },
  { id: 'v4', type: 'electric', name: 'SolanaX', color: '#c06bff', position: [-25, 0, -8], speed: 28, price: 8000 },
];

export const useGameStore = create<GameStore>((set, get) => ({
  player: defaultPlayer,

  setPlayerPosition: (pos) => set((s) => ({ player: { ...s.player, position: pos } })),
  setPlayerRotation: (rot) => set((s) => ({ player: { ...s.player, rotation: rot } })),
  setPlayerVelocity: (vel) => set((s) => ({ player: { ...s.player, velocity: vel } })),
  setPlayerRunning: (running) => set((s) => ({ player: { ...s.player, isRunning: running } })),
  setPlayerDriving: (driving) => set((s) => ({ player: { ...s.player, isDriving: driving } })),
  addCash: (amount) => set((s) => ({ player: { ...s.player, cash: s.player.cash + amount } })),
  addXP: (amount) =>
    set((s) => {
      const newXP = s.player.xp + amount;
      return { player: { ...s.player, xp: newXP, level: getLevelFromXP(newXP) } };
    }),
  addReputation: (amount) =>
    set((s) => ({ player: { ...s.player, reputation: s.player.reputation + amount } })),
  addSOL: (amount) =>
    set((s) => ({ player: { ...s.player, sol_earned: s.player.sol_earned + amount } })),
  setWalletAddress: (address) => set((s) => ({ player: { ...s.player, wallet_address: address, id: address } })),
  updatePlayerStats: (stats) => set((s) => ({ player: { ...s.player, ...stats } })),

  missions: generateMissionPool(5),
  activeMission: null,
  missionStartTime: null,
  missionDistance: 0,

  setActiveMission: (mission) =>
    set({ activeMission: mission, missionStartTime: mission ? Date.now() : null, missionDistance: 0 }),

  completeMission: (missionId) => {
    const { activeMission, addCash, addXP, addReputation, addSOL, setMissionComplete } = get();
    if (!activeMission || activeMission.id !== missionId) return;

    addCash(activeMission.cash_reward);
    addXP(activeMission.xp_reward);
    addReputation(activeMission.reputation_reward);
    if (activeMission.sol_reward > 0) addSOL(activeMission.sol_reward);

    setMissionComplete({
      cash: activeMission.cash_reward,
      xp: activeMission.xp_reward,
      reputation: activeMission.reputation_reward,
      sol: activeMission.sol_reward,
    });

    set({
      activeMission: null,
      missionStartTime: null,
      missions: generateMissionPool(5),
    });
  },

  refreshMissions: () => set({ missions: generateMissionPool(5) }),
  addMissionDistance: (dist) => set((s) => ({ missionDistance: s.missionDistance + dist })),

  vehicles: defaultVehicles,
  npcs: defaultNPCs,
  wantedLevel: 0,
  timeOfDay: 0.3,

  setWantedLevel: (level) => set({ wantedLevel: Math.min(5, Math.max(0, level)) }),
  incrementWantedLevel: () => set((s) => ({ wantedLevel: Math.min(5, s.wantedLevel + 1) })),
  decrementWantedLevel: () => set((s) => ({ wantedLevel: Math.max(0, s.wantedLevel - 1) })),
  setTimeOfDay: (time) => set({ timeOfDay: time % 1 }),

  currentVehicleId: null,
  enterVehicle: (vehicleId) => set({ currentVehicleId: vehicleId }),
  exitVehicle: () => set({ currentVehicleId: null }),

  isPhoneOpen: false,
  togglePhone: () => set((s) => ({ isPhoneOpen: !s.isPhoneOpen })),
  phoneTab: 'map',
  setPhoneTab: (tab) => set({ phoneTab: tab }),

  showMissionComplete: false,
  missionCompleteData: null,
  setMissionComplete: (data) =>
    set({ showMissionComplete: data !== null, missionCompleteData: data }),

  showCharacterCustomizer: false,
  setShowCharacterCustomizer: (show) => set({ showCharacterCustomizer: show }),

  inventory: [
    { id: 'phone', name: 'Crypto Phone', type: 'phone', quantity: 1 },
    { id: 'backpack', name: 'Street Backpack', type: 'backpack', quantity: 1 },
  ],
  addInventoryItem: (item) => set((s) => ({ inventory: [...s.inventory, item] })),
  removeInventoryItem: (itemId) =>
    set((s) => ({ inventory: s.inventory.filter((i) => i.id !== itemId) })),

  gameStarted: false,
  setGameStarted: (started) => set({ gameStarted: started }),
}));
