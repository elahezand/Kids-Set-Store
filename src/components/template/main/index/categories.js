import Link from "next/link";
import Image from "next/image";
import SectionHeader from "@/components/modules/main/sectionHeader";

const categories = [
    {
        name: "Kids",
        query: "Kids",
        img: "/images/3d13c0c692c13e3a2b23ec4aada83643.jpg",
    },
    {
        name: "Toddlers",
        query: "Toddelers",
        img: "/images/be27ba179f604eecc99ae2e18cb2c1d0.jpg",
    },
    {
        name: "Shoes",
        query: "Shoes",
        img: "/images/58a9656fc91cd2625e04e78334ee367c.jpg",
    },
    {
        name: "Baby",
        query: "Baby",
        img: "/images/e7b713eecc952b345214d544b8da1ad1.jpg",
    },
];

export default function Categories() {
    return (
        <section className="page-container py-12 sm:py-16">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6" data-aos="fade-up">
                {categories.map((category) => (
                    <Link
                        key={category.query}
                        href={`/products?category=${category.query}`}
                        className="group relative overflow-hidden bg-gray-100 dark:bg-ink-800 aspect-square"
                    >
                        {/* تصویر */}
                        <Image
                            fill
                            src={category.img}
                            alt={category.name}
                            sizes="(min-width: 1024px) 25vw, 50vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />

                        {/* Overlay تاریک */}
                        <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/40" />

                        {/* متن */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <h3 className="text-white text-lg sm:text-xl lg:text-2xl font-light tracking-wide">
                                    {category.name}
                                </h3>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}