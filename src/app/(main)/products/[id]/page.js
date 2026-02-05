import connectToDB from "../../../../../configs/db";
import ProductModel from "../../../../../model/product";
import { isValidObjectId } from "mongoose";
import styles from "@/styles/product.module.css";
import Gallery from "@/components/template/product/gallery/gallery";
import MoreProducts from "@/components/template/product/moreProducts/moreProducts";
import Tabs from "@/components/template/product/tabs/tabs";
import Comments from "@/components/template/product/comments/comments";
import Details from "@/components/template/product/details/detail";
import Breadcrumb from "@/components/modules/breadCrumb/breadCrumb";

const product = async ({ params }) => {
  await connectToDB()
  const { id } = await params
  let product = null

  if (isValidObjectId(id)) {
    product = await ProductModel.findOne({ _id: id })
    console.log(product);

  }
  const relatedProducts = await ProductModel
    .find({ parentId: product.parentId })
    .limit(5).lean()

  return (
    <div className={styles.container}>
      <Breadcrumb
        title={product.name}
      />
      <div data-aos="fade-up" className={styles.contents}>
        <div className={styles.main}>
          <Gallery images={product.img} />
          <Details
            product={JSON.parse(JSON.stringify(product))} />
        </div>
        <Tabs
          product={JSON.parse(JSON.stringify(product))} />
        <section className={styles.tabs_content}>
          <Comments
            productId={product.id}
          />
        </section>
        <MoreProducts
          related={JSON.parse(JSON.stringify(relatedProducts))} />
      </div>
    </div>
  );
};

export default product;
