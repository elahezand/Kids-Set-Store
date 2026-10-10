"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LuExternalLink, LuFolderTree, LuPencil, LuPlus, LuSearch, LuTrash2 } from "react-icons/lu";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import EmptyState from "@/components/modules/ui/emptyState";
import CategoryForm from "@/components/template/p-admin/categories/categoryForm";
import { useDeleteCategory } from "@/services/client/admin";
import { toCategoryRows, type CategoryRow } from "@/utils/categoryTree";
import { ROUTES } from "@/utils/constants";
import type { AdminCategory, Id } from "@/types";

type Editing = { category?: AdminCategory | null; parentId?: Id | null } | null;

const blockReason = (category: AdminCategory) => {
  if (category.childrenCount) return `Has ${category.childrenCount} sub categories - move or delete them first`;
  if (category.productsCount) return `${category.productsCount} products use it - move them first`;
  return null;
};

export default function CategoriesManager({ categories }: { categories: AdminCategory[] }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);
  const remove = useDeleteCategory();

  const rows = useMemo(() => toCategoryRows(categories), [categories]);
  const term = query.trim().toLowerCase();
  const visible = term
    ? rows.filter((row) => row.title.toLowerCase().includes(term) || row.slug.toLowerCase().includes(term))
    : rows;

  const topLevel = rows.filter((row) => row.depth === 0).length;

  const actions = (row: CategoryRow) => {
    const blocked = blockReason(row);
    return (
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => setEditing({ parentId: row._id })}
          className="btn btn-ghost btn-sm btn-icon"
          aria-label={`Add a sub category to ${row.title}`}
          title="Add sub category"
        >
          <LuPlus className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setEditing({ category: row })}
          className="btn btn-soft-primary btn-sm btn-icon"
          aria-label={`Edit ${row.title}`}
          title="Edit"
        >
          <LuPencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setDeleting(row)}
          disabled={Boolean(blocked)}
          className="btn btn-soft-danger btn-sm btn-icon disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Delete ${row.title}`}
          title={blocked ?? "Delete"}
        >
          <LuTrash2 className="size-3.5" />
        </button>
      </div>
    );
  };

  return (
    <>
      <section className="card overflow-hidden">
        <div className="card-header">
          <div>
            <h2 className="card-title">Category tree</h2>
            <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">
              {categories.length} categories · {topLevel} top-level
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <div className="relative w-full sm:w-64">
              <LuSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter categories..."
                aria-label="Filter categories"
                className="input py-2 pr-3 pl-9 text-sm"
              />
            </div>
            <button type="button" onClick={() => setEditing({})} className="btn btn-primary btn-sm">
              <LuPlus className="size-4" /> New category
            </button>
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            title={term ? "No matching categories" : "No categories yet"}
            description={term ? `Nothing matches "${query}".` : "Create the first one so products can be grouped."}
            icon={LuFolderTree}
            action={
              !term && (
                <button type="button" onClick={() => setEditing({})} className="btn btn-primary btn-sm">
                  <LuPlus className="size-4" /> New category
                </button>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-white/5">
            {visible.map((row) => (
              <li key={row._id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <div
                  className="flex min-w-0 flex-1 items-center gap-3"
                  style={{ paddingLeft: term ? 0 : `${Math.min(row.depth, 6) * 1.5}rem` }}
                >
                  {!term && row.depth > 0 && (
                    <span aria-hidden="true" className="-ml-3 h-px w-3 shrink-0 bg-gray-300 dark:bg-white/15" />
                  )}
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        className={`truncate text-sm text-gray-900 dark:text-gray-100 ${row.depth ? "font-medium" : "font-semibold"}`}
                      >
                        {row.title}
                      </span>
                      {!row.isActive && <span className="badge badge-neutral">Hidden</span>}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-700 dark:text-gray-500">
                      {term && row.path.length > 0 && <span>{row.path.join(" / ")} / </span>}
                      <code className="font-mono">{row.slug}</code>
                      {row.description && <span className="hidden sm:inline"> · {row.description}</span>}
                    </p>
                  </div>
                </div>

                <div className="hidden shrink-0 items-center gap-4 text-xs text-gray-700 tabular-nums sm:flex dark:text-gray-400">
                  <Link
                    href={ROUTES.category(row.slug)}
                    target="_blank"
                    className="inline-flex items-center gap-1 hover:text-brand-700 dark:hover:text-brand-300"
                    title="Open in the store"
                  >
                    {row.productsCount} products
                    <LuExternalLink className="size-3" />
                  </Link>
                  {row.childrenCount > 0 && <span>{row.childrenCount} sub</span>}
                </div>

                {actions(row)}
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing && (
        <CategoryForm
          categories={categories}
          category={editing.category}
          parentId={editing.parentId}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${deleting?.title ?? "this category"}?`}
        description="It disappears from the store menu. This can't be undone."
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting._id, { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}
