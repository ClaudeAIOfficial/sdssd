"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/store";

export function CityAudio() {
  const [enabled, setEnabled] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const isDriving = useGameStore((state) => state.isDriving);
  const activeMission = useGameStore((state) => state.activeMission);

  useEffect(() => {
    if (!enabled) return;
    const context = new AudioContext();
    contextRef.current = context;
    const master = context.createGain();
    master.gain.value = 0.16;
    master.connect(context.destination);

    const pad = context.createOscillator();
    pad.type = "sine";
    pad.frequency.value = 110;
    const padGain = context.createGain();
    padGain.gain.value = 0.18;
    pad.connect(padGain).connect(master);
    pad.start();

    const pulse = context.createOscillator();
    pulse.type = "triangle";
    pulse.frequency.value = 55;
    const pulseGain = context.createGain();
    pulseGain.gain.value = 0.1;
    pulse.connect(pulseGain).connect(master);
    pulse.start();

    const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * 0.25;
    }
    const ambience = context.createBufferSource();
    ambience.buffer = noiseBuffer;
    ambience.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 620;
    const ambienceGain = context.createGain();
    ambienceGain.gain.value = 0.22;
    ambience.connect(filter).connect(ambienceGain).connect(master);
    ambience.start();

    nodesRef.current = [pad, pulse, ambience, master];
    return () => {
      pad.stop();
      pulse.stop();
      ambience.stop();
      context.close().catch(() => undefined);
      nodesRef.current = [];
      contextRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    const context = contextRef.current;
    if (!enabled || !context) return;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = isDriving ? "sawtooth" : "square";
    osc.frequency.value = isDriving ? 86 : 210;
    gain.gain.value = isDriving ? 0.03 : 0.012;
    osc.connect(gain).connect(context.destination);
    osc.start();
    const timer = window.setTimeout(() => {
      osc.stop();
      osc.disconnect();
      gain.disconnect();
    }, isDriving ? 600 : 90);
    return () => window.clearTimeout(timer);
  }, [enabled, isDriving]);

  useEffect(() => {
    const context = contextRef.current;
    if (!enabled || !context || !activeMission) return;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "triangle";
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(context.destination);
    osc.start();
    osc.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
    window.setTimeout(() => osc.stop(), 520);
  }, [activeMission, enabled]);

  return (
    <button
      onClick={() => setEnabled((value) => !value)}
      className="absolute bottom-14 right-3 z-30 rounded-full border border-white/10 bg-slate-950/70 p-3 text-white backdrop-blur transition hover:bg-white/10 sm:bottom-16"
      title="Toggle synthesized music, ambience, vehicle, and footstep audio"
    >
      {enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  );
}
