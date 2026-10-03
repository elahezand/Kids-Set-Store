"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import { LuPercent } from "react-icons/lu";


const SALE_HREF = "/products?onSale=true";

const THRESHOLD = 90;
const MAX_PULL = 150; 
const CLICK_SLOP = 6; 

/* the further you pull, the harder it gets (feels like elastic) */
const resist = (distance: number) => MAX_PULL * (1 - Math.exp(-distance / MAX_PULL));

export default function SaleCord() {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const startY = useRef<number | null>(null);
  const moved = useRef(false);
  const armed = useRef(false);

  // the page is usually ready before the cord is released
  useEffect(() => {
    router.prefetch(SALE_HREF);
  }, [router]);

  const go = () => {
    setLeaving(true);
    setPull(MAX_PULL);
    router.push(SALE_HREF);
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (leaving) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    startY.current = event.clientY;
    moved.current = false;
    armed.current = false;
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (startY.current === null) return;
    const distance = Math.max(0, event.clientY - startY.current);
    if (distance > CLICK_SLOP) moved.current = true;

    const next = resist(distance);
    setPull(next);

    const isArmed = next >= THRESHOLD;
    if (isArmed && !armed.current) navigator.vibrate?.(12);
    armed.current = isArmed;
  };

  const onPointerUp = () => {
    if (startY.current === null) return;
    startY.current = null;
    setDragging(false);

    if (!moved.current) return go(); 
    if (armed.current) return go();
    setPull(0);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      go();
    }
  };

  const ready = pull >= THRESHOLD;

  return (
    <div className="pointer-events-none absolute top-0 right-4 z-20 sm:right-10 lg:right-16">
      <div
        className={`flex origin-top flex-col items-center ${dragging || pull > 0 ? "" : "motion-safe:animate-sway"}`}
      >
        <span
          aria-hidden="true"
          className={`block w-1 rounded-b-full [--rope:40px] sm:w-[5px] sm:[--rope:72px] lg:[--rope:96px] ${
            dragging ? "" : "transition-[height] duration-500 ease-[cubic-bezier(.34,1.56,.64,1)]"
          }`}
          style={{
            height: `calc(var(--rope) + ${pull}px)`,
            backgroundImage:
              "repeating-linear-gradient(160deg, var(--color-coral-400) 0 5px, var(--color-sage-300) 5px 10px)",
          }}
        />

        {/* the tag you grab */}
        <button
          type="button"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          aria-label="Pull down to see products on sale"
          className={`pointer-events-auto relative -mt-px flex touch-none flex-col items-center rounded-2xl px-3 pt-3 pb-2.5 text-white shadow-float transition-[transform,background-color] duration-200 select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-500 sm:px-4 ${
            dragging ? "scale-105 cursor-grabbing" : "cursor-grab hover:-rotate-3"
          } ${ready ? "bg-sage-600" : "bg-coral-500"}`}
        >
          {/* the hole the cord goes through */}
          <span
            aria-hidden="true"
            className="absolute -top-1.5 size-3 rounded-full border-2 border-white/80 bg-white/30"
          />
          <LuPercent className="size-5 sm:size-6" aria-hidden="true" />
          <span className="mt-0.5 text-sm font-extrabold tracking-wider sm:text-base">SALE</span>
          <span className="mt-0.5 text-[10px] font-medium whitespace-nowrap opacity-90 sm:text-xs">
            {leaving ? "Let's go!" : ready ? "Let go!" : "Pull me"}
          </span>
        </button>
      </div>
    </div>
  );
}
