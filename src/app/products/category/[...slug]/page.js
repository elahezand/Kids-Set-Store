import connectToDB from "../../../../../db/db";
import ProductModal from "../../../../../model/product";
import Navbar from "@/components/modules/navbar/navbar";
import Banner from "@/components/template/index/banner/banner";
import Footer from "@/components/modules/footer/footer";
import FilterSection from "@/components/template/products/filterSection";
import CategoryModel from "../../../../../model/category";
export default async function Page({ params }) {
    connectToDB()
    const { slug } = await params

    const selectedSlug = slug[slug.length - 1];

    const categories = await CategoryModel.find({}).lean()
    const products = await ProductModal.find({}).populate("categoryId")

    const mainCategory = categories.find(cat => cat.slug === selectedSlug)

    function getAllChildIds(parentId) {
        let ids = [parentId.toString()];
        categories.forEach(cat => {
            if (cat.parentId?.toString() === parentId.toString()) {
                ids.push(cat._id.toString());
                ids = [...ids, ...getAllChildIds(cat._id)];
            }
        });

        return ids;
    }

    const allIds = getAllChildIds(mainCategory._id);


    const mainProducts = products.filter(p =>
        p.categoryId && allIds.includes(p.categoryId._id.toString())
    );

    return (
        <div>
            <Navbar />
            <Banner />
            <FilterSection
                categories={JSON.parse(JSON.stringify(categories))}
                mainProducts={JSON.parse(JSON.stringify(mainProducts))} />
            <Footer />
        </div>
    )
}
