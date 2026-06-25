import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grand Theft Solana — Complete missions. Build your empire. Earn SOL.",
  description:
    "Grand Theft Solana (GTS) is an original top-down open-world Web3 browser game. Run missions across a neon city and earn real SOL through verified missions.",
  keywords: ["Solana", "Web3 game", "browser game", "GTS", "play to earn", "GameFi"],
};

export const viewport: Viewport = {
  themeColor: "#0a0612",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-gts-bg text-white antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
