"use client";

import { useState } from "react";
import { LuRotateCw } from "react-icons/lu";
import ParallaxStage from "@/components/modules/ui/parallaxStage";

const PERKS = [
  { label: "Free shipping", depth: 60, className: "left-6 top-6 sm:left-8 sm:top-8" },
  { label: "−10% birthday", depth: 80, className: "right-6 top-16 sm:right-10 sm:top-20" },
  { label: "Early access", depth: 45, className: "bottom-6 left-8 sm:bottom-10 sm:left-10" },
];

const CARD_THICKNESS = 6;

const face =
  "absolute inset-0 rounded-2xl p-5 text-left text-white shadow-float [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

export default function ClubCard3D({ bare = false }: { bare?: boolean }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <ParallaxStage
      max={14}
      className={
        bare
          ? "h-full min-h-[280px] w-full"
          : "h-full min-h-[320px] w-full overflow-hidden bg-sage-100 dark:bg-sage-900/40"
      }
    >
      <div
        className={`relative flex h-full items-center justify-center [transform-style:preserve-3d] ${bare ? "min-h-[280px]" : "min-h-[320px]"}`}
      >
        <div
          aria-hidden="true"
          className="absolute h-[170px] w-[260px] rounded-2xl bg-white/70 shadow-card sm:h-[190px] sm:w-[300px] dark:bg-white/10"
          style={{ transform: "translateZ(-40px) rotateZ(-12deg)" }}
        />

        <button
          type="button"
          onClick={() => setFlipped((value) => !value)}
          aria-pressed={flipped}
          aria-label={flipped ? "Show the front of the member card" : "Flip the member card to see the perks"}
          className="relative h-[170px] w-[260px] cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-500 sm:h-[190px] sm:w-[300px] [transform-style:preserve-3d]"
          style={{ transform: "translateZ(30px) rotateZ(6deg)" }}
        >
          <span
            className="absolute inset-0 transition-transform duration-700 ease-out motion-reduce:transition-none [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
          >
            {Array.from({ length: CARD_THICKNESS }, (_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl bg-coral-700"
                style={{ transform: `translateZ(${i - CARD_THICKNESS / 2}px)` }}
              />
            ))}

            <span className={`${face} bg-coral-500`} style={{ transform: `translateZ(${CARD_THICKNESS / 2}px)` }}>
              <span className="block text-xs font-semibold opacity-85">Member card</span>
              <span className="mt-1 block font-shabnam-bold text-2xl leading-tight">Set Kids Club</span>
              <span className="mt-5 flex gap-1.5" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="h-2 w-8 rounded-full bg-white/45" />
                ))}
              </span>
              <span className="absolute right-5 bottom-4 left-5 flex items-end justify-between">
                <span className="text-sm opacity-90">Royal customer</span>
                <span className="text-2xl" aria-hidden="true">
                  ★
                </span>
              </span>
              <LuRotateCw className="absolute top-4 right-4 size-4 opacity-70" aria-hidden="true" />
            </span>

            <span
              className={`${face} bg-sage-600`}
              style={{ transform: `rotateY(180deg) translateZ(${CARD_THICKNESS / 2}px)` }}
            >
              <span className="block text-xs font-semibold opacity-85">Member perks</span>
              <span className="mt-3 flex flex-col gap-1.5 text-sm font-semibold">
                {PERKS.map((perk) => (
                  <span key={perk.label} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
                    {perk.label}
                  </span>
                ))}
              </span>
              <span className="absolute right-5 bottom-4 left-5 text-xs opacity-85">Royal customers of Set Kids</span>
            </span>
          </span>
        </button>

        {PERKS.map(({ label, depth, className }) => (
          <span
            key={label}
            aria-hidden="true"
            className={`absolute rounded-full bg-white px-3 py-1.5 text-xs font-bold text-sage-700 shadow-card dark:bg-ink-800 dark:text-sage-300 ${className}`}
            style={{ transform: `translateZ(${depth}px)` }}
          >
            {label}
          </span>
        ))}
      </div>
    </ParallaxStage>
  );
}
