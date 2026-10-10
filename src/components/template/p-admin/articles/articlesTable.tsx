"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuEye, LuEyeOff, LuNewspaper, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import DateRangeFilter from "@/components/modules/panel/dateRangeFilter";
import ListCard from "@/components/modules/panel/listCard";
import SearchBox from "@/components/modules/panel/searchBox";
import StatusTabs from "@/components/modules/panel/statusTabs";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import EmptyState from "@/components/modules/ui/emptyState";
import { useAdminArticles, useDeleteArticle, useToggleArticle } from "@/services/client/admin";
import { PLACEHOLDER_IMAGE, ROUTES } from "@/utils/constants";
import { formatDate } from "@/utils/format";
import { ARTICLE_TABS, articleState } from "@/utils/panelView";
import { filteredEmptyText } from "@/utils/adminFilters";
import type { AdminFilters, AdminListParams } from "@/utils/adminFilters";
import type { AdminArticle, ArticleStatusFilter, Paginated } from "@/types";

interface ArticlesTableProps {
  initialPage: Paginated<AdminArticle>;
  params: AdminListParams;
  filters: AdminFilters<ArticleStatusFilter>;
  limit: number;
}

const authorName = (article: AdminArticle) =>
  article.author && typeof article.author === "object" ? article.author.username || article.author.name || "-" : "-";

export default function ArticlesTable({ initialPage, params, filters, limit }: ArticlesTableProps) {
  const { items: articles, ...pager } = useAdminArticles(initialPage, params);
  const [deleting, setDeleting] = useState<AdminArticle | null>(null);
  const toggle = useToggleArticle();
  const remove = useDeleteArticle();

  const actions = (article: AdminArticle) => (
    <div className="flex gap-1.5">
      <button
        type="button"
        onClick={() => toggle.mutate({ id: String(article._id), isPublished: !article.isPublished })}
        disabled={toggle.isPending}
        className="btn btn-ghost btn-sm btn-icon"
        aria-label={article.isPublished ? "Move to drafts" : "Publish"}
        title={article.isPublished ? "Move to drafts" : "Publish"}
      >
        {article.isPublished ? <LuEyeOff className="size-4" /> : <LuEye className="size-4" />}
      </button>
      <Link href={ROUTES.admin.article(String(article._id))} className="btn btn-secondary btn-sm">
        <LuPencil className="size-3.5" /> Edit
      </Link>
      <button
        type="button"
        onClick={() => setDeleting(article)}
        className="btn btn-soft-danger btn-sm btn-icon"
        aria-label={`Delete ${article.title}`}
        title="Delete"
      >
        <LuTrash2 className="size-3.5" />
      </button>
    </div>
  );

  return (
    <>
      <ListCard
        title="All articles"
        toolbar={
          <>
            <StatusTabs tabs={ARTICLE_TABS} value={filters.status} />
            <DateRangeFilter value={filters} label="Created" />
            <SearchBox placeholder="Search titles..." />
          </>
        }
        isEmpty={articles.length === 0}
        empty={
          <EmptyState
            title="No articles found"
            description={filteredEmptyText(filters) ?? "Write your first post for the blog."}
            icon={LuNewspaper}
            action={
              <Link href={ROUTES.admin.newArticle} className="btn btn-primary btn-sm">
                <LuPlus className="size-4" /> New article
              </Link>
            }
          />
        }
        pager={{ ...pager, count: articles.length, limit, noun: "articles" }}
      >
        <ul className="divide-y divide-gray-200 dark:divide-white/5">
          {articles.map((article) => {
            const state = articleState(article.isPublished);
            return (
              <li
                key={String(article._id)}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Image
                    width={72}
                    height={48}
                    src={article.cover || PLACEHOLDER_IMAGE}
                    alt=""
                    className="h-12 w-[72px] shrink-0 rounded-lg border border-gray-200 object-cover dark:border-white/10"
                  />
                  <div className="min-w-0 leading-tight">
                    <p className="truncate font-medium text-gray-900 dark:text-gray-100">{article.title}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-700 dark:text-gray-500">
                      <span className={`badge ${state.badge} py-0 text-[10px]`}>{state.label}</span>
                      {article.category?.title && <span>{article.category.title}</span>}
                      <span>{authorName(article)}</span>
                      <time dateTime={article.createdAt}>{formatDate(article.createdAt)}</time>
                      <span className="tabular-nums">{(article.views ?? 0).toLocaleString("en-US")} views</span>
                    </p>
                  </div>
                </div>
                <div className="shrink-0">{actions(article)}</div>
              </li>
            );
          })}
        </ul>
      </ListCard>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this article?"
        description={`"${deleting?.title}" will be removed from the blog. This can't be undone.`}
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(String(deleting._id), { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}
