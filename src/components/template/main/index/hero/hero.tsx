"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useHeroMode } from "@/components/template/main/index/hero/useHeroMode";
import { ROUTES } from "@/utils/constants";

const HeroScene = dynamic(() => import("@/components/template/main/index/hero/heroScene"), { ssr: false });

const STATIC_BLOCKS = [
  { letter: "K", className: "bg-sage-400 -rotate-6" },
  { letter: "I", className: "bg-coral-400 rotate-3" },
  { letter: "D", className: "bg-mint-400 -rotate-2" },
  { letter: "S", className: "bg-peach-400 rotate-6" },
];

function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 16" fill="none" preserveAspectRatio="xMinYMid meet" aria-hidden="true" className={className}>
      <path
        d="M2 9c10-8 20 8 30 0s20-8 30 0 20 8 30 0 16-6 26-1"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StaticArt() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-16 md:pb-24" aria-hidden="true">
      <span className="absolute top-[18%] left-[14%] size-16 rounded-full bg-coral-300 shadow-float sm:size-20" />
      <span className="absolute top-[10%] right-[16%] size-12 rounded-full bg-sky-300 shadow-float sm:size-16" />
      <div className="flex gap-2 sm:gap-3">
        {STATIC_BLOCKS.map(({ letter, className }) => (
          <span
            key={letter}
            className={`flex size-14 items-center justify-center rounded-2xl text-3xl font-extrabold text-white shadow-float ring-4 ring-white/50 sm:size-20 sm:text-5xl ${className}`}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const { mode, reducedMotion, compact } = useHeroMode();

  return (
    <section aria-labelledby="hero-heading" className="full-bleed overflow-hidden bg-white dark:bg-ink-900">
      <div className="container-x grid min-h-[640px] grid-rows-[auto_1fr] items-center gap-4 md:min-h-[560px] md:grid-cols-2 md:grid-rows-1 md:gap-10 lg:min-h-[620px]">
        <div className="relative z-10 flex flex-col items-start pt-10 md:pt-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-coral-600 shadow-card ring-1 ring-coral-100 dark:bg-ink-800 dark:text-coral-300 dark:ring-white/10">
            <span className="size-2 rounded-full bg-sage-400" aria-hidden="true" />
            Sizes 0–14
          </span>

          <h1
            id="hero-heading"
            className="mt-4 max-w-[13ch] font-shabnam-bold text-[2.1rem] leading-[1.08] tracking-tight text-text-dark sm:text-5xl lg:text-6xl dark:text-gray-100"
          >
            Play-ready clothes for every age
          </h1>

          <Squiggle className="mt-3 h-3 w-28 text-coral-300 sm:w-36" />

          <p className="mt-4 max-w-[40ch] text-[15px] leading-7 text-gray-700 sm:text-base dark:text-gray-400">
            Soft fabrics, easy fits and colors kids love — from first steps to fourteen.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href={`${ROUTES.products}?sort=latest`} className="btn btn-lg btn-primary btn-pop">
              Shop new arrivals
            </Link>
            <Link
              href={ROUTES.products}
              className="border-b-2 border-dashed border-coral-300 pb-0.5 text-sm font-semibold text-text transition-colors hover:border-solid hover:text-coral-600 dark:text-gray-300"
            >
              All products
            </Link>
          </div>
        </div>

        <div className="relative h-full min-h-[300px] sm:min-h-[360px]">
          <div
            aria-hidden="true"
            className="absolute inset-x-2 top-6 bottom-0 rounded-t-[999px] bg-sage-100 md:top-12 dark:bg-sage-500/15"
          >
            <span className="absolute inset-0 rounded-t-[999px] bg-[radial-gradient(circle,rgb(255_255_255/0.7)_1.5px,transparent_1.6px)] bg-[length:22px_22px] opacity-70 dark:opacity-10" />
          </div>

          {mode === "3d" && <HeroScene reducedMotion={reducedMotion} compact={compact} />}
          {mode === "static" && <StaticArt />}
        </div>
      </div>
    </section>
  );
}
