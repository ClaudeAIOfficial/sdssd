import { missionTemplates } from "@/lib/game-data";
import type { MissionAttempt, VerificationResult } from "@/lib/types";

const MAX_WALK_OR_DRIVE_SPEED_UNITS_PER_SECOND = 3.4;
const POSITION_TOLERANCE = 9;

function distance(a: [number, number], b: [number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function verifyMissionAttempt(attempt: MissionAttempt, completedMissionIds: string[] = []): VerificationResult {
  const mission = missionTemplates.find((candidate) => candidate.id === attempt.missionId);

  if (!mission) {
    return { ok: false, reason: "Mission does not exist." };
  }

  if (completedMissionIds.includes(mission.id)) {
    return { ok: false, reason: "Mission reward already claimed." };
  }

  const durationSeconds = Math.max(0, (attempt.completedAt - attempt.startedAt) / 1000);

  if (durationSeconds < mission.minDurationSeconds) {
    return { ok: false, reason: "Mission completed faster than allowed route timing." };
  }

  if (attempt.distanceTravelled < mission.distanceRequired) {
    return { ok: false, reason: "Not enough verified travel distance for this mission." };
  }

  if (attempt.maxSpeed > MAX_WALK_OR_DRIVE_SPEED_UNITS_PER_SECOND) {
    return { ok: false, reason: "Movement speed exceeded vehicle physics limits." };
  }

  if (distance(attempt.playerPosition, mission.target) > POSITION_TOLERANCE) {
    return { ok: false, reason: "Player is not close enough to the mission objective." };
  }

  const solReward = mission.solRewardEligible && attempt.walletAddress ? mission.rewards.sol : 0;

  return {
    ok: true,
    mission,
    rewards: {
      ...mission.rewards,
      sol: solReward
    },
    claimId: `claim-${mission.id}-${attempt.completedAt}`
  };
}
