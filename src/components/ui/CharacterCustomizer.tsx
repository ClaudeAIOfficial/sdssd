'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { X, Check } from 'lucide-react';

const SKIN_TONES = [
  { id: '#FDBCB4', label: 'Light' },
  { id: '#F4C88E', label: 'Tan' },
  { id: '#d4a17d', label: 'Medium' },
  { id: '#c68642', label: 'Brown' },
  { id: '#8d5524', label: 'Dark' },
];

const HAIR_STYLES = [
  { id: 'short', label: 'Short', color: '#1c1917' },
  { id: 'long', label: 'Long', color: '#1c1917' },
  { id: 'blonde', label: 'Blonde', color: '#fbbf24' },
  { id: 'red', label: 'Red', color: '#ef4444' },
  { id: 'bald', label: 'Bald', color: 'transparent' },
];

const CLOTHES_STYLES = [
  { id: 'casual', label: 'Casual', color: '#3b82f6' },
  { id: 'suit', label: 'Suit', color: '#1e293b' },
  { id: 'streetwear', label: 'Street', color: '#7c3aed' },
  { id: 'hoodie', label: 'Hoodie', color: '#374151' },
];

const SHOE_STYLES = [
  { id: 'sneakers', label: 'Sneakers', color: '#0f172a' },
  { id: 'boots', label: 'Boots', color: '#78350f' },
  { id: 'heels', label: 'Heels', color: '#be123c' },
  { id: 'slides', label: 'Slides', color: '#0369a1' },
];

export default function CharacterCustomizer() {
  const { player, updatePlayerStats, showCharacterCustomizer, setShowCharacterCustomizer } = useGameStore();

  if (!showCharacterCustomizer) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-[#0d1117] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(139, 92, 246, 0.2)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-black text-2xl">Character</h2>
            <button
              onClick={() => setShowCharacterCustomizer(false)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Character preview */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-b from-purple-900/30 to-transparent rounded-2xl p-8">
              {/* Simple 2D character preview */}
              <div className="flex flex-col items-center" style={{ transform: 'scale(3)', transformOrigin: 'top center', height: 80 }}>
                {/* Head */}
                <div
                  className="w-5 h-5 rounded-sm mb-0.5 relative"
                  style={{ backgroundColor: player.skin_tone }}
                >
                  {/* Hair */}
                  <div
                    className="absolute -top-1.5 left-0 right-0 h-2 rounded-sm"
                    style={{
                      backgroundColor:
                        player.hair_style === 'blonde' ? '#fbbf24' :
                        player.hair_style === 'red' ? '#ef4444' :
                        player.hair_style === 'bald' ? 'transparent' :
                        '#1c1917'
                    }}
                  />
                </div>
                {/* Body */}
                <div
                  className="w-7 h-8 rounded-sm"
                  style={{
                    backgroundColor:
                      player.clothes_style === 'suit' ? '#1e293b' :
                      player.clothes_style === 'streetwear' ? '#7c3aed' :
                      player.clothes_style === 'hoodie' ? '#374151' :
                      '#3b82f6'
                  }}
                />
                {/* Legs */}
                <div className="flex gap-0.5">
                  <div className="w-2.5 h-4 bg-slate-800 rounded-sm" />
                  <div className="w-2.5 h-4 bg-slate-800 rounded-sm" />
                </div>
                {/* Shoes */}
                <div className="flex gap-0.5">
                  <div
                    className="w-3 h-1.5 rounded-sm"
                    style={{
                      backgroundColor:
                        player.shoes_style === 'boots' ? '#78350f' :
                        player.shoes_style === 'heels' ? '#be123c' :
                        player.shoes_style === 'slides' ? '#0369a1' :
                        '#0f172a'
                    }}
                  />
                  <div
                    className="w-3 h-1.5 rounded-sm"
                    style={{
                      backgroundColor:
                        player.shoes_style === 'boots' ? '#78350f' :
                        player.shoes_style === 'heels' ? '#be123c' :
                        player.shoes_style === 'slides' ? '#0369a1' :
                        '#0f172a'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customization options */}
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {/* Skin tone */}
            <div>
              <div className="text-white/50 text-xs uppercase tracking-widest mb-2">Skin Tone</div>
              <div className="flex gap-2 flex-wrap">
                {SKIN_TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updatePlayerStats({ skin_tone: t.id })}
                    className={`w-10 h-10 rounded-full border-2 transition-all relative ${
                      player.skin_tone === t.id ? 'border-white scale-110' : 'border-transparent hover:border-white/40'
                    }`}
                    style={{ backgroundColor: t.id }}
                    title={t.label}
                  >
                    {player.skin_tone === t.id && (
                      <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair style */}
            <div>
              <div className="text-white/50 text-xs uppercase tracking-widest mb-2">Hair Style</div>
              <div className="flex gap-2 flex-wrap">
                {HAIR_STYLES.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => updatePlayerStats({ hair_style: h.id })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${
                      player.hair_style === h.id
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clothes */}
            <div>
              <div className="text-white/50 text-xs uppercase tracking-widest mb-2">Clothes</div>
              <div className="flex gap-2 flex-wrap">
                {CLOTHES_STYLES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updatePlayerStats({ clothes_style: c.id })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${
                      player.clothes_style === c.id
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shoes */}
            <div>
              <div className="text-white/50 text-xs uppercase tracking-widest mb-2">Shoes</div>
              <div className="flex gap-2 flex-wrap">
                {SHOE_STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => updatePlayerStats({ shoes_style: s.id })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${
                      player.shoes_style === s.id
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCharacterCustomizer(false)}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl transition-colors"
          >
            Save Character
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
