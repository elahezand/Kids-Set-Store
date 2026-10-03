import ParallaxStage from "@/components/modules/ui/parallaxStage";
import type { PublicStats } from "@/types";

const TILE_DEPTH = 6;

const compact = (n: number) => (n >= 1000 ? `${Math.floor(n / 100) / 10}k+` : `${n}`);

const buildStats = (stats: PublicStats | null) => [
  { value: stats ? compact(stats.activeUsers) : "-", label: "Happy families" },
  { value: stats ? compact(stats.activeProducts) : "-", label: "Styles in store" },
  { value: stats?.averageRating ? String(stats.averageRating) : "-", label: "Average rating" },
  { value: stats ? compact(stats.successfulDeals) : "-", label: "Completed orders" },
];

export default function StatsTiles3D({ stats }: { stats: PublicStats | null }) {
  return (
    <ParallaxStage max={10} className="h-full min-h-[320px] w-full bg-sage-100 dark:bg-sage-900/40">
      <div className="flex h-full min-h-[320px] items-center justify-center p-8 [transform-style:preserve-3d]">
        <dl
          className="grid w-full max-w-[340px] grid-cols-2 gap-4 [transform-style:preserve-3d]"
          style={{ transform: "rotateX(16deg) rotateY(-14deg)" }}
        >
          {buildStats(stats).map((stat) => (
            <div
              key={stat.label}
              className="group relative transition-transform duration-300 ease-out hover:[transform:translateZ(24px)] motion-reduce:transition-none [transform-style:preserve-3d]"
            >
              {Array.from({ length: TILE_DEPTH }, (_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-2xl bg-sage-300 dark:bg-sage-800"
                  style={{ transform: `translateZ(${-(i + 1) * 1.2}px)` }}
                />
              ))}
              <div className="relative flex flex-col-reverse rounded-2xl bg-white p-4 text-center shadow-card dark:bg-ink-800">
                <dt className="mt-1.5 block text-xs text-gray-700 sm:text-sm dark:text-gray-400">{stat.label}</dt>
                <dd className="block font-shabnam-bold text-3xl leading-none text-sage-600 dark:text-sage-300">
                  {stat.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </ParallaxStage>
  );
}
