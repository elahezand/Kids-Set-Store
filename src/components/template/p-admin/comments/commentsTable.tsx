"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { LuCheck, LuCornerDownRight, LuEye, LuMessageSquare, LuReply, LuTrash2, LuX } from "react-icons/lu";
import DateRangeFilter from "@/components/modules/panel/dateRangeFilter";
import ListCard from "@/components/modules/panel/listCard";
import SearchBox from "@/components/modules/panel/searchBox";
import StatusTabs from "@/components/modules/panel/statusTabs";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import EmptyState from "@/components/modules/ui/emptyState";
import Modal from "@/components/modules/ui/modal";
import Stars from "@/components/modules/ui/stars";
import { useAdminComments, useDeleteComment, useModerateComment, useReplyComment } from "@/services/client/admin";
import { ROUTES } from "@/utils/constants";
import { formatDate } from "@/utils/format";
import { ADMIN_COMMENT_TABS, COMMENT_STATUS, personName } from "@/utils/panelView";
import { filteredEmptyText } from "@/utils/adminFilters";
import type { AdminFilters, AdminListParams } from "@/utils/adminFilters";
import type { AdminComment, AdminCommentReply, AdminCommentStatusFilter, Paginated } from "@/types";

interface CommentsTableProps {
  initialPage: Paginated<AdminComment>;
  params: AdminListParams;
  filters: AdminFilters<AdminCommentStatusFilter>;
  limit: number;
}

type Dialog = { comment: AdminComment; mode: "view" | "reply" | "reject" } | null;

export default function CommentsTable({ initialPage, params, filters, limit }: CommentsTableProps) {
  const { items: comments, ...pager } = useAdminComments(initialPage, params);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [deleting, setDeleting] = useState<{ id: string; isReply: boolean } | null>(null);
  const close = () => setDialog(null);

  const moderate = useModerateComment({ onDone: close });
  const reply = useReplyComment({ onDone: close });
  const remove = useDeleteComment();

  const submitText = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dialog) return;
    const text = String(new FormData(event.currentTarget).get("text") || "").trim();
    const id = String(dialog.comment._id);
    if (dialog.mode === "reply") reply.mutate({ id, body: text });
    if (dialog.mode === "reject") moderate.mutate({ id, status: "rejected", reason: text });
  };

  const product = (comment: AdminComment) =>
    comment.product ? (
      <Link
        href={ROUTES.product(String(comment.product._id))}
        target="_blank"
        className="font-medium text-gray-900 hover:text-sage-700 dark:text-gray-100 dark:hover:text-sage-300"
      >
        {comment.product.title}
      </Link>
    ) : (
      <span className="text-gray-600">Product removed</span>
    );

  const actions = (comment: AdminComment) => {
    const id = String(comment._id);
    return (
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setDialog({ comment, mode: "view" })}
          className="btn btn-ghost btn-sm btn-icon"
          aria-label="Read comment"
          title="Read"
        >
          <LuEye className="size-4" />
        </button>
        {comment.status !== "approved" && (
          <button
            type="button"
            onClick={() => moderate.mutate({ id, status: "approved" })}
            disabled={moderate.isPending}
            className="btn btn-soft-primary btn-sm"
          >
            <LuCheck className="size-3.5" /> Approve
          </button>
        )}
        {comment.status === "approved" && !comment.replies?.length && (
          <button
            type="button"
            onClick={() => setDialog({ comment, mode: "reply" })}
            className="btn btn-secondary btn-sm"
          >
            <LuReply className="size-3.5" /> Reply
          </button>
        )}
        {comment.status !== "rejected" && comment.status !== "spam" && (
          <button
            type="button"
            onClick={() => setDialog({ comment, mode: "reject" })}
            className="btn btn-soft-danger btn-sm btn-icon"
            aria-label="Reject comment"
            title="Reject"
          >
            <LuX className="size-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setDeleting({ id, isReply: false })}
          className="btn btn-soft-danger btn-sm btn-icon"
          aria-label="Delete comment"
          title="Delete"
        >
          <LuTrash2 className="size-3.5" />
        </button>
      </div>
    );
  };

  return (
    <>
      <ListCard
        title="Product reviews"
        toolbar={
          <>
            <StatusTabs tabs={ADMIN_COMMENT_TABS} value={filters.status} />
            <DateRangeFilter value={filters} label="Written" />
            <SearchBox placeholder="Search in comments…" />
          </>
        }
        isEmpty={comments.length === 0}
        empty={
          <EmptyState
            title={filters.status === "pending" ? "Nothing to review" : "No comments found"}
            description={filteredEmptyText(filters) ?? "Customer reviews will show up here."}
            icon={LuMessageSquare}
          />
        }
        pager={{ ...pager, count: comments.length, limit, noun: "comments" }}
      >
        <ul className="divide-y divide-gray-200 dark:divide-white/5">
          {comments.map((comment) => {
            const status = COMMENT_STATUS[comment.status] ?? COMMENT_STATUS.pending;
            return (
              <li
                key={String(comment._id)}
                className="flex flex-col gap-3 px-4 py-4 sm:px-5 lg:flex-row lg:items-start"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {personName(comment.user, "Customer")}
                    </span>
                    <span className="text-gray-500">on</span>
                    {product(comment)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700 dark:text-gray-500">
                    <Stars score={comment.rating ?? 0} className="text-xs" />
                    <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                    <span className={`badge ${status.badge} py-0 text-[10px]`}>{status.label}</span>
                  </div>
                  <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-400">{comment.body}</p>
                  {comment.moderation?.rejectReason && comment.status !== "approved" && (
                    <p className="text-xs text-danger-500">Reason: {comment.moderation.rejectReason}</p>
                  )}
                  {comment.replies?.map((item) => (
                    <ReplyItem
                      key={String(item._id)}
                      reply={item}
                      onDelete={() => setDeleting({ id: String(item._id), isReply: true })}
                    />
                  ))}
                </div>
                <div className="shrink-0">{actions(comment)}</div>
              </li>
            );
          })}
        </ul>
      </ListCard>

      {dialog?.mode === "view" && (
        <Modal
          title={personName(dialog.comment.user, "Customer")}
          description={dialog.comment.product?.title}
          onClose={close}
        >
          <Stars score={dialog.comment.rating ?? 0} className="mb-3 text-sm" />
          <p className="text-sm leading-7 break-words whitespace-pre-line text-gray-800 dark:text-gray-200">
            {dialog.comment.body}
          </p>
          {dialog.comment.replies?.map((item) => (
            <ReplyItem key={String(item._id)} reply={item} full />
          ))}
        </Modal>
      )}

      {(dialog?.mode === "reply" || dialog?.mode === "reject") && (
        <Modal
          title={dialog.mode === "reply" ? "Reply publicly" : "Reject this comment"}
          description={
            dialog.mode === "reply"
              ? "Your reply appears under the review on the product page."
              : "The customer sees this reason in their account."
          }
          onClose={close}
          footer={
            <>
              <button type="button" onClick={close} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                form="comment-text-form"
                disabled={reply.isPending || moderate.isPending}
                className={`btn ${dialog.mode === "reply" ? "btn-primary" : "btn-soft-danger"}`}
              >
                {reply.isPending || moderate.isPending
                  ? "Please wait…"
                  : dialog.mode === "reply"
                    ? "Publish reply"
                    : "Reject"}
              </button>
            </>
          }
        >
          <blockquote className="mb-4 border-l-4 border-gray-200 pl-3 text-sm text-gray-700 dark:border-white/10 dark:text-gray-400">
            <p className="line-clamp-3">{dialog.comment.body}</p>
          </blockquote>
          <form id="comment-text-form" onSubmit={submitText}>
            <label htmlFor="comment-text" className="label">
              {dialog.mode === "reply" ? "Your reply" : "Reason"}
            </label>
            <textarea
              id="comment-text"
              name="text"
              rows={4}
              required
              minLength={2}
              maxLength={dialog.mode === "reply" ? 2000 : 500}
              className="input"
              autoFocus
            />
          </form>
        </Modal>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting?.isReply ? "Delete this reply?" : "Delete this comment?"}
        description={
          deleting?.isReply
            ? "It is removed from the product page, and you can write a new reply."
            : "It is removed from the product page and the product score is updated."
        }
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}

function ReplyItem({
  reply,
  full = false,
  onDelete,
}: {
  reply: AdminCommentReply;
  full?: boolean;
  onDelete?: () => void;
}) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-xl border-l-4 border-sage-300 bg-sage-50/60 py-2 pr-2 pl-3 dark:border-sage-500/40 dark:bg-sage-500/5">
      <LuCornerDownRight className="mt-0.5 size-3.5 shrink-0 text-sage-600" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-700 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-gray-100">Store reply</span>
          {reply.user?.username ? ` · ${reply.user.username}` : ""}
          {reply.createdAt ? ` · ${formatDate(reply.createdAt)}` : ""}
        </p>
        <p
          className={`text-sm text-gray-700 dark:text-gray-300 ${full ? "break-words whitespace-pre-line" : "line-clamp-2"}`}
        >
          {reply.body}
        </p>
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="btn btn-ghost btn-sm btn-icon shrink-0"
          aria-label="Delete reply"
          title="Delete reply"
        >
          <LuTrash2 className="size-3.5" />
        </button>
      )}
    </div>
  );
}
