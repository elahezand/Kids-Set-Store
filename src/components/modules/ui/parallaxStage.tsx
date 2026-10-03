"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

interface ParallaxStageProps {
  children: ReactNode;
  className?: string;
  max?: number;
}

export default function ParallaxStage({ children, className = "", max = 10 }: ParallaxStageProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const enabled = useRef(false);

  useEffect(() => {
    enabled.current =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const scene = sceneRef.current;
    if (!scene || !enabled.current || event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    scene.style.transform = `rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
  };

  const reset = () => {
    if (sceneRef.current) sceneRef.current.style.transform = "";
  };

  return (
    <div onPointerMove={onPointerMove} onPointerLeave={reset} className={`[perspective:1000px] ${className}`}>
      <div
        ref={sceneRef}
        className="relative h-full w-full transition-transform duration-300 ease-out [transform-style:preserve-3d]"
      >
        {children}
      </div>
    </div>
  );
}
