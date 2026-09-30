import { cache } from "react";
import { notFound } from "next/navigation";
import connectToDB from "@/configs/db";
import ProductModel from "@/model/product";
import { getProductById } from "@/services/public/product";
import commentService from "@/services/public/comment";
import Breadcrumb from "@/components/modules/main/breadCrumb";
import ProductContent from "@/components/template/main/product/productContent";
import Comments from "@/components/template/main/product/comments/comments";
import MoreProducts from "@/components/template/main/product/moreProducts";
import { toProductView, toProductCard } from "@/utils/productView";

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
const RELATED_LIMIT = 5;

// cache => generateMetadata va page yek query mizanan
const getProduct = cache(async (id) => {
    if (!OBJECT_ID_REGEX.test(id)) return null;
    await connectToDB();
    const result = await getProductById(id);

    if (!result.success) return null;

    return result.data;
});

export async function generateMetadata({ params }) {
    const { id } = await params;

    const product = await getProduct(id);
    if (!product) return {};

    const view = toProductView(product);
    return {
        title: view.name,
        description: view.shortDescription,
        openGraph: {
            title: view.name,
            images: [view.img],
        },
    };
}

const Product = async ({ params }) => {
    const { id } = await params;

    const product = await getProduct(id);
    if (!product) notFound();

    const view = toProductView(product);

    const [commentsCount, related] = await Promise.all([
        commentService.countByProduct(product._id),

        ProductModel.find({
            status: "active",
            _id: { $ne: product._id },
            categoryPath: {
                $in: product.categoryPath ?? [],
            },
        })
            .select("title images price variants metrics")
            .sort({ _id: -1 })
            .limit(RELATED_LIMIT)
            .lean(),
    ]);

    const relatedProducts = related.map(toProductCard);

    return (
        <div className="page-container">
            <Breadcrumb title={view.name} />

            <div
                data-aos="fade-up"
                className="mx-auto max-w-[1200px] text-text dark:text-gray-100"
            >
                <ProductContent
                    product={view}
                    commentsCount={commentsCount}
                />

                <section className="border-t border-gray-200 pt-10 dark:border-white/10">
                    <Comments productId={view._id} />
                </section>

                <MoreProducts related={relatedProducts} />
            </div>
        </div>
    );
};

export default Product;