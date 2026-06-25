import type { Mission, MissionTelemetry } from "@/lib/types";

export type VerificationResult = {
  valid: boolean;
  reasons: string[];
  normalizedDistance: number;
};

const distanceBetween = (a: [number, number], b: [number, number]) => {
  const dx = a[0] - b[0];
  const dz = a[1] - b[1];
  return Math.sqrt(dx * dx + dz * dz);
};

export function verifyMissionCompletion(mission: Mission, telemetry: MissionTelemetry): VerificationResult {
  const reasons: string[] = [];
  const startDelta = distanceBetween(mission.start, telemetry.start);
  const finishDelta = distanceBetween(mission.target, telemetry.finish);
  const normalizedDistance = Math.max(0, Number(telemetry.distanceTravelled.toFixed(2)));

  if (telemetry.elapsedSeconds < mission.minSeconds) {
    reasons.push("Mission completed faster than the verified minimum route time.");
  }

  if (telemetry.elapsedSeconds > mission.maxSeconds) {
    reasons.push("Mission exceeded the allowed completion window.");
  }

  if (normalizedDistance < mission.requiredDistance * 0.72) {
    reasons.push("Reported travel distance is too short for the route.");
  }

  if (startDelta > 12) {
    reasons.push("Mission was not started near the assigned marker.");
  }

  if (finishDelta > 14) {
    reasons.push("Mission was not finished near the assigned objective.");
  }

  if (telemetry.maxSpeed > 24) {
    reasons.push("Reported speed exceeds vehicle physics limits.");
  }

  if (mission.type === "protect" && telemetry.collisions > 2) {
    reasons.push("Protection mission collision limit exceeded.");
  }

  return {
    valid: reasons.length === 0,
    reasons,
    normalizedDistance,
  };
}
