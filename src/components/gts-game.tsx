"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import {
  Backpack,
  Banknote,
  Car,
  Crown,
  ClipboardCheck,
  Footprints,
  Gauge,
  Map,
  Menu,
  Phone,
  Shield,
  Sparkles,
  Star,
  User,
  Volume2,
  Wallet,
  X
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { cityLandmarks, defaultEconomy, missionTemplates, seedLeaderboard, vehicles } from "@/lib/game-data";
import type { CurrencyLedger, LeaderboardRow, Mission, VehicleKind } from "@/lib/types";
import { useGameStore } from "@/store/game-store";
import { ConnectWalletButton } from "@/components/wallet-context";

const swatches = {
  hair: ["#161223", "#5a2d0c", "#f7c948", "#0f172a", "#e11d48"],
  clothes: ["#14f195", "#9945ff", "#ff4fd8", "#2de2e6", "#f97316"],
  shoes: ["#ffffff", "#0f172a", "#ffb000", "#94a3b8", "#a3ff12"],
  skinTone: ["#6b3f2a", "#935f3e", "#b87850", "#d6a06d", "#f2c6a0"]
};

const buildingColors = ["#29304f", "#1e2f51", "#31245b", "#3b2552", "#193447", "#442750"];

function useAudioEngine() {
  const [enabled, setEnabled] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const humRef = useRef<OscillatorNode | null>(null);

  const toggle = useCallback(() => {
    if (!contextRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      contextRef.current = new AudioContextClass();
    }

    const context = contextRef.current;

    if (!enabled) {
      const hum = context.createOscillator();
      const gain = context.createGain();
      hum.type = "sine";
      hum.frequency.value = 74;
      gain.gain.value = 0.025;
      hum.connect(gain);
      gain.connect(context.destination);
      hum.start();
      humRef.current = hum;
      setEnabled(true);
    } else {
      humRef.current?.stop();
      humRef.current = null;
      setEnabled(false);
    }
  }, [enabled]);

  const ping = useCallback(() => {
    const context = contextRef.current;
    if (!context || !enabled) return;

    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + 0.25);
  }, [enabled]);

  return { enabled, toggle, ping };
}

function useKeyboard() {
  const keys = useRef(new Set<string>());
  const togglePhone = useGameStore((state) => state.togglePhone);
  const toggleVehicle = useGameStore((state) => state.toggleVehicle);
  const addWantedStar = useGameStore((state) => state.addWantedStar);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keys.current.add(event.key.toLowerCase());

      if (!event.repeat && event.key.toLowerCase() === "p") togglePhone();
      if (!event.repeat && event.key.toLowerCase() === "e") toggleVehicle();
      if (!event.repeat && event.key.toLowerCase() === "x") addWantedStar();
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [addWantedStar, togglePhone, toggleVehicle]);

  return keys;
}

function Road({ position, scale }: { position: [number, number, number]; scale: [number, number, number] }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color="#14182f" roughness={0.72} />
    </mesh>
  );
}

function PalmTree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.08, 0.13, 1.3, 6]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      {[0, 1, 2, 3].map((leaf) => (
        <mesh key={leaf} position={[0, 1.35, 0]} rotation={[0.35, (Math.PI / 2) * leaf, 0.75]}>
          <coneGeometry args={[0.16, 1.05, 4]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
      ))}
    </group>
  );
}

function Building({ index, x, z }: { index: number; x: number; z: number }) {
  const height = 1.4 + ((index * 1.73) % 4.2);
  const width = 1.6 + ((index * 0.61) % 1.8);

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, width * 0.85]} />
        <meshStandardMaterial color={buildingColors[index % buildingColors.length]} roughness={0.66} metalness={0.12} />
      </mesh>
      {Array.from({ length: Math.floor(height * 2) }).map((_, floor) => (
        <mesh key={floor} position={[0, 0.45 + floor * 0.42, width * 0.431]}>
          <boxGeometry args={[width * 0.64, 0.08, 0.02]} />
          <meshStandardMaterial color={floor % 2 === 0 ? "#2de2e6" : "#ff4fd8"} emissive="#111827" />
        </mesh>
      ))}
    </group>
  );
}

function Landmark({ landmark }: { landmark: (typeof cityLandmarks)[number] }) {
  return (
    <group position={[landmark.position[0], 0, landmark.position[1]]}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.7, 1.7, 0.16, 24]} />
        <meshStandardMaterial color={landmark.color} emissive={landmark.color} emissiveIntensity={0.22} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2.2, 1.8, 1.6]} />
        <meshStandardMaterial color={landmark.color} roughness={0.44} />
      </mesh>
    </group>
  );
}

function CharacterModel({ cosmetics, inVehicle }: { cosmetics: { hair: string; clothes: string; shoes: string; skinTone: string }; inVehicle: boolean }) {
  if (inVehicle) {
    return null;
  }

  return (
    <group>
      <mesh position={[0, 0.92, 0]} castShadow>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color={cosmetics.skinTone} />
      </mesh>
      <mesh position={[0, 1.12, -0.02]} castShadow>
        <coneGeometry args={[0.23, 0.22, 8]} />
        <meshStandardMaterial color={cosmetics.hair} />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[0.42, 0.58, 0.25]} />
        <meshStandardMaterial color={cosmetics.clothes} />
      </mesh>
      <mesh position={[-0.13, 0.1, 0]} castShadow>
        <boxGeometry args={[0.14, 0.22, 0.18]} />
        <meshStandardMaterial color={cosmetics.shoes} />
      </mesh>
      <mesh position={[0.13, 0.1, 0]} castShadow>
        <boxGeometry args={[0.14, 0.22, 0.18]} />
        <meshStandardMaterial color={cosmetics.shoes} />
      </mesh>
    </group>
  );
}

function VehicleModel({ vehicleId }: { vehicleId: VehicleKind }) {
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId) ?? vehicles[0];
  const isBike = vehicleId === "motorcycle";

  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={isBike ? [0.5, 0.35, 1.1] : [0.9, 0.42, 1.35]} />
        <meshStandardMaterial color={vehicle.color} metalness={0.25} roughness={0.34} />
      </mesh>
      {!isBike && (
        <mesh position={[0, 0.65, -0.12]} castShadow>
          <boxGeometry args={[0.62, 0.32, 0.55]} />
          <meshStandardMaterial color="#0f172a" roughness={0.18} metalness={0.2} />
        </mesh>
      )}
      {[-0.38, 0.38].map((x) =>
        [-0.42, 0.42].map((z) => (
          <mesh key={`${x}-${z}`} position={[isBike ? 0 : x, 0.15, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.1, 12]} />
            <meshStandardMaterial color="#050816" />
          </mesh>
        ))
      )}
    </group>
  );
}

function PlayerController({ keys }: { keys: React.MutableRefObject<Set<string>> }) {
  const ref = useRef<THREE.Group>(null);
  const setPosition = useGameStore((state) => state.setPosition);
  const tickWorld = useGameStore((state) => state.tickWorld);
  const position = useGameStore((state) => state.position);
  const inVehicle = useGameStore((state) => state.inVehicle);
  const selectedVehicle = useGameStore((state) => state.selectedVehicle);
  const cosmetics = useGameStore((state) => state.player.cosmetics);

  useFrame((_, delta) => {
    const current = keys.current;
    const direction = new THREE.Vector2(0, 0);
    if (current.has("w") || current.has("arrowup")) direction.y -= 1;
    if (current.has("s") || current.has("arrowdown")) direction.y += 1;
    if (current.has("a") || current.has("arrowleft")) direction.x -= 1;
    if (current.has("d") || current.has("arrowright")) direction.x += 1;

    if (direction.lengthSq() > 0) {
      direction.normalize();
      const vehicle = vehicles.find((candidate) => candidate.id === selectedVehicle);
      const runBoost = current.has("shift") ? 1.45 : 1;
      const speed = inVehicle ? (vehicle?.speed ?? 1.4) * 1.15 : 1.05 * runBoost;
      const next: [number, number] = [
        THREE.MathUtils.clamp(position[0] + direction.x * speed * delta, -29, 29),
        THREE.MathUtils.clamp(position[1] + direction.y * speed * delta, -23, 23)
      ];
      setPosition(next);
      if (ref.current) ref.current.rotation.y = Math.atan2(direction.x, direction.y);
    }

    tickWorld(delta);
  });

  return (
    <group ref={ref} position={[position[0], 0, position[1]]}>
      <CharacterModel cosmetics={cosmetics} inVehicle={inVehicle} />
      {inVehicle && <VehicleModel vehicleId={selectedVehicle} />}
      <pointLight position={[0, 2.5, 0]} color="#14f195" intensity={0.9} distance={5} />
    </group>
  );
}

function TrafficAndNpcs() {
  const wantedStars = useGameStore((state) => state.player.wantedStars);

  return (
    <>
      {Array.from({ length: 12 }).map((_, index) => (
        <MovingNpc key={`npc-${index}`} index={index} />
      ))}
      {Array.from({ length: 8 }).map((_, index) => (
        <MovingCar key={`car-${index}`} index={index} police={false} />
      ))}
      {Array.from({ length: wantedStars }).map((_, index) => (
        <MovingCar key={`police-${index}`} index={index + 20} police />
      ))}
    </>
  );
}

function MovingNpc({ index }: { index: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * (0.18 + index * 0.006) + index;
    const radius = 7 + (index % 5) * 3.5;
    if (ref.current) {
      ref.current.position.set(Math.cos(t) * radius, 0, Math.sin(t * 0.8) * (radius * 0.65));
      ref.current.rotation.y = -t;
    }
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.28, 0.7, 0.22]} />
        <meshStandardMaterial color={index % 3 === 0 ? "#2de2e6" : index % 3 === 1 ? "#ff4fd8" : "#a3ff12"} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.17, 8, 8]} />
        <meshStandardMaterial color="#b87850" />
      </mesh>
    </group>
  );
}

function MovingCar({ index, police }: { index: number; police: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const lane = (index % 6) - 2.5;
    const t = (clock.elapsedTime * (police ? 1.2 : 0.72) + index * 5) % 52;
    if (!ref.current) return;

    if (index % 2 === 0) {
      ref.current.position.set(t - 26, 0, lane * 4);
      ref.current.rotation.y = Math.PI / 2;
    } else {
      ref.current.position.set(lane * 5, 0, t - 26);
      ref.current.rotation.y = 0;
    }
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.86, 0.36, 1.25]} />
        <meshStandardMaterial color={police ? "#f8fafc" : index % 2 === 0 ? "#ff4fd8" : "#14f195"} />
      </mesh>
      <mesh position={[0, 0.53, 0]}>
        <boxGeometry args={[0.58, 0.18, 0.48]} />
        <meshStandardMaterial color={police ? "#2563eb" : "#0f172a"} emissive={police ? "#2563eb" : "#000000"} />
      </mesh>
    </group>
  );
}

function CityScene({ keys }: { keys: React.MutableRefObject<Set<string>> }) {
  const dayTime = useGameStore((state) => state.dayTime);
  const activeMission = useGameStore((state) => state.activeMission?.mission);
  const nightBlend = Math.max(0, Math.cos(dayTime * Math.PI * 2));
  const buildings = useMemo(
    () =>
      Array.from({ length: 54 }).map((_, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const x = -24 + col * 6;
        const z = -17 + row * 6;
        return { index, x: x + ((index * 13) % 3) - 1, z: z + ((index * 7) % 3) - 1 };
      }),
    []
  );

  return (
    <>
      <color attach="background" args={[nightBlend > 0.2 ? "#090b1f" : "#6dd3ff"]} />
      <ambientLight intensity={0.62 - nightBlend * 0.22} />
      <directionalLight position={[8, 18, 9]} intensity={1.25 - nightBlend * 0.3} castShadow />
      <pointLight position={[0, 7, 0]} color="#ff4fd8" intensity={nightBlend * 2.4} distance={36} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[64, 52]} />
        <meshStandardMaterial color="#0b1027" />
      </mesh>
      {[-18, -6, 6, 18].map((z) => (
        <Road key={`east-${z}`} position={[0, 0.02, z]} scale={[62, 0.04, 2.2]} />
      ))}
      {[-24, -12, 0, 12, 24].map((x) => (
        <Road key={`north-${x}`} position={[x, 0.03, 0]} scale={[2.2, 0.04, 50]} />
      ))}
      {buildings.map((building) => (
        <Building key={building.index} {...building} />
      ))}
      {cityLandmarks.map((landmark) => (
        <Landmark key={landmark.name} landmark={landmark} />
      ))}
      {Array.from({ length: 24 }).map((_, index) => (
        <PalmTree key={index} x={-29 + (index % 12) * 5.2} z={index < 12 ? -22.5 : 21.5} />
      ))}
      {activeMission && (
        <group position={[activeMission.target[0], 0, activeMission.target[1]]}>
          <mesh position={[0, 0.1, 0]}>
            <torusGeometry args={[1.1, 0.08, 8, 28]} />
            <meshStandardMaterial color="#14f195" emissive="#14f195" emissiveIntensity={0.9} />
          </mesh>
          <pointLight color="#14f195" intensity={2.6} distance={9} />
        </group>
      )}
      <TrafficAndNpcs />
      <PlayerController keys={keys} />
    </>
  );
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="glass flex items-center gap-2 rounded-full px-3 py-2 text-sm">
      <span className="text-neon-cyan">{icon}</span>
      <span className="text-slate-400">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function distance(a: [number, number], b: [number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function Hud({ onMissionSound }: { onMissionSound: () => void }) {
  const { publicKey } = useWallet();
  const player = useGameStore((state) => state.player);
  const activeMission = useGameStore((state) => state.activeMission);
  const startMission = useGameStore((state) => state.startMission);
  const completeMissionClient = useGameStore((state) => state.completeMissionClient);
  const failMission = useGameStore((state) => state.failMission);
  const position = useGameStore((state) => state.position);
  const inVehicle = useGameStore((state) => state.inVehicle);
  const toggleVehicle = useGameStore((state) => state.toggleVehicle);
  const togglePhone = useGameStore((state) => state.togglePhone);
  const selectedVehicle = useGameStore((state) => state.selectedVehicle);
  const addWantedStar = useGameStore((state) => state.addWantedStar);
  const [notice, setNotice] = useState("Talk to an NPC or choose a mission to begin.");
  const missionDistance = activeMission ? distance(position, activeMission.mission.target) : 0;
  const canRequestVerification =
    !!activeMission &&
    missionDistance < 4.8 &&
    activeMission.distanceTravelled >= activeMission.mission.distanceRequired &&
    Date.now() - activeMission.startedAt >= activeMission.mission.minDurationSeconds * 1000;

  const verifyMission = async () => {
    if (!activeMission) return;

    const response = await fetch("/api/missions/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attempt: {
          missionId: activeMission.mission.id,
          startedAt: activeMission.startedAt,
          completedAt: Date.now(),
          distanceTravelled: activeMission.distanceTravelled,
          maxSpeed: activeMission.maxSpeed,
          walletAddress: publicKey?.toBase58() ?? player.walletAddress,
          playerPosition: position
        },
        completedMissionIds: player.completedMissions
      })
    });
    const result = (await response.json()) as { ok: boolean; reason?: string; rewards?: CurrencyLedger; mission?: Mission };

    if (result.ok && result.rewards && result.mission) {
      completeMissionClient(result.rewards, result.mission.id);
      setNotice(`Mission verified: +$${result.rewards.cash}, +${result.rewards.reputation} rep, +${result.rewards.sol} SOL.`);
      onMissionSound();
    } else {
      setNotice(result.reason ?? "Mission verification failed.");
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <StatPill icon={<Banknote size={16} />} label="Cash" value={`$${player.ledger.cash.toLocaleString()}`} />
          <StatPill icon={<Wallet size={16} />} label="SOL" value={player.ledger.sol.toFixed(4)} />
          <StatPill icon={<Sparkles size={16} />} label="XP" value={player.ledger.xp} />
          <StatPill icon={<Crown size={16} />} label="Rep" value={player.ledger.reputation} />
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="glass rounded-full px-3 py-2 text-sm">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={index < player.wantedStars ? "inline fill-neon-amber text-neon-amber" : "inline text-slate-600"}
                size={16}
              />
            ))}
          </div>
          <button onClick={togglePhone} className="glass rounded-full p-3 text-neon-cyan transition hover:scale-105">
            <Phone size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
        <div className="glass pointer-events-auto w-full max-w-md rounded-3xl p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neon-cyan">Current job</p>
              <h3 className="text-xl font-black">{activeMission?.mission.title ?? "Free roam"}</h3>
            </div>
            <ClipboardCheck className="text-neon-pink" />
          </div>
          <p className="text-sm text-slate-300">{activeMission?.mission.description ?? notice}</p>
          {activeMission && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-300">
              <span>Target {missionDistance.toFixed(1)}u</span>
              <span>Route {activeMission.distanceTravelled.toFixed(0)}u</span>
              <span>Reward ${activeMission.mission.rewards.cash}</span>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {!activeMission && (
              <button onClick={() => startMission()} className="rounded-full bg-solana-green px-4 py-2 text-sm font-black text-night">
                Accept random mission
              </button>
            )}
            {activeMission && (
              <>
                <button
                  disabled={!canRequestVerification}
                  onClick={verifyMission}
                  className="rounded-full bg-solana-green px-4 py-2 text-sm font-black text-night disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                >
                  Verify completion
                </button>
                <button onClick={failMission} className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white">
                  Drop mission
                </button>
              </>
            )}
          </div>
        </div>

        <div className="glass pointer-events-auto rounded-3xl p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold">
            {inVehicle ? <Car size={18} /> : <Footprints size={18} />}
            {inVehicle ? `Driving ${vehicles.find((vehicle) => vehicle.id === selectedVehicle)?.name}` : "On foot"}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button onClick={toggleVehicle} className="rounded-2xl bg-white/10 px-3 py-2 hover:bg-white/20">
              E: {inVehicle ? "Exit" : "Drive"}
            </button>
            <button onClick={addWantedStar} className="rounded-2xl bg-red-500/80 px-3 py-2 font-bold hover:bg-red-400">
              X: Crime
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneUi() {
  const phoneOpen = useGameStore((state) => state.phoneOpen);
  const togglePhone = useGameStore((state) => state.togglePhone);
  const player = useGameStore((state) => state.player);
  const activeMission = useGameStore((state) => state.activeMission);
  const startMission = useGameStore((state) => state.startMission);
  const selectVehicle = useGameStore((state) => state.selectVehicle);
  const buyVehicle = useGameStore((state) => state.buyVehicle);
  const selectedVehicle = useGameStore((state) => state.selectedVehicle);
  const [tab, setTab] = useState("map");
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>(seedLeaderboard);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (!phoneOpen) return;
    fetch("/api/leaderboard")
      .then((response) => response.json())
      .then((rows: LeaderboardRow[]) => setLeaderboard(rows))
      .catch(() => setLeaderboard(seedLeaderboard));
  }, [phoneOpen]);

  const claimRewards = () => {
    setHistory((entries) => [`${new Date().toLocaleTimeString()} requested ${player.ledger.sol.toFixed(4)} SOL claim review`, ...entries].slice(0, 8));
  };

  return (
    <AnimatePresence>
      {phoneOpen && (
        <motion.div
          initial={{ opacity: 0, x: 80, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.95 }}
          className="absolute right-4 top-20 z-40 w-[min(420px,calc(100vw-2rem))] rounded-[2rem] border border-white/20 bg-night/95 p-3 shadow-panel"
        >
          <div className="mb-3 flex items-center justify-between px-2">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-neon-cyan">Neon phone</p>
              <h2 className="text-2xl font-black">{player.handle}</h2>
            </div>
            <button onClick={togglePhone} className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <X size={18} />
            </button>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2 text-xs font-bold md:grid-cols-6">
            {[
              ["map", Map],
              ["contacts", User],
              ["leaders", Crown],
              ["wallet", Wallet],
              ["missions", ClipboardCheck],
              ["settings", Menu]
            ].map(([name, Icon]) => (
              <button
                key={name as string}
                onClick={() => setTab(name as string)}
                className={`rounded-2xl px-2 py-2 capitalize transition ${tab === name ? "bg-solana-green text-night" : "bg-white/10 hover:bg-white/20"}`}
              >
                <Icon className="mx-auto mb-1" size={16} />
                {name as string}
              </button>
            ))}
          </div>

          <div className="min-h-80 rounded-[1.4rem] bg-white/[0.06] p-4">
            {tab === "map" && (
              <div>
                <h3 className="mb-3 font-black">City map</h3>
                <div className="relative h-56 rounded-2xl border border-white/10 bg-asphalt">
                  {cityLandmarks.map((landmark) => (
                    <span
                      key={landmark.name}
                      className="absolute h-3 w-3 rounded-full shadow-neon"
                      style={{
                        left: `${((landmark.position[0] + 30) / 60) * 100}%`,
                        top: `${((landmark.position[1] + 24) / 48) * 100}%`,
                        background: landmark.color
                      }}
                      title={landmark.name}
                    />
                  ))}
                  {activeMission && (
                    <span
                      className="absolute h-5 w-5 animate-ping rounded-full bg-solana-green"
                      style={{
                        left: `${((activeMission.mission.target[0] + 30) / 60) * 100}%`,
                        top: `${((activeMission.mission.target[1] + 24) / 48) * 100}%`
                      }}
                    />
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-300">Markers include shops, bank, garage, safehouse, police, harbor, casino, and active missions.</p>
              </div>
            )}

            {tab === "contacts" && (
              <div className="space-y-3">
                {["Mira the Broker", "Captain Vega", "Jax Garage", "Sol Bank Desk"].map((contact, index) => (
                  <button
                    key={contact}
                    onClick={() => startMission(missionTemplates[index])}
                    className="w-full rounded-2xl bg-white/10 p-3 text-left hover:bg-white/20"
                  >
                    <strong>{contact}</strong>
                    <p className="text-sm text-slate-300">Tap to accept a verified city job.</p>
                  </button>
                ))}
              </div>
            )}

            {tab === "leaders" && (
              <div className="space-y-2">
                {leaderboard.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-2xl bg-white/10 p-3 text-sm">
                    <strong>#{index + 1}</strong>
                    <span>{row.handle}</span>
                    <span className="text-neon-cyan">{row.reputation} rep</span>
                  </div>
                ))}
              </div>
            )}

            {tab === "wallet" && (
              <div className="space-y-4">
                <ConnectWalletButton />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <span className="text-slate-400">In-game SOL</span>
                    <strong className="block text-2xl">{player.ledger.sol.toFixed(4)}</strong>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <span className="text-slate-400">Cash</span>
                    <strong className="block text-2xl">${player.ledger.cash}</strong>
                  </div>
                </div>
                <button onClick={claimRewards} className="w-full rounded-full bg-solana-green px-4 py-3 font-black text-night">
                  Claim Rewards
                </button>
                <div className="space-y-2 text-xs text-slate-300">
                  {(history.length ? history : ["No reward claims yet. Backend review signs all payouts."]).map((entry) => (
                    <p key={entry} className="rounded-xl bg-black/20 p-2">
                      {entry}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {tab === "missions" && (
              <div className="space-y-2">
                {missionTemplates.map((mission) => (
                  <button key={mission.id} onClick={() => startMission(mission)} className="w-full rounded-2xl bg-white/10 p-3 text-left hover:bg-white/20">
                    <div className="flex items-center justify-between gap-2">
                      <strong>{mission.title}</strong>
                      <span className="text-neon-cyan">${mission.rewards.cash}</span>
                    </div>
                    <p className="text-sm text-slate-300">{mission.description}</p>
                  </button>
                ))}
              </div>
            )}

            {tab === "settings" && (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-black">Garage</h3>
                  <div className="grid gap-2">
                    {vehicles.map((vehicle) => {
                      const owned = player.ownedVehicles.includes(vehicle.id);
                      return (
                        <button
                          key={vehicle.id}
                          onClick={() => (owned ? selectVehicle(vehicle.id) : buyVehicle(vehicle.id))}
                          className={`rounded-2xl p-3 text-left ${selectedVehicle === vehicle.id ? "bg-solana-green text-night" : "bg-white/10 hover:bg-white/20"}`}
                        >
                          <div className="flex justify-between">
                            <strong>{vehicle.name}</strong>
                            <span>{owned ? "Owned" : `$${vehicle.price}`}</span>
                          </div>
                          <p className="text-xs opacity-75">Speed {vehicle.speed} / Handling {vehicle.handling}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CharacterCustomizer() {
  const cosmetics = useGameStore((state) => state.player.cosmetics);
  const updateCosmetics = useGameStore((state) => state.updateCosmetics);

  return (
    <div className="glass rounded-3xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <User className="text-neon-cyan" size={18} />
        <h3 className="font-black">Character</h3>
      </div>
      {(Object.keys(swatches) as Array<keyof typeof swatches>).map((part) => (
        <div key={part} className="mb-3">
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-slate-400">{part}</p>
          <div className="flex gap-2">
            {swatches[part].map((color) => (
              <button
                key={color}
                onClick={() => updateCosmetics({ [part]: color })}
                className={`h-7 w-7 rounded-full border-2 ${cosmetics[part] === color ? "border-white" : "border-transparent"}`}
                style={{ background: color }}
                aria-label={`Set ${part} to ${color}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminPanel() {
  const [passcode, setPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [economy, setEconomy] = useState(defaultEconomy);
  const [logs, setLogs] = useState<string[]>(["Admin log stream online."]);
  const startMission = useGameStore((state) => state.startMission);
  const coolWantedLevel = useGameStore((state) => state.coolWantedLevel);
  const expectedPasscode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE ?? "gts-admin";

  const unlock = () => {
    const ok = passcode === expectedPasscode;
    setUnlocked(ok);
    setLogs((entries) => [`${new Date().toLocaleTimeString()} ${ok ? "admin unlocked" : "failed admin login"}`, ...entries]);
  };

  if (!unlocked) {
    return (
      <div className="glass rounded-3xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="text-neon-amber" size={18} />
          <h3 className="font-black">Admin Panel</h3>
        </div>
        <input
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          type="password"
          placeholder="Admin passcode"
          className="mb-2 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-neon-cyan"
        />
        <button onClick={unlock} className="w-full rounded-full bg-neon-amber px-4 py-2 font-black text-night">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <Shield className="text-neon-amber" size={18} />
        <h3 className="font-black">Admin Panel</h3>
      </div>
      <div className="grid gap-2 text-sm">
        <label className="grid gap-1">
          Cash multiplier
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={economy.cashMultiplier}
            onChange={(event) => setEconomy({ ...economy, cashMultiplier: Number(event.target.value) })}
            className="rounded-xl bg-black/20 px-3 py-2"
          />
        </label>
        <label className="grid gap-1">
          Active event
          <input
            value={economy.activeEvent}
            onChange={(event) => setEconomy({ ...economy, activeEvent: event.target.value })}
            className="rounded-xl bg-black/20 px-3 py-2"
          />
        </label>
        <button
          onClick={() => {
            startMission(missionTemplates[Math.floor(Math.random() * missionTemplates.length)]);
            setLogs((entries) => [`${new Date().toLocaleTimeString()} spawned city event: ${economy.activeEvent}`, ...entries]);
          }}
          className="rounded-full bg-solana-purple px-4 py-2 font-bold"
        >
          Spawn Event
        </button>
        <button
          onClick={() => {
            coolWantedLevel();
            setLogs((entries) => [`${new Date().toLocaleTimeString()} reduced wanted level after review`, ...entries]);
          }}
          className="rounded-full bg-white/10 px-4 py-2 font-bold"
        >
          Approve Reward / Cool Police
        </button>
      </div>
      <div className="mt-3 max-h-28 overflow-y-auto rounded-2xl bg-black/20 p-2 text-xs text-slate-300">
        {logs.map((log) => (
          <p key={log}>{log}</p>
        ))}
      </div>
    </div>
  );
}

function Landing({ onPlay, onLeaderboard }: { onPlay: () => void; onLeaderboard: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-night/70 p-4 scanline"
    >
      <motion.div
        animate={{ x: [0, 28, -18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute left-10 top-20 h-4 w-20 rounded-full bg-neon-pink shadow-neon"
      />
      <motion.div
        animate={{ x: [0, -32, 22, 0], y: [0, 12, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute right-20 top-28 h-3 w-28 rounded-full bg-neon-cyan shadow-neon"
      />
      <motion.div
        animate={{ y: [0, -22, 0], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute right-1/4 top-14 text-5xl"
      >
        🚁
      </motion.div>
      <div className="glass relative max-w-5xl rounded-[2.4rem] p-8 text-center md:p-12">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-solana-green">Original low-poly Web3 sandbox</p>
        <h1 className="neon-text text-5xl font-black uppercase leading-none tracking-tight md:text-8xl">
          Grand Theft
          <span className="block bg-gradient-to-r from-solana-green via-neon-cyan to-solana-purple bg-clip-text text-transparent">Solana</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-200 md:text-2xl">Complete missions. Build your empire. Earn SOL.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button onClick={onPlay} className="rounded-full bg-solana-green px-8 py-4 font-black text-night shadow-neon transition hover:scale-105">
            Play Now
          </button>
          <ConnectWalletButton />
          <button onClick={onLeaderboard} className="rounded-full border border-white/20 px-8 py-4 font-black text-white transition hover:bg-white/10">
            Leaderboard
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function GtsGame() {
  const keys = useKeyboard();
  const [started, setStarted] = useState(false);
  const togglePhone = useGameStore((state) => state.togglePhone);
  const phoneOpen = useGameStore((state) => state.phoneOpen);
  const { enabled, toggle, ping } = useAudioEngine();

  return (
    <main className="relative min-h-screen overflow-hidden bg-night">
      <div className="absolute left-4 top-4 z-30 flex items-center gap-3">
        <div className="glass rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.24em] text-neon-cyan">GTS</div>
        <button onClick={toggle} className="glass rounded-full p-3 text-neon-cyan" aria-label="Toggle city audio">
          <Volume2 size={18} className={enabled ? "text-solana-green" : "text-slate-400"} />
        </button>
      </div>
      <div className="h-screen w-screen">
        <Canvas shadows camera={{ position: [0, 35, 28], fov: 45, rotation: [-0.85, 0, 0] }}>
          <CityScene keys={keys} />
        </Canvas>
      </div>
      <Hud onMissionSound={ping} />
      <PhoneUi />
      <div className="pointer-events-auto absolute bottom-4 right-4 z-30 hidden w-80 space-y-3 xl:block">
        <CharacterCustomizer />
        <AdminPanel />
      </div>
      <div className="absolute left-4 top-20 z-30 hidden rounded-2xl bg-black/30 p-3 text-xs text-slate-300 md:block">
        <div className="mb-1 flex items-center gap-2 font-bold text-white">
          <Gauge size={14} /> Controls
        </div>
        WASD/Arrows move, Shift run, E drive, P phone, X trigger crime
      </div>
      <AnimatePresence>
        {!started && (
          <Landing
            onPlay={() => setStarted(true)}
            onLeaderboard={() => {
              setStarted(true);
              if (!phoneOpen) togglePhone();
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
