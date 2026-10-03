import Link from "next/link";
import Image from "next/image";
import SectionHeader from "@/components/modules/main/sectionHeader";
import type { CategoryNode } from "@/types";

const FALLBACK_IMAGES = [
  "/images/3d13c0c692c13e3a2b23ec4aada83643.jpg",
  "/images/be27ba179f604eecc99ae2e18cb2c1d0.jpg",
  "/images/58a9656fc91cd2625e04e78334ee367c.jpg",
  "/images/e7b713eecc952b345214d544b8da1ad1.jpg",
];

export default function Categories({ categories = [] }: { categories?: CategoryNode[] }) {
  if (!categories.length) return null;

  const featureFirst = categories.length >= 3;
  const smallCount = featureFirst ? categories.length - 1 : categories.length;

  const smallTileClass = (position: number) => {
    const isLast = position === smallCount - 1;
    const desktop =
      smallCount === 1
        ? "lg:col-span-2 lg:row-span-2"
        : smallCount === 2 || (smallCount === 3 && isLast)
          ? "lg:col-span-2"
          : "";
    const phone = smallCount % 2 === 1 && isLast ? "col-span-2 aspect-[16/9]" : "aspect-[4/5]";
    return `${phone} lg:aspect-auto ${desktop}`;
  };

  return (
    <section className="page-container pb-4 sm:pb-2" aria-labelledby="categories-heading">
      <SectionHeader title="Shop by category" description="Go straight to what they need this season." href="/products" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[420px] lg:grid-cols-4">
        {categories.map((category, index) => {
          const big = featureFirst && index === 0;
          const position = featureFirst ? index - 1 : index;

          return (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              className={`group relative overflow-hidden rounded-2xl bg-sage-100 shadow-lg shadow-sage-500/25 ring-1 ring-sage-300/50 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sage-500/40 hover:ring-sage-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:bg-sage-900 dark:shadow-sage-900/60 dark:ring-sage-700/50 ${big ? "col-span-2 aspect-[16/10] lg:row-span-2 lg:aspect-auto" : smallTileClass(position)
                }`}
            >
              <Image
                fill
                src={FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                alt=""
                sizes={big ? "(min-width: 1024px) 50vw, 120vw" : "(min-width: 1024px) 25vw, 50vw"}
                className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-sage-600/25 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-70"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-sage-700/10 transition-opacity duration-300 group-hover:opacity-60"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-sage-900/70 via-sage-800/15 to-transparent"
              />

              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15 shadow-[inset_0_0_40px_-12px_var(--color-sage-400)]"
              />

              <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5">
                <span className="min-w-0">
                  <span
                    className={`block font-shabnam-bold leading-tight text-white ${big ? "text-2xl sm:text-4xl" : "text-lg sm:text-xl"}`}
                  >
                    {category.title}
                  </span>
                  {big && category.description && (
                    <span className="mt-1 line-clamp-1 hidden max-w-[40ch] text-sm text-white/85 sm:block">
                      {category.description}
                    </span>
                  )}
                </span>
                <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-sage-700 transition-colors group-hover:bg-sage-600 group-hover:text-white sm:text-sm">
                  Shop
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}