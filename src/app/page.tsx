import { GtsWalletProvider } from "@/components/wallet-context";
import { GtsGame } from "@/components/gts-game";

export default function Home() {
  return (
    <GtsWalletProvider>
      <GtsGame />
    </GtsWalletProvider>
  );
}
