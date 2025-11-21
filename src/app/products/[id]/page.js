import styles from "@/styles/product.module.css";
import Navbar from "@/components/modules/navbar/navbar";
import Footer from "@/components/modules/footer/footer";
import Gallery from "@/components/template/product/gallery/gallery";
import MoreProducts from "@/components/template/product/moreProducts/moreProducts";
import Tabs from "@/components/template/product/tabs/tabs";
import Details from "@/components/template/product/details/detail";
import Breadcrumb from "@/components/modules/breadCrumb/breadCrumb";
import connectToDB from "../../../../db/db";
import ProductModal from "../../../../model/product";
import { isValidObjectId } from "mongoose";
import commentModel from "../../../../model/comment";

const product = async ({ params }) => {
  connectToDB()
  const { id } = await params
  let product = null
  if (isValidObjectId(id)) {
    product = await ProductModal.findOne({ _id: id })
      .populate("comments").lean()
  }
  const relatedProducts = await ProductModal.find({ subSubCategory: product.subSubCategory })

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <Breadcrumb
          title={product.name}
        />
        <div data-aos="fade-up"className={styles.contents}>
          <div className={styles.main}>
            <Gallery images={product.img} />
            <Details
              product={JSON.parse(JSON.stringify(product))} />
          </div>
          <Tabs product={JSON.parse(JSON.stringify(product))} />
          <MoreProducts
            related={JSON.parse(JSON.stringify(relatedProducts))} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default product;
