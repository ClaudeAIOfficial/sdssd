"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { GameCanvas } from "@/components/game/GameCanvas";
import { Hud } from "@/components/game/Hud";
import { PhoneUi } from "@/components/game/PhoneUi";
import { CityAudio } from "@/components/game/CityAudio";
import { cityLandmarks, vehicleCatalog } from "@/lib/gameData";
import { useGameStore } from "@/lib/store";

function distance(a: [number, number], b: [number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function GameShell({ onExit }: { onExit: () => void }) {
  const { publicKey, connected } = useWallet();
  const syncPlayer = useGameStore((state) => state.syncPlayer);
  const setWalletAddress = useGameStore((state) => state.setWalletAddress);
  const loadMissions = useGameStore((state) => state.loadMissions);
  const loadLeaderboard = useGameStore((state) => state.loadLeaderboard);
  const position = useGameStore((state) => state.position);
  const missions = useGameStore((state) => state.missions);
  const activeMission = useGameStore((state) => state.activeMission);
  const startMission = useGameStore((state) => state.startMission);
  const completeMission = useGameStore((state) => state.completeMission);
  const enterVehicle = useGameStore((state) => state.enterVehicle);
  const isDriving = useGameStore((state) => state.isDriving);
  const togglePhone = useGameStore((state) => state.togglePhone);
  const pushNotification = useGameStore((state) => state.pushNotification);

  useEffect(() => {
    void loadMissions();
    void loadLeaderboard();
  }, [loadLeaderboard, loadMissions]);

  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toBase58();
      setWalletAddress(walletAddress);
      void syncPlayer(walletAddress);
    }
  }, [connected, publicKey, setWalletAddress, syncPlayer]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const key = event.key.toLowerCase();
      if (key === "p") {
        togglePhone();
        return;
      }

      if (key !== "e") return;
      if (activeMission && distance(position, activeMission.target) < 10) {
        void completeMission();
        return;
      }

      const nearbyMission = missions.find((mission) => distance(position, mission.start) < 10);
      if (nearbyMission) {
        void startMission(nearbyMission);
        return;
      }

      const landmark = cityLandmarks.find((item) => distance(position, item.position) < 9);
      if (landmark) {
        pushNotification(`Entered ${landmark.name}: ${landmark.kind} services available on the phone.`, "info");
        return;
      }

      enterVehicle(isDriving ? null : vehicleCatalog[0]);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeMission, completeMission, enterVehicle, isDriving, missions, position, pushNotification, startMission, togglePhone]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <GameCanvas />
      <Hud onExit={onExit} />
      <PhoneUi />
      <CityAudio />
      <div className="pointer-events-none absolute bottom-3 right-3 z-20 hidden rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-300 sm:block">
        WASD move - Shift run - E interact - P phone - Q exit vehicle
      </div>
    </main>
  );
}
