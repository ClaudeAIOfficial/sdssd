"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { useGameInput } from "@/game/useGameInput";
import { HUD } from "@/components/hud/HUD";
import { Phone } from "@/components/hud/Phone";
import { Inventory } from "@/components/hud/Inventory";
import { MapModal } from "@/components/hud/MapModal";
import { LandmarkModal } from "@/components/hud/LandmarkModal";
import { Notifications } from "@/components/hud/Notifications";
import { CharacterCreator } from "@/components/character/CharacterCreator";
import { WalletButton } from "@/components/wallet/WalletButton";

// The 3D world is heavy + browser-only, so load it without SSR.
const GameCanvas = dynamic(
  () => import("@/components/game/GameCanvas").then((m) => m.GameCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gts-bg">
        <div className="display-font animate-pulse text-3xl tracking-widest text-gts-cyan">
          Loading the city…
        </div>
      </div>
    ),
  },
);

export default function PlayPage() {
  const hydrate = useGame((s) => s.hydrate);
  const ensureServerPlayer = useGame((s) => s.ensureServerPlayer);
  const started = useGame((s) => s.started);
  const graphicsQuality = useGame((s) => s.graphicsQuality);
  useGameInput();

  useEffect(() => {
    hydrate();
    // Make sure a backend player record exists (guest or wallet) so that mission
    // completions can be verified and rewarded.
    void ensureServerPlayer();
  }, [hydrate, ensureServerPlayer]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gts-bg">
      <div className="absolute inset-0">
        <GameCanvas />
      </div>

      <HUD />
      <Phone />
      <Inventory />
      <MapModal />
      <LandmarkModal />
      <CharacterCreator />
      <Notifications />
      <div
        className="retro-post-overlay"
        style={{ opacity: graphicsQuality === "low" ? 0.72 : graphicsQuality === "medium" ? 0.55 : 0.38 }}
      />

      <StartOverlay show={!started} />
    </main>
  );
}

function StartOverlay({ show }: { show: boolean }) {
  const setStarted = useGame((s) => s.setStarted);
  const toggleCharacter = useGame((s) => s.toggleCharacterCreator);
  const walletAddress = useGame((s) => s.walletAddress);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-strong w-[min(94vw,560px)] rounded-3xl border border-white/10 p-8 text-center"
          >
            <div className="display-font text-5xl leading-none">
              <span className="neon-text">GRAND THEFT</span>{" "}
              <span className="bg-gradient-to-r from-gts-cyan to-gts-gold bg-clip-text text-transparent">SOLANA</span>
            </div>
            <p className="mt-3 text-white/70">
              Welcome to the city, hustler. Take jobs, dodge the cops, and earn your reputation.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-left text-xs text-white/60">
              <ControlRow keys="WASD" desc="Move around" />
              <ControlRow keys="Shift" desc="Sprint" />
              <ControlRow keys="F" desc="Enter / exit vehicle" />
              <ControlRow keys="E" desc="Interact / enter building" />
              <ControlRow keys="P" desc="Open phone" />
              <ControlRow keys="M / I" desc="Map / Inventory" />
            </div>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button onClick={() => setStarted(true)} className="btn-primary text-lg">▶ Enter City</button>
              <WalletButton variant="cyan" />
              <button onClick={() => toggleCharacter(true)} className="btn-ghost">🧑‍🎤 Customize</button>
            </div>
            <div className="mt-4 text-[11px] text-white/40">
              {walletAddress ? "Wallet connected — verified SOL rewards enabled." : "Tip: connect a wallet to earn verified SOL."}
            </div>
            <Link href="/" className="mt-3 inline-block text-xs text-white/40 hover:text-white">← Back to home</Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ControlRow({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center gap-2">
      <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white/80">{keys}</kbd>
      <span>{desc}</span>
    </div>
  );
}
