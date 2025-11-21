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

    let mainProducts = null

    const categories = await CategoryModel.find({})
    const products = await ProductModal.find({})
        .populate({
            path: "subSubCategory",
            populate: { path: "parentID subParent" }
        }).lean()


    if (slug.length === 1) {
        mainProducts = products.filter(item => {
            const sub = item.subSubCategory
            return sub?.parentID?.slug === slug[0]
        })

    }
    else if (slug.length === 2) {
        mainProducts = products.filter(item => {
            const sub = item.subSubCategory
            return sub?.parentID?.slug === slug[0] &&
                sub.subParent?.slug === slug[1]
        })

    }
    else {
        mainProducts = products.filter(item => {
            const sub = item.subSubCategory
            return sub?.parentID?.slug === slug[0] &&
                sub.subParent?.slug === slug[1] &&
                sub?.slug === slug[2]

        })
    }


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
