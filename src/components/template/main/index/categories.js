import Link from "next/link";
import Image from "next/image";

// Category model has no image -> these photos are shown in order
const FALLBACK_IMAGES = [
    "/images/3d13c0c692c13e3a2b23ec4aada83643.jpg",
    "/images/be27ba179f604eecc99ae2e18cb2c1d0.jpg",
    "/images/58a9656fc91cd2625e04e78334ee367c.jpg",
    "/images/e7b713eecc952b345214d544b8da1ad1.jpg",
];

/* categories = top level nodes of services/public/category getAllCategories() */
export default function Categories({ categories = [] }) {
    if (!categories.length) return null;

    return (
        <section className="page-container py-12 sm:py-16" aria-label="Shop by category">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6" data-aos="fade-up">
                {categories.map((category, index) => (
                    <Link
                        key={category.id}
                        href={`/products?category=${encodeURIComponent(category.slug)}`}
                        className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-ink-800"
                    >
                        <Image
                            fill
                            src={FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                            alt={category.title}
                            sizes="(min-width: 1024px) 25vw, 50vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/40" />

                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-4 text-center">
                            <h3 className="text-lg font-light tracking-wide text-white sm:text-xl lg:text-2xl">
                                {category.title}
                            </h3>
                            {category.children?.length > 0 && (
                                <span className="text-xs text-white/80 sm:text-sm">
                                    {category.children.length} sub categories
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
