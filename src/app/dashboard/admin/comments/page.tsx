import PageHeader from "@/components/modules/panel/pageHeader";
import CommentsTable from "@/components/template/p-admin/comments/commentsTable";
import commentService from "@/services/server/admin/comment";
import { adminListParams, filtersKey, readAdminFilters } from "@/utils/adminFilters";
import { requireAdmin } from "@/utils/auth/panelUser";
import { toInitialPage } from "@/utils/initialPage";
import { ADMIN_COMMENT_TABS, tabValues } from "@/utils/panelView";
import type { Metadata } from "next";
import type { AdminComment, PageProps, Pagination } from "@/types";

export const metadata: Metadata = { title: "Comments" };

const LIMIT = 15;

export default async function AdminCommentsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const filters = readAdminFilters(await searchParams, tabValues(ADMIN_COMMENT_TABS));
  const params = adminListParams.comments(LIMIT, filters);

  const result = (await commentService.getAdmin(params)) as { data: AdminComment[]; pagination: Pagination };

  return (
    <>
      <PageHeader title="Comments" description="Review what customers write before it goes live, and reply to them." />
      <CommentsTable
        key={filtersKey(filters)}
        filters={filters}
        params={params}
        initialPage={toInitialPage(result, LIMIT)}
        limit={LIMIT}
      />
    </>
  );
}
