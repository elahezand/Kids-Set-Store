import Link from "next/link";
import type { PublicStats } from "@/types";


const ClubArt = () => (
  <div className="group relative flex h-full min-h-[300px] w-full items-center justify-center overflow-hidden bg-sage-100 p-8 dark:bg-sage-900/40">
    <div
      aria-hidden="true"
      className="absolute h-[170px] w-[260px] -rotate-12 rounded-2xl bg-white/70 shadow-card transition-transform duration-500 group-hover:-rotate-[18deg] dark:bg-white/10 sm:h-[190px] sm:w-[300px]"
    />
    <div className="relative h-[170px] w-[260px] rotate-6 rounded-2xl bg-coral-500 p-5 text-white shadow-float transition-transform duration-500 group-hover:rotate-3 sm:h-[190px] sm:w-[300px]">
      <span className="text-xs font-semibold opacity-85">Member card</span>
      <p className="mt-1 font-shabnam-bold text-2xl leading-tight">Set Kids Club</p>
      <div className="mt-5 flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-2 w-8 rounded-full bg-white/45" />
        ))}
      </div>
      <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
        <span className="text-sm opacity-90">Royal customer</span>
        <span className="text-2xl" aria-hidden="true">★</span>
      </div>
    </div>

    <span className="absolute left-6 top-8 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-sage-700 shadow-card dark:bg-ink-800 dark:text-sage-300">
      Free shipping
    </span>
    <span className="absolute right-6 top-20 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-sage-700 shadow-card dark:bg-ink-800 dark:text-sage-300">
      −10% birthday
    </span>
    <span className="absolute bottom-10 left-10 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-sage-700 shadow-card dark:bg-ink-800 dark:text-sage-300">
      Early access
    </span>
  </div>
);

const compact = (n: number) => (n >= 1000 ? `${Math.floor(n / 100) / 10}k+` : `${n}`);

/* stats = services/server/public/stats getPublicStats() (null when it failed) */
const buildStats = (stats: PublicStats | null) => [
  { value: stats ? compact(stats.activeUsers) : "-", label: "Happy families" },
  { value: stats ? compact(stats.activeProducts) : "-", label: "Styles in store" },
  { value: stats?.averageRating ? String(stats.averageRating) : "-", label: "Average rating" },
  { value: stats ? compact(stats.successfulDeals) : "-", label: "Completed orders" },
];

const StatsArt = ({ stats }: { stats: PublicStats | null }) => (
  <div className="flex h-full min-h-[300px] w-full items-center justify-center bg-peach-100 p-8 dark:bg-peach-900/30">
    <div className="grid w-full max-w-[340px] grid-cols-2 gap-3 sm:gap-4">
      {buildStats(stats).map((s) => (
        <div
          key={s.label}
          className="rounded-2xl bg-white p-4 text-center shadow-card transition-transform duration-300 hover:-translate-y-1 dark:bg-ink-800"
        >
          <span className="block font-shabnam-bold text-3xl leading-none text-sage-600 dark:text-sage-300">{s.value}</span>
          <span className="mt-1.5 block text-xs text-gray-700 dark:text-gray-400 sm:text-sm">{s.label}</span>
        </div>
      ))}
    </div>
  </div>
);

const Promote = ({ stats = null }: { stats?: PublicStats | null }) => {
  return (
    <div className="m-12">
      <div className="flex w-full flex-col gap-6 sm:gap-8">
        <div
          className="flex w-full flex-col items-stretch justify-between gap-0 overflow-hidden rounded-3xl shadow-card md:flex-row-reverse"
          data-aos="fade-up-right"
        >
          <div className="w-full md:w-1/2">
            <ClubArt />
          </div>

          <div className="relative flex h-[260px] w-full items-end bg-mint-100 p-6 text-left dark:bg-ink-800 sm:h-[320px] sm:p-8 md:h-auto md:w-1/2">
            <div className="w-full max-w-[280px] rounded-2xl bg-white p-4 text-center shadow-float dark:bg-ink-900 sm:p-5">
              <span className="block w-full text-base font-bold text-text-dark dark:text-gray-100 sm:text-lg md:text-xl">
                Set Kids Club
              </span>
              <p className="mt-2 w-full text-sm text-gray-700 dark:text-gray-400 sm:text-base">
                Royal customers of Set Kids
              </p>
            </div>
          </div>
        </div>

        {/* ───── چرا ما ───── */}
        <div
          className="flex w-full flex-col items-stretch justify-between gap-0 overflow-hidden rounded-3xl shadow-card md:flex-row-reverse"
          data-aos="fade-up-left"
        >
          <div className="flex w-full flex-col justify-center gap-4 bg-peach-50 p-6 dark:bg-ink-800 sm:p-8 md:w-1/2">
            <div className="rounded-2xl bg-white p-4 dark:bg-ink-900 sm:p-5">
              <p className="text-lg font-bold text-text-dark dark:text-gray-100 sm:text-xl md:text-2xl">Why Set Kids?</p>
            </div>
            <div className="max-h-[220px] overflow-y-auto rounded-2xl bg-white p-4 text-sm leading-7 text-gray-700 dark:bg-ink-900 dark:text-gray-300 sm:p-5 sm:text-base">
              With years of experience and feedback from parents, Set Kids offers a wide range of stylish and
              comfortable children&apos;s clothing. Our mission is to make shopping easier for families by providing
              trendy, high-quality outfits at affordable prices.
            </div>
            <div className="flex gap-3">
              <Link href="/about" className="btn btn-primary">
                About us
              </Link>
              <Link href="/products" className="btn btn-secondary">
                Store
              </Link>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <StatsArt stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promote;