"use client";

import { PlayerCustomization } from "@/lib/types";

type CharacterCustomizerProps = {
  customization: PlayerCustomization;
  onChange: (patch: Partial<PlayerCustomization>) => void;
};

export function CharacterCustomizer({ customization, onChange }: CharacterCustomizerProps) {
  return (
    <section className="pointer-events-auto absolute bottom-4 right-4 z-30 w-[min(92vw,300px)] rounded-2xl border border-white/15 bg-slate-900/80 p-4 text-white backdrop-blur-xl">
      <h3 className="mb-2 text-sm font-semibold text-cyan-300">Character</h3>
      <div className="space-y-2 text-sm">
        <SelectRow
          label="Hair"
          value={customization.hair}
          options={["buzz", "curly", "mohawk", "ponytail"]}
          onChange={(value) => onChange({ hair: value as PlayerCustomization["hair"] })}
        />
        <SelectRow
          label="Clothes"
          value={customization.clothes}
          options={["street", "formal", "racer", "beach"]}
          onChange={(value) => onChange({ clothes: value as PlayerCustomization["clothes"] })}
        />
        <SelectRow
          label="Shoes"
          value={customization.shoes}
          options={["sneakers", "boots", "sandals"]}
          onChange={(value) => onChange({ shoes: value as PlayerCustomization["shoes"] })}
        />
        <SelectRow
          label="Skin"
          value={customization.skinTone}
          options={["light", "tan", "brown", "dark"]}
          onChange={(value) => onChange({ skinTone: value as PlayerCustomization["skinTone"] })}
        />
      </div>
    </section>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid grid-cols-2 items-center gap-2">
      <span className="text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg bg-slate-800 px-2 py-1 text-xs uppercase tracking-wide"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

