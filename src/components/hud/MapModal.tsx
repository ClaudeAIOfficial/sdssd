"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { MiniMap } from "./MiniMap";
import { LANDMARKS } from "@/lib/cityData";

export function MapModal() {
  const open = useGame((s) => s.mapOpen);
  const close = useGame((s) => s.toggleMap);

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
            className="glass-strong w-[min(94vw,720px)] rounded-3xl border border-white/10 p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="display-font text-3xl tracking-wide">City Map</h2>
              <button onClick={() => close(false)} className="text-white/50 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_220px]">
              <div className="flex items-center justify-center rounded-2xl bg-black/40 p-3">
                <MiniMap size={Math.min(440, typeof window !== "undefined" ? window.innerWidth - 120 : 440)} full />
              </div>
              <div className="space-y-1.5 overflow-y-auto">
                <div className="text-[10px] uppercase tracking-widest text-gts-cyan">Districts</div>
                {LANDMARKS.map((lm) => (
                  <div key={lm.id} className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5 text-xs">
                    <span style={{ color: lm.color }}>●</span>
                    <span className="text-white/80">{lm.icon} {lm.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
