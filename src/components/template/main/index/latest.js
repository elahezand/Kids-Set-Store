import Product from "@/components/modules/main/product";
import SectionHeader from "@/components/modules/main/sectionHeader";

const Latest = ({ products }) => {
    return (
        <div className="page-container">
            <SectionHeader title="Our Products" href="/products" />
            <div
                className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 xl:grid-cols-5"
                data-aos="fade-up"  >
                {products.length ? products.map((item, index) => (
                    <Product {...item} key={index + 1} />
                )) : null}
            </div>
        </div>
    );
};

export default Latest;
