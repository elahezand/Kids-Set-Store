import type { Metadata } from "next";
import PageHeader from "@/components/modules/panel/pageHeader";
import CommentsList from "@/components/template/p-user/comments/commentsList";
import commentService from "@/services/server/user/comment";
import { getPanelSession } from "@/utils/auth/panelUser";
import { toInitialPage } from "@/utils/initialPage";
import { pickStatus } from "@/utils/panelStatus";
import { COMMENT_TABS, tabValues } from "@/utils/panelView";
import type { MyComment, PageProps, Pagination } from "@/types";

export const metadata: Metadata = { title: "Comments" };

const LIMIT = 10;

export default async function CommentsPage({ searchParams }: PageProps) {
  const { user } = await getPanelSession();
  if (!user) return null;

  const status = pickStatus(await searchParams, tabValues(COMMENT_TABS));

  const result = (await commentService.getMine(user._id, {
    limit: LIMIT,
    ...(status !== "all" && { status }),
  })) as {
    data: MyComment[];
    pagination: Pagination;
  };

  return (
    <>
      <PageHeader title="Comments" description="Reviews you've written on products." />
      <CommentsList key={status} status={status} initialPage={toInitialPage(result, LIMIT)} limit={LIMIT} />
    </>
  );
}
