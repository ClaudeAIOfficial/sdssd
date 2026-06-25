import { PLAYER, POLICE, VEHICLE, WORLD } from "@/lib/constants";
import { LANDMARKS } from "@/lib/cityData";
import { isOnRoad } from "./cityLayout";
import type { Police, Vehicle, WorldState } from "./world";

const BOUND = WORLD.half + 8;

function clampToWorld(p: { x: number; z: number }) {
  p.x = Math.max(-BOUND, Math.min(BOUND, p.x));
  p.z = Math.max(-BOUND, Math.min(BOUND, p.z));
}

/** Push a circle out of any building AABB it overlaps. Returns true if it hit. */
function resolveBuildings(
  pos: { x: number; z: number },
  radius: number,
  world: WorldState,
): boolean {
  let hit = false;
  for (const b of world.colliders) {
    const hw = b.w / 2 + radius;
    const hd = b.d / 2 + radius;
    const dx = pos.x - b.x;
    const dz = pos.z - b.z;
    if (Math.abs(dx) < hw && Math.abs(dz) < hd) {
      // Overlap — resolve along the axis of least penetration.
      const penX = hw - Math.abs(dx);
      const penZ = hd - Math.abs(dz);
      if (penX < penZ) {
        pos.x += dx >= 0 ? penX : -penX;
      } else {
        pos.z += dz >= 0 ? penZ : -penZ;
      }
      hit = true;
    }
  }
  return hit;
}

function addHeat(world: WorldState, amount: number) {
  world.heat = Math.min(POLICE.maxStars + 0.99, world.heat + amount);
}

function updateTrafficVehicle(v: Vehicle, dt: number) {
  const cfg = VEHICLE[v.kind];
  v.turnCooldown -= dt;
  // At grid intersections, occasionally turn to keep traffic flowing on roads.
  const nearIntersection =
    Math.abs(((v.x % WORLD.blockSize) + WORLD.blockSize) % WORLD.blockSize) < 1.2 &&
    Math.abs(((v.z % WORLD.blockSize) + WORLD.blockSize) % WORLD.blockSize) < 1.2;
  if (nearIntersection && v.turnCooldown <= 0 && Math.random() > 0.5) {
    v.aiHeading += (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 2);
    v.turnCooldown = 2.5;
  }
  v.heading = v.aiHeading;
  v.speed = Math.min(cfg.topSpeed * 0.4, v.speed + cfg.accel * dt * 0.5);
  const nx = v.x + Math.sin(v.heading) * v.speed * dt;
  const nz = v.z + Math.cos(v.heading) * v.speed * dt;
  // Keep traffic roughly on roads; if it would leave the road, turn back.
  if (isOnRoad(nx, nz) && Math.abs(nx) < BOUND && Math.abs(nz) < BOUND) {
    v.x = nx;
    v.z = nz;
  } else {
    v.aiHeading += Math.PI / 2;
  }
}

function updatePlayerOnFoot(world: WorldState, dt: number) {
  const { input, player } = world;
  const speed = input.run ? PLAYER.runSpeed : PLAYER.walkSpeed;
  const mag = Math.hypot(input.forward, input.strafe);
  if (mag > 0.01) {
    const nx = input.strafe / mag;
    const nz = input.forward / mag;
    player.vx = nx * speed;
    player.vz = nz * speed;
    player.heading = Math.atan2(nx, nz);
  } else {
    player.vx *= 0.7;
    player.vz *= 0.7;
  }
  player.x += player.vx * dt;
  player.z += player.vz * dt;
  player.speed = Math.hypot(player.vx, player.vz);
  resolveBuildings(player, PLAYER.radius, world);
  clampToWorld(player);
}

function updatePlayerDriving(world: WorldState, dt: number) {
  const { input, player } = world;
  const v = world.vehicles.find((x) => x.id === player.drivingId);
  if (!v) {
    player.drivingId = null;
    return;
  }
  const cfg = VEHICLE[v.kind];
  // Accelerate / brake.
  if (input.forward > 0.1) {
    v.speed = Math.min(cfg.topSpeed, v.speed + cfg.accel * dt);
  } else if (input.forward < -0.1) {
    v.speed = Math.max(-cfg.topSpeed * 0.45, v.speed - cfg.accel * dt);
  } else {
    v.speed *= 0.96;
    if (Math.abs(v.speed) < 0.05) v.speed = 0;
  }
  // Steering scales with speed for an arcade feel.
  const steer = input.strafe * cfg.handling * dt * Math.sign(v.speed || 1);
  if (Math.abs(v.speed) > 0.2) v.heading -= steer * Math.min(1, Math.abs(v.speed) / 8);

  const prev = { x: v.x, z: v.z };
  v.x += Math.sin(v.heading) * v.speed * dt;
  v.z += Math.cos(v.heading) * v.speed * dt;

  // Building collision for the car (bigger radius). Bumping at speed = crime.
  if (resolveBuildings(v, 1.8, world)) {
    if (Math.abs(v.speed) > 12) addHeat(world, 0.12);
    v.speed *= 0.3;
  }
  clampToWorld(v);

  // Run over / scare NPCs.
  for (const n of world.npcs) {
    const d = Math.hypot(n.x - v.x, n.z - v.z);
    if (d < 2.4) {
      n.spooked = 2.5;
      // flee from the car
      const ang = Math.atan2(n.x - v.x, n.z - v.z);
      n.vx = Math.sin(ang) * 6;
      n.vz = Math.cos(ang) * 6;
      if (Math.abs(v.speed) > 14) addHeat(world, 0.25 * dt * 10);
    }
  }

  // Sync player position to the vehicle.
  player.x = v.x;
  player.z = v.z;
  player.heading = v.heading;
  player.speed = Math.abs(v.speed);
  void prev;
}

function updateNpcs(world: WorldState, dt: number) {
  for (const n of world.npcs) {
    n.retargetIn -= dt;
    if (n.spooked > 0) {
      n.spooked -= dt;
    } else if (n.retargetIn <= 0) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1.2 + Math.random() * 1.4;
      n.vx = Math.sin(a) * sp;
      n.vz = Math.cos(a) * sp;
      n.retargetIn = 2 + Math.random() * 4;
    }
    n.x += n.vx * dt;
    n.z += n.vz * dt;
    if (Math.hypot(n.vx, n.vz) > 0.05) n.heading = Math.atan2(n.vx, n.vz);
    // Soft collision with buildings.
    resolveBuildings(n, 0.6, world);
    clampToWorld(n);
  }
}

function updatePolice(world: WorldState, dt: number) {
  const desired = world.wanted * POLICE.spawnPerStar;
  // Spawn police up to the desired count near the player but off-screen-ish.
  while (world.police.length < desired) {
    const a = Math.random() * Math.PI * 2;
    const r = 40 + Math.random() * 20;
    world.police.push({
      id: Date.now() + Math.random(),
      x: world.player.x + Math.sin(a) * r,
      z: world.player.z + Math.cos(a) * r,
      heading: 0,
      speed: 0,
    });
  }
  // Despawn extras when heat drops.
  while (world.police.length > desired) world.police.pop();

  let anyClose = false;
  for (const p of world.police) {
    const dx = world.player.x - p.x;
    const dz = world.player.z - p.z;
    const dist = Math.hypot(dx, dz);
    if (dist < POLICE.sightRange) anyClose = true;
    if (dist > 0.1) {
      const ang = Math.atan2(dx, dz);
      p.heading = ang;
      p.speed = POLICE.chaseSpeed + world.wanted;
      p.x += Math.sin(ang) * p.speed * dt;
      p.z += Math.cos(ang) * p.speed * dt;
    }
    resolveBuildings(p, 1.2, world);
    // Bust: if police touches an on-foot player, they get arrested.
    if (dist < 2.2 && world.player.drivingId === null) {
      world.onArrest?.();
      world.heat = 0;
      world.wanted = 0;
      world.police = [];
      return;
    }
  }

  // Cool down wanted level when no police are nearby.
  if (!anyClose && world.wanted > 0) {
    world.coolTimer += dt;
    if (world.coolTimer >= POLICE.coolPerStar) {
      world.heat = Math.max(0, world.heat - 1);
      world.coolTimer = 0;
    }
  } else {
    world.coolTimer = 0;
  }
}

function updateLandmark(world: WorldState) {
  let nearest: string | null = null;
  let best = 10;
  for (const lm of LANDMARKS) {
    const d = Math.hypot(world.player.x - lm.pos.x, world.player.z - lm.pos.z);
    if (d < best) {
      best = d;
      nearest = lm.id;
    }
  }
  if (nearest !== world.currentLandmark) {
    world.currentLandmark = nearest;
    world.onLandmarkChange?.(nearest);
  }
}

/** Find the nearest drivable vehicle to the player within range. */
export function nearestDrivable(world: WorldState, range = 4.5): Vehicle | null {
  let best: Vehicle | null = null;
  let bestD = range;
  for (const v of world.vehicles) {
    if (!v.drivable) continue;
    const d = Math.hypot(v.x - world.player.x, v.z - world.player.z);
    if (d < bestD) {
      bestD = d;
      best = v;
    }
  }
  return best;
}

/** Advance the whole simulation by dt seconds. */
export function stepWorld(world: WorldState, dt: number) {
  // Clamp dt to avoid tunneling on tab refocus.
  const step = Math.min(dt, 0.05);

  // Handle enter/exit edge action.
  if (world.wantEnterExit) {
    world.wantEnterExit = false;
    if (world.player.drivingId !== null) {
      const v = world.vehicles.find((x) => x.id === world.player.drivingId);
      if (v) {
        v.speed = 0;
        // step out beside the car
        world.player.x = v.x + Math.cos(v.heading) * 2.5;
        world.player.z = v.z - Math.sin(v.heading) * 2.5;
      }
      world.player.drivingId = null;
    } else {
      const v = nearestDrivable(world);
      if (v) world.player.drivingId = v.id;
    }
  }

  if (world.player.drivingId !== null) {
    updatePlayerDriving(world, step);
  } else {
    updatePlayerOnFoot(world, step);
  }

  for (const v of world.vehicles) {
    if (v.id === world.player.drivingId) continue;
    updateTrafficVehicle(v, step);
  }

  updateNpcs(world, step);

  world.wanted = Math.max(0, Math.min(POLICE.maxStars, Math.floor(world.heat)));
  updatePolice(world, step);
  updateLandmark(world);
}
