import ArticlesList from "@/components/template/main/articles/articlesList";
import ArticlesSearch from "@/components/template/main/articles/articlesSearch";
import Breadcrumb from "@/components/modules/main/breadCrumb";
import connectToDB from "@/configs/db";
import { articleListQuerySchema } from "@/validators/article";
import articleService from "@/services/public/article";

const DEFAULT_LIMIT = 15;

// ?q=a&q=b gives an array -> always work with a single, trimmed string
const clean = (value, max = 100) => {
  const str = Array.isArray(value) ? value[0] : value;
  return typeof str === "string" ? str.trim().slice(0, max) : "";
};

export async function generateMetadata({ searchParams }) {
  const params = (await searchParams) || {};
  const q = clean(params.q);
  const isFiltered = Boolean(q || clean(params.category) || clean(params.cursor));

  return {
    title: q ? `Search: ${q} - Articles` : "Our Articles",
    description: "Read our latest articles, guides and news.",
    // filtered / paginated variants should not compete with the main list
    ...(isFiltered && { robots: { index: false, follow: true } }),
  };
}

export default async function Page({ searchParams }) {
  await connectToDB();

  const params = (await searchParams) || {};

  const q = clean(params.q);
  const category = clean(params.category);
  const parsed = articleListQuerySchema.safeParse({
    limit: clean(params.limit, 10) || undefined,
    cursor: clean(params.cursor, 64) || undefined,
  });

  const { limit, cursor } = parsed.success
    ? parsed.data
    : { limit: DEFAULT_LIMIT, cursor: null };

  const [result, categories] = await Promise.all([
    articleService.getPublicArticles({
      limit,
      cursor: cursor ?? null,
      category,
      q,
    }),
    // same service as GET /api/articles
    articleService.getPublicArticleCategories(),
  ]);

  // same filters => same list; changing a filter remounts ArticlesList
  const listKey = new URLSearchParams(
    Object.entries({ q, category, limit: params.limit ? String(limit) : "" }).filter(
      ([, value]) => value
    )
  ).toString();

  return (
    <div className="page-container">
      <Breadcrumb route="articles" title="Articles" />

      <ArticlesSearch categories={categories} />

      <ArticlesList
        key={listKey}
        data={JSON.parse(JSON.stringify(result?.data ?? []))}
        nextCursor={result?.pagination?.nextCursor ?? null}
        hasMore={result?.pagination?.hasMore ?? false}
        limit={limit}
      />
    </div>
  );
}