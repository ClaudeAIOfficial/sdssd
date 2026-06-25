"use client";

import { useEffect, useRef } from "react";

type AudioEngineProps = {
  enabled: boolean;
  moving: boolean;
  driving: boolean;
  missionCompleteKey: string | null;
};

export function AudioEngine({ enabled, moving, driving, missionCompleteKey }: AudioEngineProps) {
  const contextRef = useRef<AudioContext | null>(null);
  const ambienceGainRef = useRef<GainNode | null>(null);
  const driveGainRef = useRef<GainNode | null>(null);
  const stepIntervalRef = useRef<number | null>(null);
  const missionChimeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (!contextRef.current) {
      const context = new AudioContext();
      const ambienceGain = context.createGain();
      ambienceGain.gain.value = 0.02;
      ambienceGain.connect(context.destination);

      const drone = context.createOscillator();
      drone.type = "triangle";
      drone.frequency.value = 90;
      drone.connect(ambienceGain);
      drone.start();

      const driveGain = context.createGain();
      driveGain.gain.value = 0;
      driveGain.connect(context.destination);

      const driveOsc = context.createOscillator();
      driveOsc.type = "sawtooth";
      driveOsc.frequency.value = 55;
      driveOsc.connect(driveGain);
      driveOsc.start();

      contextRef.current = context;
      ambienceGainRef.current = ambienceGain;
      driveGainRef.current = driveGain;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !contextRef.current || !driveGainRef.current) {
      return;
    }
    const driveGain = driveGainRef.current;
    driveGain.gain.setTargetAtTime(driving ? 0.06 : 0, contextRef.current.currentTime, 0.08);
  }, [driving, enabled]);

  useEffect(() => {
    if (!enabled || !contextRef.current) {
      return;
    }
    if (!moving || driving) {
      if (stepIntervalRef.current) {
        window.clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
      return;
    }

    const context = contextRef.current;
    stepIntervalRef.current = window.setInterval(() => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "square";
      osc.frequency.value = 160 + Math.random() * 80;
      gain.gain.value = 0.02;
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start();
      osc.stop(context.currentTime + 0.06);
    }, 230);

    return () => {
      if (stepIntervalRef.current) {
        window.clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
    };
  }, [enabled, moving, driving]);

  useEffect(() => {
    if (!enabled || !contextRef.current || !missionCompleteKey || missionChimeRef.current === missionCompleteKey) {
      return;
    }
    missionChimeRef.current = missionCompleteKey;
    const context = contextRef.current;
    const tones = [523, 659, 784];
    tones.forEach((tone, index) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.value = tone;
      gain.gain.value = 0.07;
      osc.connect(gain);
      gain.connect(context.destination);
      const start = context.currentTime + index * 0.09;
      osc.start(start);
      osc.stop(start + 0.11);
    });
  }, [enabled, missionCompleteKey]);

  return null;
}

