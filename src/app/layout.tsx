import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grand Theft Solana",
  description: "Complete missions. Build your empire. Earn SOL.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#090b1f"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
