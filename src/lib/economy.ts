import { ECONOMY } from "./constants";

/** XP required to reach a given level (1-indexed). */
export function xpForLevel(level: number): number {
  // Gentle quadratic curve.
  return Math.round(ECONOMY.levelXpBase * level * (1 + level * 0.15));
}

/** Resolve the current level + progress from a total XP value. */
export function levelFromXp(totalXp: number): {
  level: number;
  intoLevel: number;
  needed: number;
  progress: number;
} {
  let level = 1;
  let remaining = totalXp;
  // Walk upward accumulating per-level requirements.
  // Cap the loop to avoid pathological inputs.
  while (level < 200) {
    const needed = xpForLevel(level);
    if (remaining < needed) {
      return { level, intoLevel: remaining, needed, progress: remaining / needed };
    }
    remaining -= needed;
    level += 1;
  }
  return { level, intoLevel: 0, needed: xpForLevel(level), progress: 1 };
}

/** Format an integer cash value with a $ and thousands separators. */
export function formatCash(amount: number): string {
  return `$${Math.max(0, Math.round(amount)).toLocaleString("en-US")}`;
}

/** Format a SOL amount to a sensible number of decimals. */
export function formatSol(amount: number): string {
  if (amount === 0) return "0 SOL";
  if (amount < 0.001) return `${amount.toFixed(5)} SOL`;
  return `${amount.toFixed(4)} SOL`;
}
