import { MissionDefinition, MissionType, PoiType, Vec2 } from "@/lib/types";
import { POI_LOCATIONS } from "@/lib/constants";

const MISSION_LABELS: Record<MissionType, string> = {
  deliver_package: "Deliver Package",
  taxi_run: "Taxi Rush",
  street_race: "Street Race",
  collect_wallets: "Collect Hidden Wallets",
  defeat_gang: "Defeat NPC Gang",
  protect_npc: "Protect VIP",
  steal_package: "Steal Package",
  find_hardware_wallet: "Find Hardware Wallet",
};

const MISSION_TEXT: Record<MissionType, string> = {
  deliver_package: "Transport a package to the marked destination.",
  taxi_run: "Pick up a rider and reach the drop point on time.",
  street_race: "Win the checkpoint sprint against city rivals.",
  collect_wallets: "Gather hidden crypto wallets across downtown.",
  defeat_gang: "Defeat gang members around the highlighted block.",
  protect_npc: "Escort an ally and keep them safe en route.",
  steal_package: "Intercept and steal a courier package.",
  find_hardware_wallet: "Track and recover a missing hardware wallet.",
};

export const formatCompact = (value: number) =>
  Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );

export const formatWallet = (wallet?: string) =>
  wallet ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : "Not connected";

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const distance2d = (a: Vec2, b: Vec2) =>
  Math.hypot(a.x - b.x, a.z - b.z);

export const randomId = (prefix: string) =>
  `${prefix}-${crypto.randomUUID().split("-")[0]}`;

const poiKeys = Object.keys(POI_LOCATIONS) as PoiType[];
const missionKeys = Object.keys(MISSION_LABELS) as MissionType[];

export const randomMission = (): MissionDefinition => {
  const pickupPoi = poiKeys[Math.floor(Math.random() * poiKeys.length)];
  let dropPoi = poiKeys[Math.floor(Math.random() * poiKeys.length)];
  if (dropPoi === pickupPoi) {
    dropPoi = poiKeys[(poiKeys.indexOf(dropPoi) + 1) % poiKeys.length];
  }
  const type = missionKeys[Math.floor(Math.random() * missionKeys.length)];
  const difficulty = (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5;

  return {
    id: randomId("mission"),
    type,
    title: `${MISSION_LABELS[type]} • ${pickupPoi.replace("_", " ")}`,
    description: MISSION_TEXT[type],
    pickup: { ...POI_LOCATIONS[pickupPoi] },
    dropoff: { ...POI_LOCATIONS[dropPoi] },
    targetPoi: dropPoi,
    difficulty,
    expectedSeconds: 45 + difficulty * 25,
  };
};

