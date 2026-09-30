import connectToDB from "@/configs/db";
import ProductModel from "@/model/product";
import commentModel from "@/model/comment";
import { isValidObjectId } from "mongoose";
import MoreProducts from "@/components/template/main/product/moreProducts";
import Comments from "@/components/template/main/product/comments/comments";
import Breadcrumb from "@/components/modules/main/breadCrumb";
import ProductContent from "@/components/template/main/product/productContent";
import { notFound } from "next/navigation";
import { toProductView } from "@/utils/productView";

const Product = async ({ params }) => {
    await connectToDB();

    const { id } = await params;

    let product = null;

    if (isValidObjectId(id)) {
        product = await ProductModel.findOne({
            _id: id,
            status: "active",
        }).lean();
    }

    if (!product) return notFound();

    const view = toProductView(product);

    const productComments =
        await commentModel.countDocuments({
            product: view._id,
            status: "approved",
            parentId: null,
        });

    const related = await ProductModel.find({
        status: "active",
        categoryPath: {
            $in: product.categoryPath || [],
        },
        _id: {
            $ne: product._id,
        },
    })
        .sort({ _id: -1 })
        .limit(5)
        .lean();

    const relatedProducts = JSON.parse(
        JSON.stringify(related)
    );

    return (
        <div className="page-container">
            <Breadcrumb title={view.name} />

            <div
                data-aos="fade-up"
                className="mx-auto max-w-[1200px] text-text dark:text-gray-100"
            >
                <ProductContent
                    product={view}
                    productComments={productComments}
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
