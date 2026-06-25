import type { CharacterAppearance } from "./types";

// Character customization option palettes (all original art via parametric colors).
export const SKIN_TONES = ["#f6d3b0", "#e8b58a", "#c68642", "#8d5524", "#5a3a22", "#3a2417"];
export const HAIR_COLORS = ["#1c1c1c", "#5a3a22", "#b5651d", "#e0c068", "#d916ff", "#22e3ff", "#ff2d95"];
export const SHIRT_COLORS = ["#ff2d95", "#22e3ff", "#1be7b6", "#ffd23f", "#7b2ff7", "#f4ecff", "#0a0612"];
export const PANTS_COLORS = ["#22304a", "#1a1a1a", "#3b3b3b", "#5a3a22", "#0a0612", "#7b2ff7"];
export const SHOE_COLORS = ["#ffffff", "#0a0612", "#ff2d95", "#22e3ff", "#ffd23f"];
export const HAIR_STYLES: CharacterAppearance["hairStyle"][] = [
  "buzz",
  "short",
  "afro",
  "mohawk",
  "long",
];

export function defaultAppearance(): CharacterAppearance {
  return {
    skin: SKIN_TONES[1],
    hair: HAIR_COLORS[0],
    hairStyle: "short",
    shirt: SHIRT_COLORS[0],
    pants: PANTS_COLORS[0],
    shoes: SHOE_COLORS[1],
    name: "Rookie",
  };
}
