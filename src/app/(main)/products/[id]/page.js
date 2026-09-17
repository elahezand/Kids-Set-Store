import connectToDB from "../../../../../configs/db";
import ProductModel from "../../../../../model/product";
import commentModel from "../../../../../model/comment";
import { isValidObjectId } from "mongoose";
import Gallery from "@/components/template/main/product/gallery";
import MoreProducts from "@/components/template/main/product/moreProducts";
import Tabs from "@/components/template/main/product/tabs";
import Comments from "@/components/template/main/product/comments/comments";
import Details from "@/components/template/main/product/detail";
import Breadcrumb from "@/components/modules/main/breadCrumb";
import { notFound } from "next/navigation";

const product = async ({ params }) => {
  await connectToDB()
  const { id } = await params
  let product = null

  if (isValidObjectId(id)) {
    product = await ProductModel.findOne({ _id: id }).lean()
  }
  if (!product) return notFound()

  product = { ...product, _id: product._id.toString() };
  const productComments = await commentModel.countDocuments({ productID: product._id, isAccept: true })

  const related = await ProductModel
    .find({ parentId: product.parentId, _id: { $ne: product._id } })
    .sort({ _id: -1 })
    .limit(5)
    .lean()

  const relatedProducts = JSON.parse(JSON.stringify(related));

  return (
    <div className="page-container">
      <Breadcrumb route={`products/${product._id}`} title={product.name} />
      <div data-aos="fade-up" className="mx-auto max-w-[1200px] text-text dark:text-gray-100">
        <div className="flex flex-col gap-8 md:flex-row md:gap-10 lg:gap-14">
          <Gallery images={product.img} />
          <Details productComments={productComments} product={product} />
        </div>
        <Tabs
          color={product.color}
          availableSizes={product.availableSizes}
          material={product.material}
          longDescription={product.longDescription}
        />
        <section className="border-t border-gray-200 pt-10 dark:border-white/10">
          <Comments productId={product._id} />
        </section>
        <MoreProducts related={relatedProducts} />
      </div>
    </div>
  );
};

export default product;
