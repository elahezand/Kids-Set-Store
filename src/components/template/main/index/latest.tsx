import ProductCard from "@/components/modules/main/productCard";
import SectionHeader from "@/components/modules/main/sectionHeader";
import { ROUTES } from "@/utils/constants";
import type { ProductCardData } from "@/types";

const Latest = ({ products = [] }: { products?: ProductCardData[] }) => {
  return (
    <div className="page-container">
      <SectionHeader eyebrow="Just in" title="New Arrivals" href={`${ROUTES.products}?sort=latest`} />
      {products.length ? (
        <div
          className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 xl:grid-cols-5"
          data-aos="fade-up"
        >
          {products.map((item) => (
            <ProductCard key={item._id} {...item} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-gray-700 dark:text-gray-500">No products yet.</p>
      )}
    </div>
  );
};

export default Latest;