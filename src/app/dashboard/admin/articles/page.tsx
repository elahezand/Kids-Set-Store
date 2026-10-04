import Link from "next/link";
import { LuPlus } from "react-icons/lu";
import PageHeader from "@/components/modules/panel/pageHeader";
import ArticlesTable from "@/components/template/p-admin/articles/articlesTable";
import articleService from "@/services/server/admin/article";
import { adminListParams, filtersKey, readAdminFilters } from "@/utils/adminFilters";
import { ROUTES } from "@/utils/constants";
import { toInitialPage } from "@/utils/initialPage";
import { ARTICLE_TABS, tabValues } from "@/utils/panelView";
import type { Metadata } from "next";
import type { AdminArticle, PageProps, Pagination } from "@/types";

export const metadata: Metadata = { title: "Articles" };

const LIMIT = 15;

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const filters = readAdminFilters(await searchParams, tabValues(ARTICLE_TABS));
  const params = adminListParams.articles(LIMIT, filters);

  const result = (await articleService.getAllArticlesAdmin(params)) as { data: AdminArticle[]; pagination: Pagination };

  return (
    <>
      <PageHeader
        title="Articles"
        description="Write blog posts and decide when they go live."
        actions={
          <Link href={ROUTES.admin.newArticle} className="btn btn-primary">
            <LuPlus className="size-4" /> New article
          </Link>
        }
      />
      <ArticlesTable
        key={filtersKey(filters)}
        filters={filters}
        params={params}
        initialPage={toInitialPage(result, LIMIT)}
        limit={LIMIT}
      />
    </>
  );
}
