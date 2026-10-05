"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  CANVAS_STAR_PX,
  scrollStarStore,
  SCROLL_STAR_COLOR,
} from "@/components/template/main/index/scrollStar/scrollStarStore";

const StarCanvas = dynamic(() => import("@/components/template/main/index/scrollStar/starCanvas"), { ssr: false });

const SIZE = 56;
/** a section header "takes" the star once it is above this line (fraction of the viewport height) */
const ENTER_LINE = 0.72;
const FLY = 4.5;
const FOLLOW = 18;

const supportsWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

const damp = (from: number, to: number, lambda: number, dt: number) =>
  from + (to - from) * (1 - Math.exp(-lambda * dt));

/**
 * One of the hero's stars detaches when you scroll and flies to the header of the section you are looking at
 * (`[data-star-anchor]` in SectionHeader). Scrolling back to the top sends it home into the hero.
 */
export default function ScrollStar() {
  const ref = useRef<HTMLDivElement>(null);
  const spin = useRef(0.6);
  const [mode, setMode] = useState<"pending" | "3d" | "flat">("pending");

  useEffect(() => {
    setMode(supportsWebGL() ? "3d" : "flat");
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || mode === "pending") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pos = { x: -SIZE, y: -SIZE };
    let scale = 1;
    let anchor: Element | null = null;
    let flying = false;
    let shown = false;
    let frame = 0;
    let running = false;
    let last = performance.now();
    let waitingSince = 0;

    const pickAnchor = (): Element | null => {
      const line = window.innerHeight * ENTER_LINE;
      let picked: Element | null = null;
      for (const el of Array.from(document.querySelectorAll("[data-star-anchor]"))) {
        const rect = el.getBoundingClientRect();
        if (rect.width && rect.top <= line) picked = el;
      }
      return picked;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const next = pickAnchor();
      if (next !== anchor) {
        anchor = next;
        flying = true;
      }

      let tx: number;
      let ty: number;
      const home = scrollStarStore.home;
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        tx = rect.left + rect.width / 2;
        ty = rect.top + rect.height / 2;
      } else if (home.valid) {
        tx = home.x;
        ty = home.y;
      } else {
        tx = pos.x;
        ty = pos.y;
      }

      if (anchor && !scrollStarStore.detached) {
        if (home.valid) {
          pos.x = home.x;
          pos.y = home.y;
          scale = home.size / CANVAS_STAR_PX || 1;
        }
        scrollStarStore.setDetached(true);
        shown = true;
      }

      if (reduced) {
        pos.x = tx;
        pos.y = ty;
      } else {
        const lambda = flying ? FLY : FOLLOW;
        pos.x = damp(pos.x, tx, lambda, dt);
        pos.y = damp(pos.y, ty, lambda, dt);
      }

      const targetScale = !anchor && home.valid ? home.size / CANVAS_STAR_PX || 1 : 1;
      scale = reduced ? targetScale : damp(scale, targetScale, flying ? FLY : FOLLOW, dt);

      const distance = Math.hypot(tx - pos.x, ty - pos.y);
      if (flying && distance < 3) flying = false;
      spin.current = reduced ? 0 : distance > 12 ? 2 + Math.min(distance / 40, 10) : 0;

      if (!anchor && scrollStarStore.detached) {
        if (!home.valid) waitingSince ||= now;
        else waitingSince = 0;
        const gaveUp = waitingSince > 0 && now - waitingSince > 1200;
        if ((home.valid && distance < 4) || gaveUp) {
          scrollStarStore.setDetached(false);
          shown = false;
          waitingSince = 0;
        }
      }

      node.style.transform = `translate3d(${pos.x - SIZE / 2}px, ${pos.y - SIZE / 2}px, 0) scale(${shown ? scale : 0.4})`;
      node.style.opacity = shown ? "1" : "0";

      const settled = anchor ? !flying && distance < 0.5 : !scrollStarStore.detached;
      if (settled) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    wake();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    const observer = new MutationObserver(wake);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      observer.disconnect();
      scrollStarStore.setDetached(false);
    };
  }, [mode]);

  return (
    <div
      ref={ref}
      data-scroll-star
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-40 opacity-0 transition-[opacity] duration-300 will-change-transform"
      style={{ width: SIZE, height: SIZE }}
    >
      {mode === "3d" && <StarCanvas spin={spin} />}
      {mode === "flat" && (
        <svg viewBox="0 0 24 24" className="size-full drop-shadow-md">
          <path
            fill={SCROLL_STAR_COLOR}
            d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
          />
        </svg>
      )}
    </div>
  );
}
