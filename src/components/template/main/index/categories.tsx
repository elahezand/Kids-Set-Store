import Link from "next/link";
import type { ReactNode } from "react";
import SectionHeader from "@/components/modules/main/sectionHeader";
import { ROUTES } from "@/utils/constants";
import type { CategoryNode } from "@/types";

const TINTS = [
  { bg: "bg-coral-50 dark:bg-coral-500/10", motif: "text-coral-200 dark:text-coral-500/30", letter: "text-coral-500" },
  { bg: "bg-sky-50 dark:bg-sky-500/10", motif: "text-sky-200 dark:text-sky-500/30", letter: "text-sky-500" },
  { bg: "bg-sun-50 dark:bg-sun-500/10", motif: "text-sun-200 dark:text-sun-500/30", letter: "text-sun-500" },
  { bg: "bg-mint-50 dark:bg-mint-500/10", motif: "text-mint-200 dark:text-mint-500/30", letter: "text-mint-500" },
  { bg: "bg-sage-50 dark:bg-sage-500/10", motif: "text-sage-200 dark:text-sage-500/30", letter: "text-sage-500" },
];

const MOTIFS: ReactNode[] = [
  <g key="rings" fill="none" stroke="currentColor" strokeWidth="4">
    <circle cx="32" cy="32" r="38" />
    <circle cx="32" cy="32" r="28" />
    <circle cx="32" cy="32" r="18" />
  </g>,
  <g key="dots" fill="currentColor">
    {Array.from({ length: 25 }, (_, i) => (
      <circle key={i} cx={8 + (i % 5) * 12} cy={8 + Math.floor(i / 5) * 12} r="2.5" />
    ))}
  </g>,
  <g key="waves" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    {[18, 32, 46].map((y) => (
      <path key={y} d={`M-4 ${y} Q4 ${y - 7} 12 ${y} T28 ${y} T44 ${y} T60 ${y} T76 ${y}`} />
    ))}
  </g>,
  <g key="petals" fill="currentColor">
    {Array.from({ length: 6 }, (_, i) => (
      <ellipse key={i} cx="32" cy="15" rx="7" ry="13" transform={`rotate(${i * 60} 32 32)`} />
    ))}
  </g>,
  <g key="stripes" stroke="currentColor" strokeWidth="4">
    {Array.from({ length: 9 }, (_, i) => (
      <line key={i} x1={-32 + i * 12} y1="64" x2={i * 12} y2="0" />
    ))}
  </g>,
];

const BLOB_PATH =
  "M120 60 C220 0 380 30 470 20 C590 8 720 40 770 130 C820 220 760 330 650 360 C540 390 430 350 320 370 C200 392 70 360 35 260 C0 160 40 100 120 60 Z";

const SPARKLE_PATH = "M12 0 C13 7 17 11 24 12 C17 13 13 17 12 24 C11 17 7 13 0 12 C7 11 11 7 12 0 Z";

const SPARKLES = [
  { className: "left-2 top-4 size-5 sm:left-6 sm:size-7", tint: "text-sun-300 dark:text-sun-500/50" },
  { className: "right-4 top-0 size-3 sm:right-10 sm:size-4", tint: "text-coral-300 dark:text-coral-500/50" },
  { className: "bottom-3 right-1 size-4 sm:right-4 sm:size-6", tint: "text-sky-300 dark:text-sky-500/50" },
];

const subtitle = (category: CategoryNode) =>
  category.description ||
  (category.children.length
    ? `${category.children.length} ${category.children.length === 1 ? "collection" : "collections"}`
    : "Shop the collection");

export default function Categories({ categories = [] }: { categories?: CategoryNode[] }) {
  if (!categories.length) return null;

  return (
    <section className="home-container" aria-label="Shop by category">
      <SectionHeader
        eyebrow="Collections"
        title="Shop by category"
        description="Go straight to what they need this season."
        href={ROUTES.products}
      />

      <div className="relative mx-auto  px-4 py-12 sm:px-10 sm:py-16">
        <svg
          aria-hidden="true"
          viewBox="0 0 800 400"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <defs>
            <linearGradient id="categories-blob-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="currentColor" className="text-sage-100 dark:text-sage-500/15" />
              <stop offset="100%" stopColor="currentColor" className="text-mint-50 dark:text-mint-500/5" />
            </linearGradient>
          </defs>

          <path
            d={BLOB_PATH}
            transform="rotate(4 400 200) translate(14 10)"
            className="fill-sky-50 dark:fill-sky-500/5"
          />
          <path d={BLOB_PATH} fill="url(#categories-blob-fill)" />
          <path
            d={BLOB_PATH}
            fill="none"
            strokeWidth="1.5"
            strokeDasharray="2 7"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            transform="rotate(-3 400 200)"
            className="stroke-sage-400 dark:stroke-sage-500/40"
          />
        </svg>

        {SPARKLES.map((sparkle, i) => (
          <svg
            key={i}
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={`pointer-events-none absolute ${sparkle.className} ${sparkle.tint}`}
          >
            <path d={SPARKLE_PATH} fill="currentColor" />
          </svg>
        ))}

        <ul className="relative grid grid-cols-4 px-8 max-w-[750px] m-auto">
          {categories.map((category, index) => {
            const tint = TINTS[index % TINTS.length];
            const motif = MOTIFS[index % MOTIFS.length];
            const letter = category.title.trim().charAt(0).toUpperCase();

            return (
              <li key={category.id}>
                <Link
                  href={ROUTES.category(category.slug)}
                  className="group flex flex-col items-center gap-3 rounded-2xl p-1 text-center focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:outline-none"
                >
                  <span
                    className={`relative flex size-24 items-center justify-center overflow-hidden rounded-full shadow-card ring-4 ring-white transition duration-300 after:pointer-events-none after:absolute after:inset-1.5 after:rounded-full after:border after:border-white/80 group-hover:-translate-y-1.5 group-hover:shadow-float group-hover:ring-sage-500 motion-reduce:transition-none sm:size-28 lg:size-44 lg:after:inset-2.5 dark:ring-ink-900 dark:after:border-white/10 ${tint.bg}`}
                  >
                    <svg
                      viewBox="0 0 64 64"
                      aria-hidden="true"
                      className={`absolute inset-0 size-full transition-transform duration-700 group-hover:rotate-45 motion-reduce:transition-none ${tint.motif}`}
                    >
                      {motif}
                    </svg>
                    <span
                      className={`relative flex size-12 items-center justify-center rounded-full bg-white/85 text-2xl font-bold shadow-sm backdrop-blur-sm sm:size-14 sm:text-3xl lg:size-20 lg:text-4xl dark:bg-ink-900/70 ${tint.letter}`}
                    >
                      {letter}
                    </span>
                  </span>

                  <span className="w-full min-w-0">
                    <span className="block truncate text-sm font-semibold tracking-tight text-text-dark sm:text-base dark:text-white">
                      {category.title}
                    </span>
                    <span className="mt-0.5 hidden truncate text-xs text-gray-600 sm:block dark:text-gray-400">
                      {subtitle(category)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
