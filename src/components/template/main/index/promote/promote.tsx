import Link from "next/link";
import ClubCard3D from "@/components/template/main/index/promote/clubCard3D";
import StatsTiles3D from "@/components/template/main/index/promote/statsTiles3D";
import { ROUTES } from "@/utils/constants";
import type { PublicStats } from "@/types";

const Promote = ({ stats = null }: { stats?: PublicStats | null }) => {
  return (
    <div className="page-container">
      <div className="flex w-full flex-col gap-6 sm:gap-8">
        <div
          className="flex w-full flex-col items-stretch justify-between gap-0 overflow-hidden rounded-3xl border border-sage-100 shadow-card md:flex-row-reverse dark:border-white/10"
          data-aos="fade-up-right"
        >
          <div className="w-full md:w-1/2">
            <ClubCard3D />
          </div>

          <div className="relative flex h-[260px] w-full items-end bg-gradient-to-br from-sage-100 via-sage-50 to-coral-50 p-6 text-left dark:bg-none dark:bg-ink-800 sm:h-[320px] sm:p-8 md:h-auto md:w-1/2">
            <div className="w-full max-w-[280px] rounded-2xl bg-white p-4 text-center shadow-float ring-1 ring-sage-100 dark:bg-ink-900 dark:ring-white/10 sm:p-5">
              <span className="block w-full text-base font-bold text-sage-700 dark:text-gray-100 sm:text-lg md:text-xl">
                Set Kids Club
              </span>
              <p className="mt-2 w-full text-sm text-gray-700 dark:text-gray-400 sm:text-base">
                Royal customers of Set Kids
              </p>
            </div>
          </div>
        </div>

        <div
          className="flex w-full flex-col items-stretch justify-between gap-0 overflow-hidden rounded-3xl border border-sage-100 shadow-card md:flex-row-reverse dark:border-white/10"
          data-aos="fade-up-left"
        >
          <div className="flex w-full flex-col justify-center gap-4 bg-gradient-to-bl from-coral-50 via-sage-50 to-sage-100 p-6 dark:bg-none dark:bg-ink-800 sm:p-8 md:w-1/2">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-sage-100 dark:bg-ink-900 dark:ring-white/10 sm:p-5">
              <p className="text-lg font-bold text-sage-700 dark:text-gray-100 sm:text-xl md:text-2xl">Why Set Kids?</p>
            </div>
            <div className="max-h-[220px] overflow-y-auto rounded-2xl bg-white p-4 text-sm leading-7 text-gray-700 ring-1 ring-sage-100 dark:bg-ink-900 dark:text-gray-300 dark:ring-white/10 sm:p-5 sm:text-base">
              With years of experience and feedback from parents, Set Kids offers a wide range of stylish and
              comfortable children&apos;s clothing. Our mission is to make shopping easier for families by providing
              trendy, high-quality outfits at affordable prices.
            </div>
            <div className="flex gap-3">
              <Link href={ROUTES.about} className="btn btn-primary">
                About us
              </Link>
              <Link href={ROUTES.products} className="btn btn-accent">
                Store
              </Link>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <StatsTiles3D stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promote;
