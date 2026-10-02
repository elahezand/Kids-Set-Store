"use client";

import { useState } from "react";
import Link from "next/link";
import { LuEye, LuMessageSquare, LuTrash2 } from "react-icons/lu";
import EmptyState from "@/components/modules/ui/emptyState";
import Modal from "@/components/modules/ui/modal";
import Stars from "@/components/modules/ui/stars";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import LoadMore from "@/components/modules/main/loadMore";
import { useDeleteMyComment, useMyComments } from "@/services/client/panel";
import { formatDate } from "@/utils/format";
import type { CommentStatus, MyComment, Paginated } from "@/types";

const STATUS: Record<CommentStatus, { label: string; badge: string }> = {
  approved: { label: "Approved", badge: "badge-success" },
  pending: { label: "Pending", badge: "badge-warning" },
  rejected: { label: "Rejected", badge: "badge-danger" },
  spam: { label: "Rejected", badge: "badge-danger" },
  deleted: { label: "Deleted", badge: "badge-neutral" },
};

interface CommentsListProps {
  initialPage: Paginated<MyComment>;
  limit: number;
}

export default function CommentsList({ initialPage, limit }: CommentsListProps) {
  const { items: comments, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyComments(initialPage, limit);
  const [viewing, setViewing] = useState<MyComment | null>(null);
  const [deleting, setDeleting] = useState<MyComment | null>(null);

  const remove = useDeleteMyComment();

  const productLink = (comment: MyComment) =>
    comment.product ? (
      <Link
        href={`/products/${comment.product._id}`}
        className="font-medium text-gray-900 hover:text-sage-700 dark:text-gray-100 dark:hover:text-sage-300"
      >
        {comment.product.title}
      </Link>
    ) : (
      <span className="text-gray-600">Product removed</span>
    );

  const actions = (comment: MyComment) => (
    <div className="flex gap-2">
      <button type="button" onClick={() => setViewing(comment)} className="btn btn-secondary btn-sm">
        <LuEye className="size-3.5" /> View
      </button>
      <button
        type="button"
        onClick={() => setDeleting(comment)}
        className="btn btn-soft-danger btn-sm btn-icon"
        aria-label="Delete comment"
        title="Delete"
      >
        <LuTrash2 className="size-3.5" />
      </button>
    </div>
  );

  return (
    <section className="card overflow-hidden">
      <div className="card-header">
        <h2 className="card-title">My comments</h2>
      </div>

      {comments.length === 0 ? (
        <EmptyState
          title="No comments yet"
          description="Reviews you write on products will show up here."
          icon={LuMessageSquare}
        />
      ) : (
        <>
          {/* phones */}
          <ul className="divide-y divide-gray-200 md:hidden dark:divide-white/5">
            {comments.map((comment) => {
              const status = STATUS[comment.status] ?? STATUS.pending;
              return (
                <li key={String(comment._id)} className="space-y-2 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 text-sm">{productLink(comment)}</div>
                    <span className={`badge ${status.badge} shrink-0`}>{status.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-500">
                    <Stars score={comment.rating ?? 0} className="text-xs" />
                    <span>·</span>
                    <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                  </div>
                  <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-400">{comment.body}</p>
                  {actions(comment)}
                </li>
              );
            })}
          </ul>

          {/* tablets / desktop */}
          <div className="table-wrap hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((comment) => {
                  const status = STATUS[comment.status] ?? STATUS.pending;
                  return (
                    <tr key={String(comment._id)}>
                      <td className="max-w-[260px] truncate">{productLink(comment)}</td>
                      <td className="whitespace-nowrap tabular-nums">{formatDate(comment.createdAt)}</td>
                      <td>
                        <Stars score={comment.rating ?? 0} className="text-xs" />
                      </td>
                      <td>
                        <span className={`badge ${status.badge}`}>{status.label}</span>
                      </td>
                      <td>
                        <div className="flex justify-end">{actions(comment)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 pb-6">
            <LoadMore
              hasMore={Boolean(hasNextPage)}
              isLoading={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
              count={comments.length}
              limit={limit}
              noun="comments"
            />
          </div>
        </>
      )}

      {viewing && (
        <Modal title="Your comment" description={viewing.product?.title} onClose={() => setViewing(null)}>
          <Stars score={viewing.rating ?? 0} className="mb-3 text-sm" />
          <p className="text-sm leading-7 break-words whitespace-pre-line text-gray-800 dark:text-gray-200">
            {viewing.body}
          </p>
        </Modal>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this comment?"
        description="It will be removed from the product page. This can't be undone."
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && remove.mutate(String(deleting._id), { onSuccess: () => setDeleting(null) })
        }
      />
    </section>
  );
}
