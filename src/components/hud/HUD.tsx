"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { formatCash, formatSol, levelFromXp } from "@/lib/economy";
import { MiniMap } from "./MiniMap";
import { getLandmark } from "@/lib/cityData";
import { missionTypeLabel } from "@/lib/missions";
import type { GraphicsQuality } from "@/lib/store";

export function HUD() {
  const profile = useGame((s) => s.profile);
  const wanted = useGame((s) => s.wanted);
  const inVehicle = useGame((s) => s.inVehicle);
  const speed = useGame((s) => s.speed);
  const nearLandmark = useGame((s) => s.nearLandmark);
  const active = useGame((s) => s.active);
  const graphicsQuality = useGame((s) => s.graphicsQuality);
  const cameraZoom = useGame((s) => s.cameraZoom);

  const togglePhone = useGame((s) => s.togglePhone);
  const toggleInventory = useGame((s) => s.toggleInventory);
  const toggleMap = useGame((s) => s.toggleMap);
  const toggleCharacterCreator = useGame((s) => s.toggleCharacterCreator);
  const setGraphicsQuality = useGame((s) => s.setGraphicsQuality);
  const setCameraZoom = useGame((s) => s.setCameraZoom);

  const lvl = levelFromXp(profile.xp);
  const landmark = nearLandmark ? getLandmark(nearLandmark as never) : undefined;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none">
      {/* Top-left: identity + economy */}
      <div className="absolute left-4 top-4 flex flex-col gap-2">
        <div className="retro-panel flex items-center gap-3 px-3 py-2">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-gradient-to-br from-gts-pink to-gts-purple font-mono font-black text-black shadow-[3px_3px_0_#000]">
            {profile.handle.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="font-mono text-sm font-black uppercase leading-tight tracking-wider text-[#f7ead0]">{profile.handle}</div>
            <div className="text-[10px] uppercase tracking-widest text-gts-cyan">
              Lvl {lvl.level} • {profile.reputation} REP
            </div>
            {/* XP bar */}
            <div className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-gts-cyan to-gts-teal"
                style={{ width: `${Math.round(lvl.progress * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="retro-chip text-gts-gold">CASH {formatCash(profile.cash)}</div>
          <div className="retro-chip text-gts-teal">◎ {formatSol(profile.sol)}</div>
        </div>
        <div className="flex gap-2">
          <div className="retro-chip text-gts-cyan">REP {profile.reputation}</div>
          <div className="retro-chip text-gts-pink">{profile.missionsCompleted} JOBS</div>
        </div>
      </div>

      {/* Top-right: minimap + wanted */}
      <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
        <MiniMap size={190} range={75} />
        <WantedStars wanted={wanted} />
        {inVehicle && (
          <div className="retro-panel px-3 py-1.5 text-right">
            <div className="text-[10px] uppercase tracking-widest text-gts-cyan">{inVehicle}</div>
            <div className="text-lg font-bold tabular-nums">{Math.round(speed * 3)} <span className="text-xs">km/h</span></div>
          </div>
        )}
        <div className="pointer-events-auto retro-panel w-[190px] p-2">
          <div className="mb-1 text-[9px] uppercase tracking-widest text-white/45">Graphics</div>
          <div className="grid grid-cols-3 gap-1">
            {(["low", "medium", "retroHigh"] as GraphicsQuality[]).map((q) => (
              <button
                key={q}
                onClick={() => setGraphicsQuality(q)}
                className={`rounded border px-1 py-1 text-[9px] font-bold uppercase ${
                  graphicsQuality === q
                    ? "border-gts-gold bg-gts-gold text-black"
                    : "border-white/10 bg-black/40 text-white/55"
                }`}
              >
                {q === "retroHigh" ? "High" : q}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-white/50">
            <button onClick={() => setCameraZoom(cameraZoom - 0.08)} className="rounded bg-white/10 px-2">-</button>
            <span>Camera {Math.round(cameraZoom * 100)}%</span>
            <button onClick={() => setCameraZoom(cameraZoom + 0.08)} className="rounded bg-white/10 px-2">+</button>
          </div>
        </div>
      </div>

      {/* Mission tracker */}
      {active && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="retro-panel pointer-events-auto absolute left-4 top-1/2 w-72 -translate-y-1/2 border-gts-cyan/60 p-4"
        >
          <div className="text-[10px] uppercase tracking-widest text-gts-cyan">Mission Pager</div>
          <div className="font-mono text-xl font-black uppercase leading-tight text-[#f7ead0]">{active.mission.title}</div>
          <div className="mt-1 text-xs text-white/70">{missionTypeLabel(active.mission.type)}</div>
          <div className="mt-3 border border-black bg-[#1b1a13] p-2 font-mono text-xs text-[#ffefb0] shadow-[3px_3px_0_#000]">
            {active.phase === "to_origin"
              ? "> REACH PICKUP MARKER (GOLD)."
              : "> DELIVER TO OBJECTIVE MARKER (CYAN)."}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="border border-gts-gold/40 bg-black/50 px-2 py-1 font-mono text-gts-gold">+{formatCash(active.mission.reward.cash)}</span>
            <span className="border border-gts-cyan/40 bg-black/50 px-2 py-1 font-mono text-gts-cyan">+{active.mission.reward.xp} XP</span>
            <span className="border border-gts-pink/40 bg-black/50 px-2 py-1 font-mono text-gts-pink">+{active.mission.reward.reputation} REP</span>
            {active.mission.reward.sol > 0 && (
              <span className="border border-gts-teal/40 bg-black/50 px-2 py-1 font-mono text-gts-teal">+{active.mission.reward.sol} SOL</span>
            )}
          </div>
          <button
            onClick={() => useGame.getState().abandonMission()}
            className="mt-3 w-full rounded-lg border border-white/10 py-1.5 text-xs text-white/60 hover:bg-white/5"
          >
            Abandon
          </button>
        </motion.div>
      )}

      {/* Interaction prompt */}
      {landmark && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="retro-panel absolute bottom-28 left-1/2 -translate-x-1/2 border-gts-gold/60 px-4 py-2 text-center"
        >
          <div className="text-sm font-bold text-gts-gold">{landmark.icon} {landmark.name}</div>
          {landmark.enterable ? (
            <div className="text-xs text-white/70">Press <kbd className="rounded bg-white/10 px-1">E</kbd> to enter</div>
          ) : (
            <div className="text-xs text-white/50">{landmark.blurb}</div>
          )}
        </motion.div>
      )}

      {/* Bottom action bar */}
      <div className="pointer-events-auto absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
        <HudButton label="Phone" hint="P" onClick={() => togglePhone()} icon="📱" />
        <HudButton label="Map" hint="M" onClick={() => toggleMap()} icon="🗺️" />
        <HudButton label="Inventory" hint="I" onClick={() => toggleInventory()} icon="🎒" />
        <HudButton label="Style" onClick={() => toggleCharacterCreator()} icon="🧑‍🎤" />
        <Link href="/" className="btn-ghost px-3 py-2 text-xs">Exit</Link>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 hidden font-mono text-[10px] uppercase leading-relaxed text-[#f7ead0]/55 md:block">
        <div><kbd className="text-white/70">WASD</kbd> move • <kbd className="text-white/70">Shift</kbd> run</div>
        <div><kbd className="text-white/70">F</kbd> enter/exit vehicle • <kbd className="text-white/70">E</kbd> interact</div>
      </div>
    </div>
  );
}

function HudButton({ label, hint, onClick, icon }: { label: string; hint?: string; onClick: () => void; icon: string }) {
  return (
    <button onClick={onClick} className="retro-panel group flex flex-col items-center px-3 py-1.5 hover:bg-white/10">
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] tracking-wide text-white/70">
        {label}
        {hint && <span className="ml-1 rounded bg-white/10 px-1 text-white/50">{hint}</span>}
      </span>
    </button>
  );
}

function WantedStars({ wanted }: { wanted: number }) {
  return (
    <div className="retro-panel flex items-center gap-1 px-3 py-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`font-mono text-xl leading-none ${i < wanted ? "text-gts-gold animate-pulseGlow" : "text-black/70"}`}
          style={{
            WebkitTextStroke: "1px #000",
            textShadow: i < wanted ? "2px 2px 0 #000, 0 0 8px #ffd23f" : "1px 1px 0 #000",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
