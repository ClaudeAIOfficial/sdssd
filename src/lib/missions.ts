import { Mission, MissionType } from '@/types';
import { randomInt } from './utils';

const MISSION_TEMPLATES: Record<MissionType, Omit<Mission, 'id' | 'location' | 'is_active'>[]> = {
  delivery: [
    {
      type: 'delivery',
      title: 'Crypto Package Drop',
      description: 'Deliver a mysterious encrypted package to the harbor. No questions asked.',
      difficulty: 'easy',
      cash_reward: 500,
      xp_reward: 50,
      reputation_reward: 10,
      sol_reward: 0,
      time_limit: 120,
    },
    {
      type: 'delivery',
      title: 'Hot Hardware',
      description: 'Get this hardware wallet to the buyer before the competition does.',
      difficulty: 'medium',
      cash_reward: 1200,
      xp_reward: 120,
      reputation_reward: 25,
      sol_reward: 0.01,
      time_limit: 90,
    },
  ],
  taxi: [
    {
      type: 'taxi',
      title: 'VIP Transfer',
      description: 'Transport a high-value client across the city. Keep them comfortable and safe.',
      difficulty: 'easy',
      cash_reward: 300,
      xp_reward: 30,
      reputation_reward: 5,
      sol_reward: 0,
      time_limit: 180,
    },
  ],
  race: [
    {
      type: 'race',
      title: 'Neon Street Race',
      description: 'First one to finish the circuit wins the pot. Modified cars only.',
      difficulty: 'hard',
      cash_reward: 3000,
      xp_reward: 300,
      reputation_reward: 50,
      sol_reward: 0.05,
      time_limit: 300,
    },
    {
      type: 'race',
      title: 'Harbor Sprint',
      description: 'Quick race along the waterfront. Beat the other racers to the finish.',
      difficulty: 'medium',
      cash_reward: 1500,
      xp_reward: 150,
      reputation_reward: 30,
      sol_reward: 0.02,
      time_limit: 180,
    },
  ],
  collect_wallets: [
    {
      type: 'collect_wallets',
      title: 'Crypto Hunt',
      description: 'Collect hidden crypto wallets scattered across the city before time runs out.',
      difficulty: 'medium',
      cash_reward: 800,
      xp_reward: 100,
      reputation_reward: 20,
      sol_reward: 0.01,
      time_limit: 240,
    },
  ],
  defeat_gang: [
    {
      type: 'defeat_gang',
      title: 'Territory Takeover',
      description: 'The Byte Crew is moving in on our block. Show them who runs this city.',
      difficulty: 'hard',
      cash_reward: 2000,
      xp_reward: 200,
      reputation_reward: 40,
      sol_reward: 0.03,
      time_limit: 300,
    },
  ],
  protect_npc: [
    {
      type: 'protect_npc',
      title: 'Bodyguard Duty',
      description: 'Keep this whale safe while they make their transaction. Watch your six.',
      difficulty: 'medium',
      cash_reward: 1000,
      xp_reward: 100,
      reputation_reward: 25,
      sol_reward: 0.02,
      time_limit: 180,
    },
  ],
  steal_package: [
    {
      type: 'steal_package',
      title: 'Corporate Espionage',
      description: 'Intercept the rival crew\'s delivery. They won\'t give it up without a fight.',
      difficulty: 'hard',
      cash_reward: 2500,
      xp_reward: 250,
      reputation_reward: 45,
      sol_reward: 0.04,
      time_limit: 240,
    },
  ],
  find_hardware_wallet: [
    {
      type: 'find_hardware_wallet',
      title: 'Lost Ledger',
      description: 'A desperate trader lost their hardware wallet. Find it before someone else does.',
      difficulty: 'easy',
      cash_reward: 600,
      xp_reward: 60,
      reputation_reward: 15,
      sol_reward: 0,
      time_limit: 300,
    },
  ],
};

const CITY_LOCATIONS: [number, number, number][] = [
  [20, 0, 20],
  [-30, 0, 15],
  [50, 0, -10],
  [-20, 0, -40],
  [10, 0, 60],
  [-60, 0, 30],
  [80, 0, 80],
  [-80, 0, -80],
  [40, 0, -60],
  [-40, 0, 60],
];

export function generateRandomMission(): Mission {
  const types = Object.keys(MISSION_TEMPLATES) as MissionType[];
  const type = types[randomInt(0, types.length - 1)];
  const templates = MISSION_TEMPLATES[type];
  const template = templates[randomInt(0, templates.length - 1)];
  const location = CITY_LOCATIONS[randomInt(0, CITY_LOCATIONS.length - 1)];

  return {
    ...template,
    id: `mission_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    location: { x: location[0], y: location[1], z: location[2] },
    is_active: true,
  };
}

export function generateMissionPool(count = 5): Mission[] {
  return Array.from({ length: count }, () => generateRandomMission());
}

export function getDifficultyColor(difficulty: Mission['difficulty']): string {
  switch (difficulty) {
    case 'easy': return '#4ade80';
    case 'medium': return '#fbbf24';
    case 'hard': return '#f87171';
    default: return '#94a3b8';
  }
}

export function getMissionIcon(type: MissionType): string {
  const icons: Record<MissionType, string> = {
    delivery: '📦',
    taxi: '🚕',
    race: '🏁',
    collect_wallets: '💰',
    defeat_gang: '⚔️',
    protect_npc: '🛡️',
    steal_package: '🎯',
    find_hardware_wallet: '🔍',
  };
  return icons[type] || '❓';
}
