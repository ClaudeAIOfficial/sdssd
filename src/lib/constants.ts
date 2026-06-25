import { MissionDefinition, PoiType, Vec2, VehicleType } from "@/lib/types";

export const CITY_RADIUS = 120;
export const WORLD_SIZE = 240;
export const MINIMAP_SIZE = 220;

export const POI_LOCATIONS: Record<PoiType, Vec2> = {
  gas_station: { x: -70, z: 45 },
  bank: { x: 38, z: -12 },
  casino: { x: 66, z: 54 },
  beach: { x: -96, z: -90 },
  harbor: { x: 96, z: -76 },
  apartments: { x: -22, z: 18 },
  police_station: { x: -44, z: -22 },
  warehouse: { x: 76, z: -26 },
  park: { x: -4, z: 70 },
  garage: { x: -60, z: -56 },
  safehouse: { x: 8, z: -70 },
};

export const VEHICLE_SPEED: Record<VehicleType, number> = {
  sports_car: 36,
  motorcycle: 42,
  van: 24,
  truck: 18,
  electric_car: 28,
};

export const VEHICLE_PRICES: Record<VehicleType, number> = {
  sports_car: 3500,
  motorcycle: 1200,
  van: 1800,
  truck: 2600,
  electric_car: 2400,
};

export const CHARACTER_SKIN: Record<string, string> = {
  light: "#f7d3b8",
  tan: "#e3b28d",
  brown: "#b97d58",
  dark: "#7a4d38",
};

const missionSeed: MissionDefinition[] = [
  {
    id: "mission-deliver-1",
    type: "deliver_package",
    title: "Neon Parcel Run",
    description: "Pick up an encrypted package and deliver it before sunset.",
    pickup: POI_LOCATIONS.warehouse,
    dropoff: POI_LOCATIONS.beach,
    targetPoi: "beach",
    difficulty: 2,
    expectedSeconds: 90,
  },
  {
    id: "mission-race-1",
    type: "street_race",
    title: "Harbor Sprint",
    description: "Beat the rival crew from harbor to casino.",
    pickup: POI_LOCATIONS.harbor,
    dropoff: POI_LOCATIONS.casino,
    targetPoi: "casino",
    difficulty: 4,
    expectedSeconds: 70,
  },
  {
    id: "mission-wallet-1",
    type: "find_hardware_wallet",
    title: "Lost Ledger",
    description: "Locate a lost hardware wallet near the park.",
    pickup: POI_LOCATIONS.bank,
    dropoff: POI_LOCATIONS.park,
    targetPoi: "park",
    difficulty: 3,
    expectedSeconds: 85,
  },
];

export const DEFAULT_MISSIONS = missionSeed;

