import type { Metadata } from "next";
import ArticlesList from "@/components/template/main/articles/articlesList";
import ArticlesSearch from "@/components/template/main/articles/articlesSearch";
import Breadcrumb from "@/components/modules/main/breadCrumb";
import connectToDB from "@/configs/db";
import { articleListQuerySchema } from "@/validators/article";
import articleService from "@/services/server/public/article";
import { toInitialPage } from "@/utils/initialPage";
import { firstParam, listKey } from "@/utils/searchParams";
import type { ArticleCategoryOption, ArticleSummary, PageProps, Pagination } from "@/types";

const DEFAULT_LIMIT = 15;
type ArticlesResult = { data: ArticleSummary[]; pagination: Pagination };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = firstParam(params.q);
  const isFiltered = Boolean(q || firstParam(params.category));

  return {
    title: q ? `Search: ${q} - Articles` : "Our Articles",
    description: "Read our latest articles, guides and news.",
    ...(isFiltered && { robots: { index: false, follow: true } }),
  };
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  await connectToDB();

  const params = await searchParams;
  const q = firstParam(params.q);
  const category = firstParam(params.category);

  const parsed = articleListQuerySchema.safeParse({ limit: firstParam(params.limit, 10) || DEFAULT_LIMIT });
  const limit: number = parsed.success ? parsed.data.limit : DEFAULT_LIMIT;

  // same service as GET /api/articles
  const [result, categories] = await Promise.all([
    articleService.getPublicArticles({ limit, category, q }) as Promise<ArticlesResult>,
    articleService.getPublicArticleCategories() as Promise<ArticleCategoryOption[]>,
  ]);

  return (
    <div className="page-container">
      <Breadcrumb route="articles" title="Articles" />
      <ArticlesSearch categories={categories} />
      <ArticlesList
        key={listKey({ q, category })}
        query={{ q, category }}
        initialPage={toInitialPage(result, limit)}
        limit={limit}
      />
    </div>
  );
}
