"use client";

import { useMemo, useState } from "react";
import { LeaderboardEntry, MissionDefinition, MissionReward, Vec2 } from "@/lib/types";
import { formatCompact, formatWallet } from "@/lib/utils";

type PhonePanelProps = {
  walletAddress?: string;
  missions: MissionDefinition[];
  activeMissionId?: string;
  missionTarget?: Vec2;
  leaderboard: LeaderboardEntry[];
  lastReward: MissionReward | null;
  rewardHistory: Array<{
    reward_id: string;
    status: string;
    sol: number;
    cash: number;
    created_at: string;
    transaction_signature?: string | null;
  }>;
  onAcceptMission: (missionId: string) => void;
  onClaimReward: () => void;
};

const tabs = ["Map", "Contacts", "Leaderboard", "Wallet", "Missions", "Settings"] as const;
type Tab = (typeof tabs)[number];

export function PhonePanel({
  walletAddress,
  missions,
  activeMissionId,
  missionTarget,
  leaderboard,
  lastReward,
  rewardHistory,
  onAcceptMission,
  onClaimReward,
}: PhonePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Map");
  const activeMission = useMemo(
    () => missions.find((mission) => mission.id === activeMissionId),
    [missions, activeMissionId],
  );

  return (
    <div className="absolute right-4 top-4 z-30 h-[560px] w-[360px] overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950/80 p-3 text-white shadow-[0_0_30px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="rounded-[1.65rem] border border-white/10 bg-black/35 p-3">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">GTS Phone</p>
            <p className="text-sm font-semibold">{formatWallet(walletAddress)}</p>
          </div>
          <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-300">ONLINE</span>
        </header>

        <nav className="mb-3 grid grid-cols-3 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
              className={`rounded-lg px-2 py-1.5 text-xs transition ${
                activeTab === tab ? "bg-cyan-400 text-slate-900" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <section className="h-[435px] overflow-y-auto pr-1 text-sm">
          {activeTab === "Map" && (
            <div className="space-y-3">
              <h3 className="font-semibold text-cyan-300">Live Objective</h3>
              {activeMission ? (
                <>
                  <p>{activeMission.title}</p>
                  <p className="text-slate-300">{activeMission.description}</p>
                </>
              ) : (
                <p className="text-slate-400">No active mission. Accept one from Missions tab.</p>
              )}
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-xs text-slate-400">Mission marker</p>
                {missionTarget ? (
                  <p>
                    X: {missionTarget.x.toFixed(1)} • Z: {missionTarget.z.toFixed(1)}
                  </p>
                ) : (
                  <p className="text-slate-400">No marker set.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "Contacts" && (
            <ul className="space-y-2">
              {["Milo Broker", "Taxi Dispatch", "Officer Rey", "Mechanic June", "Casino Host"].map(
                (contact) => (
                  <li key={contact} className="rounded-lg bg-white/10 px-3 py-2">
                    {contact}
                  </li>
                ),
              )}
            </ul>
          )}

          {activeTab === "Leaderboard" && (
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <p className="text-slate-400">Leaderboard syncing...</p>
              ) : (
                leaderboard.slice(0, 10).map((entry, idx) => (
                  <div key={entry.walletAddress} className="rounded-lg bg-white/10 px-3 py-2">
                    <p className="text-xs text-slate-400">#{idx + 1}</p>
                    <p className="font-semibold">{formatWallet(entry.walletAddress)}</p>
                    <p className="text-xs text-slate-300">
                      REP {formatCompact(entry.reputation)} • CASH ${formatCompact(entry.cash)} • SOL{" "}
                      {entry.solEarned.toFixed(4)}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "Wallet" && (
            <div className="space-y-3">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-xs text-slate-400">Wallet Address</p>
                <p className="break-all text-xs">{walletAddress ?? "Connect a wallet."}</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-xs text-slate-400">Latest Reward</p>
                {lastReward ? (
                  <p>
                    +${lastReward.cash} • +{lastReward.xp} XP • SOL {lastReward.sol.toFixed(4)}
                  </p>
                ) : (
                  <p className="text-slate-400">No rewards yet.</p>
                )}
              </div>
              <button
                type="button"
                className="w-full rounded-lg bg-fuchsia-500 px-3 py-2 font-semibold text-white hover:bg-fuchsia-400"
                onClick={onClaimReward}
              >
                Claim Rewards
              </button>

              <div className="rounded-lg bg-white/10 p-3">
                <p className="mb-2 text-xs text-slate-400">Transaction History</p>
                {rewardHistory.length === 0 ? (
                  <p className="text-xs text-slate-400">No transactions yet.</p>
                ) : (
                  <div className="space-y-1">
                    {rewardHistory.slice(0, 5).map((entry) => (
                      <div key={entry.reward_id} className="rounded-md bg-black/25 px-2 py-1 text-xs">
                        <p>
                          {entry.status} • ${entry.cash} • {entry.sol.toFixed(4)} SOL
                        </p>
                        <p className="text-slate-400">
                          {new Date(entry.created_at).toLocaleString()}
                          {entry.transaction_signature
                            ? ` • ${entry.transaction_signature.slice(0, 10)}...`
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "Missions" && (
            <div className="space-y-2">
              {missions.slice(0, 8).map((mission) => (
                <div key={mission.id} className="rounded-lg bg-white/10 p-3">
                  <p className="font-semibold text-cyan-300">{mission.title}</p>
                  <p className="text-xs text-slate-300">{mission.description}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Diff {mission.difficulty} • ETA {mission.expectedSeconds}s
                  </p>
                  <button
                    onClick={() => onAcceptMission(mission.id)}
                    disabled={Boolean(activeMissionId)}
                    type="button"
                    className="mt-2 rounded-md bg-emerald-500 px-2 py-1 text-xs font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {activeMissionId ? "Mission Active" : "Accept"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Settings" && (
            <ul className="space-y-2 text-slate-300">
              <li className="rounded-lg bg-white/10 px-3 py-2">Audio: Enabled</li>
              <li className="rounded-lg bg-white/10 px-3 py-2">Graphics: Low Poly Ultra</li>
              <li className="rounded-lg bg-white/10 px-3 py-2">Controls: WASD, Shift, E, F, P</li>
              <li className="rounded-lg bg-white/10 px-3 py-2">Mobile mode: Supported</li>
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

