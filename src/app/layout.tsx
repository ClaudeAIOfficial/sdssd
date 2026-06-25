import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SolanaWalletProvider } from '@/components/ui/WalletProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Grand Theft Solana - Open World Browser Game',
  description: 'Complete missions, build your empire, and earn real SOL. An original open-world browser game on Solana.',
  keywords: 'Solana, game, open world, GTS, crypto game, play to earn',
  openGraph: {
    title: 'Grand Theft Solana',
    description: 'Complete missions. Build your empire. Earn SOL.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#020817] text-white antialiased`}>
        <SolanaWalletProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0d1117',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              },
            }}
          />
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
