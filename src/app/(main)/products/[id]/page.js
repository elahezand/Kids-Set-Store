import connectToDB from "../../../../../configs/db";
import ProductModel from "../../../../../model/product";
import commentModel from "../../../../../model/comment";
import { isValidObjectId } from "mongoose";
import styles from "@/styles/product.module.css";
import Gallery from "@/components/template/product/gallery/gallery";
import MoreProducts from "@/components/template/product/moreProducts/moreProducts";
import Tabs from "@/components/template/product/tabs/tabs";
import Comments from "@/components/template/product/comments/comments";
import Details from "@/components/template/product/details/detail";
import Breadcrumb from "@/components/modules/breadCrumb/breadCrumb";
import { notFound } from "next/navigation";

const product = async ({ params }) => {
  await connectToDB()
  const { id } = await params
  let product = null

  if (isValidObjectId(id)) {
    product = await ProductModel.findOne({ _id: id }).lean()
  }
  if (!product) return notFound()

  product = {
    ...product,
    _id: product._id.toString()
  };
  const productComments = await commentModel.countDocuments({ productID: product._id, isAccept: true })

  const related = await ProductModel
    .find({ parentId: product.parentId, _id: { $ne: product._id } })
    .sort({ _id: -1 })
    .limit(5)
    .lean()

  const relatedProducts = JSON.parse(JSON.stringify(related));

  return (
    <div className="container">
      <Breadcrumb
        route={`products/${product._id}`}
        title={product.name} />
      <div data-aos="fade-up"
        className={styles.contents}>
        <div className={styles.main}>
          <Gallery images={product.img} />
          <Details
            productComments={productComments}
            product={product} />
        </div>
        <Tabs
          color={product.color}
          availableSizes={product.availableSizes}
          material={product.material}
          longDescription={product.longDescription} />
        <section
          className={styles.tabs_content}>
          <Comments
            productId={product._id}
          />
        </section>
        <MoreProducts
          related={relatedProducts} />
      </div>
    </div>
  );
};

export default product;
