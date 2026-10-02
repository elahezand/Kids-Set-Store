import type { Metadata } from "next";
import PageHeader from "@/components/modules/panel/pageHeader";
import CommentsList from "@/components/template/p-user/comments/commentsList";
import commentService from "@/services/server/user/comment";
import { getPanelSession } from "@/utils/auth/panelUser";
import { toInitialPage } from "@/utils/initialPage";
import type { MyComment, Pagination } from "@/types";

export const metadata: Metadata = { title: "Comments" };

const LIMIT = 10;

export default async function CommentsPage() {
  const { user } = await getPanelSession();
  if (!user) return null;

  const result = (await commentService.getMine(user._id, { limit: LIMIT })) as {
    data: MyComment[];
    pagination: Pagination;
  };

  return (
    <>
      <PageHeader title="Comments" description="Reviews you've written on products." />
      <CommentsList initialPage={toInitialPage(result, LIMIT)} limit={LIMIT} />
    </>
  );
}
