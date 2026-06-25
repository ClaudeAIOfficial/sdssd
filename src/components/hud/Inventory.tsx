"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/lib/store";

export function Inventory() {
  const open = useGame((s) => s.inventoryOpen);
  const close = useGame((s) => s.toggleInventory);
  const items = useGame((s) => s.inventory);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
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
            className="glass-strong w-[min(92vw,520px)] rounded-3xl border border-white/10 p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="display-font text-3xl tracking-wide">Backpack</h2>
              <button onClick={() => close(false)} className="text-white/50 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  title={item.description}
                  className="group relative flex aspect-square flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-center hover:bg-white/10"
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="mt-1 text-[10px] leading-tight text-white/70">{item.name}</span>
                  {item.qty > 1 && (
                    <span className="absolute right-1 top-1 rounded-full bg-gts-pink px-1.5 text-[10px] font-bold">
                      {item.qty}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-white/40">
              Mission items appear here automatically. Hover for details.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
