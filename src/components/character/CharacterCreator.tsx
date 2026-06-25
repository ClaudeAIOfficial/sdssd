"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import { useGame } from "@/lib/store";
import { LowPolyCharacter } from "@/components/game/LowPolyCharacter";
import {
  HAIR_COLORS,
  HAIR_STYLES,
  PANTS_COLORS,
  SHIRT_COLORS,
  SHOE_COLORS,
  SKIN_TONES,
} from "@/lib/appearance";
import type { CharacterAppearance } from "@/lib/types";

function Swatches({
  label,
  colors,
  value,
  onChange,
}: {
  label: string;
  colors: string[];
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-widest text-white/50">{label}</div>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`h-7 w-7 rounded-full border-2 transition ${
              value === c ? "border-white scale-110" : "border-white/20"
            }`}
            style={{ background: c }}
          />
        ))}
      </div>
    </div>
  );
}

export function CharacterCreator() {
  const open = useGame((s) => s.characterCreatorOpen);
  const close = useGame((s) => s.toggleCharacterCreator);
  const appearance = useGame((s) => s.profile.appearance);
  const setAppearance = useGame((s) => s.setAppearance);
  const profile = useGame((s) => s.profile);
  const notify = useGame((s) => s.notify);

  const update = (patch: Partial<CharacterAppearance>) => setAppearance(patch);

  const save = async () => {
    // Persist cosmetics to the backend if we have a server-side account.
    if (profile.id && profile.id !== "local") {
      try {
        await fetch("/api/player", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: profile.id, appearance }),
        });
      } catch {
        /* offline: local persistence already done */
      }
    }
    notify({ title: "Look saved", kind: "success" });
    close(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => close(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong grid w-[min(94vw,860px)] grid-cols-1 gap-6 rounded-3xl border border-white/10 p-6 md:grid-cols-2"
          >
            {/* Preview */}
            <div className="relative h-[360px] overflow-hidden rounded-2xl bg-gradient-to-b from-gts-purple/30 to-black/50">
              <Canvas camera={{ position: [0, 1.4, 4], fov: 40 }}>
                <Suspense fallback={null}>
                  <Stage environment={null} intensity={0.5} adjustCamera={false} shadows={false}>
                    <group position={[0, -0.9, 0]}>
                      <LowPolyCharacter appearance={appearance} />
                    </group>
                  </Stage>
                  <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={3} />
                </Suspense>
              </Canvas>
              <div className="absolute left-4 top-4">
                <div className="display-font text-3xl tracking-wide">Style Studio</div>
                <div className="text-xs text-gts-cyan">{profile.handle}</div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <Swatches label="Skin Tone" colors={SKIN_TONES} value={appearance.skin} onChange={(c) => update({ skin: c })} />
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-widest text-white/50">Hair Style</div>
                <div className="flex flex-wrap gap-2">
                  {HAIR_STYLES.map((h) => (
                    <button
                      key={h}
                      onClick={() => update({ hairStyle: h })}
                      className={`rounded-lg px-3 py-1.5 text-xs capitalize ${
                        appearance.hairStyle === h ? "bg-gts-pink text-white" : "bg-white/5 text-white/70"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <Swatches label="Hair Color" colors={HAIR_COLORS} value={appearance.hair} onChange={(c) => update({ hair: c })} />
              <Swatches label="Shirt" colors={SHIRT_COLORS} value={appearance.shirt} onChange={(c) => update({ shirt: c })} />
              <Swatches label="Pants" colors={PANTS_COLORS} value={appearance.pants} onChange={(c) => update({ pants: c })} />
              <Swatches label="Shoes" colors={SHOE_COLORS} value={appearance.shoes} onChange={(c) => update({ shoes: c })} />

              <div className="flex gap-3 pt-2">
                <button onClick={save} className="btn-primary flex-1">Save Look</button>
                <button onClick={() => close(false)} className="btn-ghost">Close</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
