"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { getLandmark, type LandmarkKind } from "@/lib/cityData";
import { getWorld } from "@/game/world";
import { VEHICLE, type VehicleKind } from "@/lib/constants";
import { formatCash } from "@/lib/economy";

// Context menu shown when the player presses E near an enterable landmark.
export function LandmarkModal() {
  const [openId, setOpenId] = useState<LandmarkKind | null>(null);
  const setPaused = useGame((s) => s.setPaused);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail as LandmarkKind;
      const lm = getLandmark(id);
      if (lm?.enterable) {
        setOpenId(id);
        setPaused(true);
      }
    };
    window.addEventListener("gts:interact", handler);
    return () => window.removeEventListener("gts:interact", handler);
  }, [setPaused]);

  const close = () => {
    setOpenId(null);
    setPaused(false);
  };

  const lm = openId ? getLandmark(openId) : undefined;

  return (
    <AnimatePresence>
      {lm && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-[min(94vw,440px)] rounded-3xl border p-6"
            style={{ borderColor: `${lm.color}55` }}
          >
            <div className="mb-1 text-4xl">{lm.icon}</div>
            <h2 className="display-font text-3xl tracking-wide" style={{ color: lm.color }}>{lm.name}</h2>
            <p className="mt-1 text-sm text-white/60">{lm.blurb}</p>
            <div className="mt-5 space-y-2">
              <LandmarkActions id={lm.id} onDone={close} />
            </div>
            <button onClick={close} className="btn-ghost mt-4 w-full text-sm">Leave</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ActionButton({ label, sub, onClick }: { label: string; sub?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left hover:bg-white/10"
    >
      <span className="text-sm font-semibold">{label}</span>
      {sub && <span className="text-xs text-white/50">{sub}</span>}
    </button>
  );
}

function LandmarkActions({ id, onDone }: { id: LandmarkKind; onDone: () => void }) {
  const game = useGame();

  switch (id) {
    case "bank":
      return (
        <>
          <ActionButton
            label="Daily stipend"
            sub="+$100"
            onClick={() => {
              game.addCash(100);
              game.notify({ title: "Bank", body: "Collected a $100 stipend.", kind: "success" });
              onDone();
            }}
          />
          <ActionButton label="Net worth" sub={formatCash(game.profile.cash)} onClick={() => {}} />
        </>
      );
    case "casino":
      return <Casino onDone={onDone} />;
    case "gas":
      return (
        <ActionButton
          label="Buy energy snack"
          sub="$20"
          onClick={() => {
            if (game.spendCash(20)) {
              game.addItem({ id: "food", name: "Energy Bar", icon: "🍫", qty: 1, kind: "food", description: "A quick snack." });
              game.notify({ title: "PumpFuel", body: "Bought a snack.", kind: "success" });
            }
            onDone();
          }}
        />
      );
    case "warehouse":
      return (
        <ActionButton
          label="Grab a quick job"
          sub="auto-accept"
          onClick={() => {
            if (game.active) {
              game.notify({ title: "Finish your current job first", kind: "warn" });
            } else {
              game.refreshMissions();
              const first = useGame.getState().available[0];
              if (first) game.acceptMission(first.id);
            }
            onDone();
          }}
        />
      );
    case "garage":
      return <Garage onDone={onDone} />;
    case "apartments":
      return (
        <ActionButton
          label="Buy this apartment"
          sub="$5,000"
          onClick={() => {
            if (game.spendCash(5000)) {
              game.notify({ title: "Property purchased!", body: "Palm Heights is now your safehouse spawn.", kind: "reward" });
            }
            onDone();
          }}
        />
      );
    case "safehouse":
      return (
        <>
          <ActionButton
            label="Change your look"
            onClick={() => {
              game.toggleCharacterCreator(true);
            }}
          />
          <ActionButton
            label="Rest & save"
            sub="+25 XP"
            onClick={() => {
              game.setProfile({ xp: game.profile.xp + 25 });
              game.notify({ title: "Rested", body: "Progress saved. +25 XP", kind: "success" });
              onDone();
            }}
          />
        </>
      );
    default:
      return <div className="text-sm text-white/50">Nothing to do here right now.</div>;
  }
}

function Casino({ onDone }: { onDone: () => void }) {
  const game = useGame();
  const [bet, setBet] = useState(100);
  const [result, setResult] = useState<string | null>(null);

  const play = () => {
    if (!game.spendCash(bet)) return;
    const win = Math.random() < 0.46;
    if (win) {
      game.addCash(bet * 2);
      setResult(`🎉 You won ${formatCash(bet * 2)}!`);
      game.notify({ title: "Neon Royale", body: `Won ${formatCash(bet * 2)}!`, kind: "reward" });
    } else {
      setResult(`💸 House wins. Lost ${formatCash(bet)}.`);
      game.notify({ title: "Neon Royale", body: `Lost ${formatCash(bet)}.`, kind: "warn" });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {[100, 250, 500].map((b) => (
          <button
            key={b}
            onClick={() => setBet(b)}
            className={`flex-1 rounded-lg py-2 text-sm ${bet === b ? "bg-gts-gold text-black" : "bg-white/5"}`}
          >
            {formatCash(b)}
          </button>
        ))}
      </div>
      <ActionButton label="Spin (double or nothing)" sub={`bet ${formatCash(bet)}`} onClick={play} />
      {result && <div className="rounded-lg bg-white/5 p-2 text-center text-sm">{result}</div>}
    </div>
  );
}

function Garage({ onDone }: { onDone: () => void }) {
  const game = useGame();
  const kinds = Object.keys(VEHICLE) as VehicleKind[];
  const summon = (kind: VehicleKind) => {
    const world = getWorld();
    // Move the matching drivable vehicle next to the player.
    const veh = world.vehicles.find((v) => v.drivable && v.kind === kind);
    if (veh) {
      veh.x = world.player.x + 3;
      veh.z = world.player.z;
      veh.speed = 0;
      game.notify({ title: "Volt Garage", body: `${VEHICLE[kind].label} delivered outside.`, kind: "success" });
    }
    onDone();
  };
  return (
    <div className="space-y-2">
      {kinds.map((k) => (
        <ActionButton key={k} label={VEHICLE[k].label} sub="summon" onClick={() => summon(k)} />
      ))}
    </div>
  );
}
