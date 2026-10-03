"use client";

import { useEffect, useState } from "react";

export type HeroMode = "pending" | "3d" | "static";

interface HeroEnvironment {
  mode: HeroMode;
  reducedMotion: boolean;
  compact: boolean;
}

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

const supportsWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

const isLowPower = () => {
  const nav = navigator as NavigatorWithHints;
  if (nav.connection?.saveData) return true;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return true;
  return navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2;
};

export function useHeroMode(): HeroEnvironment {
  const [env, setEnv] = useState<HeroEnvironment>({ mode: "pending", reducedMotion: false, compact: false });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(max-width: 767px)").matches;
    const mode: HeroMode = supportsWebGL() && !isLowPower() ? "3d" : "static";
    setEnv({ mode, reducedMotion, compact });
  }, []);

  return env;
}
