import ArticlesList from "@/components/template/main/articles/articlesList";
import Breadcrumb from "@/components/modules/main/breadCrumb";
import connectToDB from "../../../../configs/db";
import ArticleModel from "../../../../model/article";
import { articleListQuerySchema } from "../../../../validations/article";
import { paginate } from "@/utils/paginate";

export const metadata = {
  title: "Our Articles | SET KIDS",
  description: "Read our latest articles, news, and insights on various topics.",
  openGraph: {
    title: "Our Articles | SET KIDS",
    description: "Read our latest articles, news, and insights on various topics.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Articles | SET KIDS",
    description: "Read our latest articles, news, and insights on various topics.",
  },
};

export default async function Page({ searchParams }) {
  await connectToDB();

  const params = (await searchParams) || {};

  const { limit, cursor } = articleListQuerySchema.parse(params);

  const result = await paginate(ArticleModel, {
    limit,
    cursor: cursor ?? null,
    filters: { status: "publish" },
    sort: { _id: -1 },
  });

  const queryString = new URLSearchParams(
    Object.entries(params).filter(
      ([key, value]) => key !== "cursor" && typeof value === "string"
    )
  ).toString();

  return (
    <div className="page-container">
      <Breadcrumb route="articles" title="Our Articles" />

      <ArticlesList
        key={queryString}
        data={JSON.parse(JSON.stringify(result.data || []))}
        nextCursor={result.pagination?.nextCursor || null}
        hasMore={result.pagination?.hasMore || false}
        limit={limit}
      />
    </div>
  );
}