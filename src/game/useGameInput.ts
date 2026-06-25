"use client";

import { useEffect } from "react";
import { getWorld } from "./world";
import { useGame } from "@/lib/store";
import { KEYS } from "@/lib/constants";

/**
 * Global keyboard handling for the game. Movement keys feed the world
 * simulation directly (no React re-render); UI keys drive the Zustand store.
 */
export function useGameInput() {
  useEffect(() => {
    const world = getWorld();
    const pressed = new Set<string>();

    const isTyping = () => {
      const el = document.activeElement;
      return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || (el as HTMLElement).isContentEditable);
    };

    const applyMovement = () => {
      const s = useGame.getState();
      if (s.paused) {
        world.input.forward = 0;
        world.input.strafe = 0;
        world.input.run = false;
        return;
      }
      let forward = 0;
      let strafe = 0;
      if (pressed.has("KeyW") || pressed.has("ArrowUp")) forward += 1;
      if (pressed.has("KeyS") || pressed.has("ArrowDown")) forward -= 1;
      if (pressed.has("KeyD") || pressed.has("ArrowRight")) strafe += 1;
      if (pressed.has("KeyA") || pressed.has("ArrowLeft")) strafe -= 1;
      world.input.forward = forward;
      world.input.strafe = strafe;
      world.input.run = pressed.has(KEYS.run);
    };

    const onDown = (e: KeyboardEvent) => {
      if (isTyping()) return;
      const s = useGame.getState();

      // UI toggles (work even when paused so panels can be closed).
      switch (e.code) {
        case KEYS.phone:
          e.preventDefault();
          s.togglePhone();
          return;
        case KEYS.inventory:
          e.preventDefault();
          s.toggleInventory();
          return;
        case KEYS.map:
          e.preventDefault();
          s.toggleMap();
          return;
        case "Escape":
          s.togglePhone(false);
          s.toggleInventory(false);
          s.toggleMap(false);
          s.toggleCharacterCreator(false);
          s.setPaused(false);
          return;
      }

      if (s.paused) return;

      if (e.code === KEYS.enterVehicle) {
        world.wantEnterExit = true;
        return;
      }
      if (e.code === KEYS.interact) {
        // Interact with nearby landmark.
        if (world.currentLandmark) {
          window.dispatchEvent(new CustomEvent("gts:interact", { detail: world.currentLandmark }));
        }
        return;
      }

      pressed.add(e.code);
      applyMovement();
    };

    const onUp = (e: KeyboardEvent) => {
      pressed.delete(e.code);
      applyMovement();
    };

    const onBlur = () => {
      pressed.clear();
      applyMovement();
    };

    // React to pause changes so movement halts immediately when a panel opens.
    const unsub = useGame.subscribe(applyMovement);

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      unsub();
    };
  }, []);
}
