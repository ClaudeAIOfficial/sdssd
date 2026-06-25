"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/lib/store";

const COLORS: Record<string, string> = {
  info: "border-gts-cyan/60 text-gts-cyan",
  success: "border-gts-teal/60 text-gts-teal",
  warn: "border-gts-pink/60 text-gts-pink",
  reward: "border-gts-gold/70 text-gts-gold",
};

export function Notifications() {
  const notifications = useGame((s) => s.notifications);
  return (
    <div className="pointer-events-none fixed left-1/2 top-6 z-40 flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`glass-strong rounded-xl border px-4 py-3 ${COLORS[n.kind] ?? COLORS.info}`}
          >
            <div className="text-sm font-bold tracking-wide">{n.title}</div>
            {n.body && <div className="mt-0.5 text-xs text-white/80">{n.body}</div>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
