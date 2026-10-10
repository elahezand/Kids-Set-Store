import Link from "next/link";
import { LuArrowUpRight, LuCake, LuSparkles, LuTruck } from "react-icons/lu";
import SectionHeader from "@/components/modules/main/sectionHeader";
import ClubCard3D from "@/components/template/main/index/promote/clubCard3D";
import { ROUTES } from "@/utils/constants";
import type { PublicStats } from "@/types";

const compact = (n: number) => (n >= 1000 ? `${Math.floor(n / 100) / 10}k+` : `${n}`);

const buildStats = (stats: PublicStats | null) => [
  {
    value: stats ? compact(stats.activeUsers) : "-",
    label: "Happy families",
    tone: "text-coral-600 dark:text-coral-300",
  },
  {
    value: stats ? compact(stats.activeProducts) : "-",
    label: "Styles in store",
    tone: "text-sage-600 dark:text-sage-300",
  },
  {
    value: stats?.averageRating ? String(stats.averageRating) : "-",
    label: "Average rating",
    tone: "text-sun-600 dark:text-sun-300",
  },
  {
    value: stats ? compact(stats.successfulDeals) : "-",
    label: "Completed orders",
    tone: "text-mint-600 dark:text-mint-300",
  },
];

const PERKS = [
  { icon: LuTruck, label: "Free shipping" },
  { icon: LuCake, label: "−10% on birthdays" },
  { icon: LuSparkles, label: "Early access to drops" },
];

const Promote = ({ stats = null }: { stats?: PublicStats | null }) => {
  return (
    <section className="home-container" aria-label="Set Kids Club">
      <SectionHeader
        eyebrow="Set Kids Club"
        title="More than a clothing store"
        description="Perks for the families who shop with us - and the numbers behind them."
      />

      <div className="grid gap-20 pt-16 sm:pt-20 lg:grid-cols-2 lg:gap-8">
        <div
          className="relative flex flex-col rounded-[2rem] bg-coral-50 px-6 pb-8 dark:bg-coral-500/10 sm:px-8"
          data-aos="fade-up"
        >
          <div className="relative -mt-20 sm:-mt-24">
            <ClubCard3D bare />
          </div>

          <div className="relative mt-2 flex flex-1 flex-col">
            <h3 className="text-xl font-bold text-text-dark sm:text-2xl dark:text-white">Royal customers</h3>
            <p className="mt-1 max-w-[46ch] text-sm text-gray-600 sm:text-base dark:text-gray-400">
              Every order brings you closer to the club. Tap the card to see what members get.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {PERKS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-coral-700 shadow-card sm:text-sm dark:bg-ink-800 dark:text-coral-300"
                >
                  <Icon className="size-3.5" aria-hidden="true" /> {label}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link href={ROUTES.products} className="btn btn-accent">
                Start shopping <LuArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div
          className="relative flex flex-col rounded-[2rem] bg-sage-50 px-6 pb-8 dark:bg-sage-500/10 sm:px-8"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <ul className="relative -mt-16 grid grid-cols-2 gap-3 sm:-mt-20 sm:gap-4">
            {buildStats(stats).map((s, index) => (
              <li
                key={s.label}
                className={`rounded-2xl bg-white p-4 text-center shadow-float transition-transform duration-300 hover:-translate-y-1 sm:p-5 dark:bg-ink-800 ${
                  index % 2 === 1 ? "sm:translate-y-6 sm:hover:translate-y-5" : ""
                }`}
              >
                <span className={`block font-shabnam-bold text-3xl leading-none sm:text-4xl ${s.tone}`}>{s.value}</span>
                <span className="mt-1.5 block text-xs text-gray-700 sm:text-sm dark:text-gray-400">{s.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-1 flex-col sm:mt-12">
            <h3 className="text-xl font-bold text-text-dark sm:text-2xl dark:text-white">Why Set Kids?</h3>
            <p className="mt-2 text-sm leading-7 text-gray-700 sm:text-base dark:text-gray-300">
              With years of experience and feedback from parents, Set Kids offers a wide range of stylish and
              comfortable children&apos;s clothing. Our mission is to make shopping easier for families by providing
              trendy, high-quality outfits at affordable prices.
            </p>
            <div className="mt-auto flex gap-3 pt-6">
              <Link href={ROUTES.about} className="btn btn-primary">
                About us
              </Link>
              <Link href={ROUTES.products} className="btn btn-secondary">
                Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Promote;
