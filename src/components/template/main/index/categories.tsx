import Image from "next/image";
import Link from "next/link";
import { LuArrowUpRight } from "react-icons/lu";
import SectionHeader from "@/components/modules/main/sectionHeader";
import { ROUTES } from "@/utils/constants";
import type { CategoryNode } from "@/types";

const FALLBACK_IMAGES = [
  "/images/3d13c0c692c13e3a2b23ec4aada83643.jpg",
  "/images/be27ba179f604eecc99ae2e18cb2c1d0.jpg",
  "/images/58a9656fc91cd2625e04e78334ee367c.jpg",
  "/images/e7b713eecc952b345214d544b8da1ad1.jpg",
];

const TINTS = [
  { card: "bg-coral-50 dark:bg-coral-500/10", arch: "bg-coral-200 dark:bg-coral-500/25" },
  { card: "bg-sky-50 dark:bg-sky-500/10", arch: "bg-sky-200 dark:bg-sky-500/25" },
  { card: "bg-sun-50 dark:bg-sun-500/10", arch: "bg-sun-200 dark:bg-sun-500/25" },
  { card: "bg-mint-50 dark:bg-mint-500/10", arch: "bg-mint-200 dark:bg-mint-500/25" },
  { card: "bg-sage-50 dark:bg-sage-500/10", arch: "bg-sage-200 dark:bg-sage-500/25" },
];

const subtitle = (category: CategoryNode) =>
  category.description ||
  (category.children.length
    ? `${category.children.length} ${category.children.length === 1 ? "collection" : "collections"}`
    : "Shop the collection");

export default function Categories({ categories = [] }: { categories?: CategoryNode[] }) {
  if (!categories.length) return null;

  const oddCount = categories.length % 2 === 1;

  return (
    <section className="home-container" aria-label="Shop by category">
      <SectionHeader
        eyebrow="Collections"
        title="Shop by category"
        description="Go straight to what they need this season."
        href={ROUTES.products}
      />

      <ul
        className={`grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4 ${categories.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}
      >
        {categories.map((category, index) => {
          const tint = TINTS[index % TINTS.length];
          const wide = oddCount && index === categories.length - 1;

          return (
            <li key={category.id} className={`pt-14 sm:pt-16 ${wide ? "col-span-2 md:col-span-1" : ""}`}>
              <Link
                href={ROUTES.category(category.slug)}
                className={`group relative flex h-full flex-col rounded-t-2xl  px-4 pb-4 transition-shadow duration-300 hover:shadow-float focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:outline-none sm:px-5 sm:pb-5 ${tint.card}`}
              >
                <div
                  className={`relative mx-auto -mt-14 w-[82%] overflow-hidden rounded-t-full shadow-card ring-4 ring-white transition-transform duration-500 group-hover:-translate-y-2 motion-reduce:transition-none sm:-mt-16 dark:ring-ink-900 ${tint.arch} ${
                    wide ? "aspect-[16/9] max-w-[260px] md:aspect-[4/5] md:max-w-none" : "aspect-[4/5]"
                  }`}
                >
                  <Image
                    fill
                    src={FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                    alt=""
                    sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 45vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-text-dark sm:text-lg dark:text-white">
                      {category.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                      {subtitle(category)}
                    </p>
                  </div>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-text-dark shadow-card transition-colors duration-300 group-hover:bg-sage-600 group-hover:text-white dark:bg-ink-800 dark:text-gray-100">
                    <LuArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
