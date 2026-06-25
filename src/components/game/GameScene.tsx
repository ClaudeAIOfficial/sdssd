'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import City from './City';
import Player from './Player';
import NPCs from './NPCs';
import Vehicles from './Vehicles';
import MissionMarkers from './MissionMarkers';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useGameStore } from '@/store/gameStore';
import HUD from '../hud/HUD';
import PhoneUI from '../hud/PhoneUI';
import CharacterCustomizer from '../ui/CharacterCustomizer';

function DayNightCycle() {
  const setTimeOfDay = useGameStore((s) => s.setTimeOfDay);
  const timeOfDayRef = useRef(0.3);

  // Slowly advance time
  useEffect(() => {
    const interval = setInterval(() => {
      timeOfDayRef.current = (timeOfDayRef.current + 0.0001) % 1;
      setTimeOfDay(timeOfDayRef.current);
    }, 100);
    return () => clearInterval(interval);
  }, [setTimeOfDay]);

  return null;
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#020817]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="text-white font-bold">Loading City...</div>
      </div>
    </div>
  );
}

export default function GameScene() {
  const keys = useKeyboard();
  const togglePhone = useGameStore((s) => s.togglePhone);
  const timeOfDay = useGameStore((s) => s.timeOfDay);

  const isNight = timeOfDay < 0.25 || timeOfDay > 0.8;

  return (
    <div className="fixed inset-0 bg-[#020817]">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows
          camera={{ position: [0, 8, -12], fov: 65, near: 0.1, far: 500 }}
          gl={{ antialias: true, alpha: false }}
          performance={{ min: 0.5 }}
        >
          {isNight && (
            <Stars radius={200} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          )}

          <DayNightCycle />

          <Suspense fallback={null}>
            <City />
            <Player keys={keys} onPhoneToggle={() => {}} />
            <NPCs />
            <Vehicles />
            <MissionMarkers />
          </Suspense>
        </Canvas>
      </Suspense>

      {/* 2D UI overlay */}
      <HUD />
      <PhoneUI />
      <CharacterCustomizer />
    </div>
  );
}
