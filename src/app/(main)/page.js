import Promote from "@/components/template/main/index/promote";
import dynamic from "next/dynamic";
import ProductModal from "../../../model/product";
import connectToDB from "../../../configs/db";
import Categories from "@/components/template/main/index/categories";
import ArticleModel from "../../../model/article";
import PromoText from "@/components/template/main/index/promoText";

const Articles = dynamic(() => import("@/components/template/main/index/articles/articles"))
const BestSelling = dynamic(() => import("@/components/template/main/index/bestSelling"))
const Latest = dynamic(() => import("@/components/template/main/index/latest"))


export default async function Home() {
  await connectToDB()
  const products = await ProductModal.find({})
    .sort({ _id: -1 })
    .limit(10)
    .lean()
  const bestSelling = await ProductModal.find({ score: { $gte: 4 } })
    .sort({ _id: -1 })
    .limit(10)
    .lean()
  const articles = await ArticleModel.find({})
    .sort({ _id: -1 })
    .limit(10)
    .lean()

  return (
    <>
      <Latest products={JSON.parse(JSON.stringify(products))} />
      <PromoText />
      <BestSelling products={JSON.parse(JSON.stringify(bestSelling))} />
      <Articles articles={JSON.parse(JSON.stringify(articles))} />
      <Categories />
      <Promote />
    </>
  );
}
