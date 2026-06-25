// Central tuning + world constants for GTS.

export const WORLD = {
  /** Half-size of the playable square city (world units from centre). */
  half: 120,
  blockSize: 30,
  roadWidth: 9,
};

export const PLAYER = {
  walkSpeed: 6,
  runSpeed: 11,
  radius: 0.8,
};

export const VEHICLE = {
  // Per-type top speed & handling, used for "simple physics".
  sports: { topSpeed: 38, accel: 26, handling: 2.6, label: "Velocità GT", color: "#ff2d95" },
  motorcycle: { topSpeed: 34, accel: 30, handling: 3.6, label: "Neon Blade", color: "#22e3ff" },
  van: { topSpeed: 22, accel: 14, handling: 1.7, label: "Hauler Van", color: "#ffd23f" },
  truck: { topSpeed: 18, accel: 10, handling: 1.2, label: "Dock Truck", color: "#ff7a00" },
  electric: { topSpeed: 30, accel: 22, handling: 2.4, label: "Volt EV", color: "#1be7b6" },
} as const;

export type VehicleKind = keyof typeof VEHICLE;

export const ECONOMY = {
  startingCash: 500,
  startingSol: 0,
  // SOL is intentionally tiny — these are "verified micro rewards".
  maxSolPerMission: 0.01,
  levelXpBase: 120,
};

export const POLICE = {
  maxStars: 5,
  // Seconds of being "unseen" required to drop one wanted star.
  coolPerStar: 9,
  spawnPerStar: 1,
  chaseSpeed: 9.5,
  sightRange: 26,
};

export const KEYS = {
  phone: "KeyP",
  inventory: "KeyI",
  interact: "KeyE",
  enterVehicle: "KeyF",
  run: "ShiftLeft",
  map: "KeyM",
};

/** Local-storage key for persisting the player's profile between sessions. */
export const STORAGE_KEY = "gts:profile:v1";

/** Admin passphrase for the demo admin panel (overridable via env). */
export const DEFAULT_ADMIN_PASS = "gts-admin";
