"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { usePlayerSync } from "@/components/wallet/usePlayerSync";

// The wallet provider touches browser-only APIs, so load it client-side only.
const WalletContextProvider = dynamic(
  () => import("./WalletContextProvider").then((m) => m.WalletContextProvider),
  { ssr: false },
);

function PlayerSync() {
  usePlayerSync();
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <WalletContextProvider>
      <PlayerSync />
      {children}
    </WalletContextProvider>
  );
}
