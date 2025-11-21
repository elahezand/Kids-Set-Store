import Banner from "@/components/template/index/banner/banner";
import Navbar from "@/components/modules/navbar/navbar";
import Footer from "@/components/modules/footer/footer";
import Latest from "@/components/template/index/latest/latest";
import Articles from "@/components/template/index/articles/articles";
import BestSelling from "@/components/template/index/best-selling/bestSelling";
import Promote from "@/components/template/index/promote/promote";
import ProductModal from "../../model/product";
import connectToDB from "../../db/db";
import Categories from "@/components/template/index/categories/categories";
import ArticleModel from "../../model/article";
import PromoText from "@/components/template/index/promoText/promoText";


export default async function Home() {
  connectToDB()
  const products = await ProductModal.find({}).sort({ _id: -1 }).limit(10)
  const articles = await ArticleModel.find({}).sort({ _id: -1 }).limit(10)

  return (
    <div>
      <Navbar />
      <Banner />
      <Latest products={JSON.parse(JSON.stringify(products))} />
      <PromoText />
      <BestSelling products={JSON.parse(JSON.stringify(products.filter(item => item.score > 4)))} />
      <Articles articles={JSON.parse(JSON.stringify(articles))} />
      <Categories />
      <Promote />
      <Footer />
    </div>
  );
}
