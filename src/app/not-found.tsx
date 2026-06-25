'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-8xl font-black text-purple-500 mb-4"
        >
          404
        </motion.div>
        <h1 className="text-2xl font-bold text-white mb-2">Lost in the city</h1>
        <p className="text-white/50 mb-8">This location doesn&apos;t exist on the map.</p>
        <Link
          href="/"
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          Back to HQ
        </Link>
      </div>
    </div>
  );
}
