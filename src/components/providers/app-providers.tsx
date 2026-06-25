"use client";

import { PropsWithChildren } from "react";
import { SolanaWalletProvider } from "@/components/providers/solana-wallet-provider";

export function AppProviders({ children }: PropsWithChildren) {
  return <SolanaWalletProvider>{children}</SolanaWalletProvider>;
}

