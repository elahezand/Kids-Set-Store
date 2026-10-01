import Product from "@/components/modules/main/product";
import SectionHeader from "@/components/modules/main/sectionHeader";
import type { ProductCard } from "@/types";

const Latest = ({ products = [] }: { products?: ProductCard[] }) => {
    return (
        <div className="page-container">
            <SectionHeader title="New Arrivals" href="/products?sort=latest" />
            {products.length ? (
                <div
                    className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 xl:grid-cols-5"
                    data-aos="fade-up"
                >
                    {products.map((item) => (
                        <Product key={item._id} {...item} />
                    ))}
                </div>
            ) : (
                <p className="py-10 text-center text-gray-700 dark:text-gray-500">
                    No products yet.
                </p>
            )}
        </div>
    );
};

export default Latest;
