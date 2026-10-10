"use client";

import { type FormEvent, useState } from "react";
import { LuCheck, LuLifeBuoy, LuPencil, LuPlus, LuTrash2, LuX } from "react-icons/lu";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import EmptyState from "@/components/modules/ui/emptyState";
import DepartmentForm from "@/components/template/p-admin/departments/departmentForm";
import { useDeleteDepartment, useDeleteTopic, useSaveTopic, useUpdateDepartment } from "@/services/client/admin";
import type { AdminDepartmentOverview, AdminSubDepartment, Id } from "@/types";

type Deleting =
  | { kind: "department"; item: AdminDepartmentOverview }
  | { kind: "topic"; item: AdminSubDepartment }
  | null;

function Topics({ department }: { department: AdminDepartmentOverview }) {
  const { create, update } = useSaveTopic();
  const remove = useDeleteTopic();
  const [newTitle, setNewTitle] = useState("");
  const [renaming, setRenaming] = useState<{ id: Id; title: string } | null>(null);
  const [deleting, setDeleting] = useState<AdminSubDepartment | null>(null);

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newTitle.trim();
    if (title.length < 2) return;
    create.mutate({ department: department.id, title }, { onSuccess: () => setNewTitle("") });
  };

  const rename = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!renaming || renaming.title.trim().length < 2) return;
    update.mutate({ id: renaming.id, title: renaming.title.trim() }, { onSuccess: () => setRenaming(null) });
  };

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-400">Topics</p>

      {department.subDepartments.length === 0 ? (
        <p className="mb-3 rounded-lg bg-sun-50 px-3 py-2 text-xs text-sun-800 dark:bg-sun-500/10 dark:text-sun-300">
          Add at least one topic. Customers have to pick one, so they can&apos;t open a ticket here yet.
        </p>
      ) : (
        <ul className="mb-3 flex flex-wrap gap-1.5">
          {department.subDepartments.map((topic) =>
            renaming?.id === topic.id ? (
              <li key={topic.id}>
                <form onSubmit={rename} className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={renaming.title}
                    onChange={(event) => setRenaming({ id: topic.id, title: event.target.value })}
                    onKeyDown={(event) => event.key === "Escape" && setRenaming(null)}
                    maxLength={80}
                    aria-label="Topic title"
                    className="input h-8 w-40 py-1 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={update.isPending}
                    className="btn btn-soft-primary btn-sm btn-icon"
                    aria-label="Save topic"
                  >
                    <LuCheck className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenaming(null)}
                    className="btn btn-ghost btn-sm btn-icon"
                    aria-label="Cancel"
                  >
                    <LuX className="size-3.5" />
                  </button>
                </form>
              </li>
            ) : (
              <li
                key={topic.id}
                className="group flex items-center gap-1 rounded-full bg-gray-100 py-1 pr-1 pl-3 text-xs text-gray-800 dark:bg-white/5 dark:text-gray-200"
              >
                {topic.title}
                {topic.ticketsCount > 0 && (
                  <span className="text-gray-600 tabular-nums dark:text-gray-500">· {topic.ticketsCount}</span>
                )}
                <button
                  type="button"
                  onClick={() => setRenaming({ id: topic.id, title: topic.title })}
                  className="rounded-full p-1 text-gray-600 hover:bg-white hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-gray-100"
                  aria-label={`Rename ${topic.title}`}
                  title="Rename"
                >
                  <LuPencil className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(topic)}
                  disabled={topic.ticketsCount > 0}
                  className="rounded-full p-1 text-gray-600 hover:bg-white hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/10"
                  aria-label={`Delete ${topic.title}`}
                  title={topic.ticketsCount > 0 ? "Tickets use this topic - rename it instead" : "Delete"}
                >
                  <LuX className="size-3" />
                </button>
              </li>
            )
          )}
        </ul>
      )}

      <form onSubmit={add} className="flex gap-2">
        <input
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder="New topic, e.g. Late delivery"
          maxLength={80}
          aria-label={`New topic for ${department.title}`}
          className="input h-9 flex-1 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={create.isPending || newTitle.trim().length < 2}
          className="btn btn-secondary btn-sm"
        >
          <LuPlus className="size-3.5" /> Add
        </button>
      </form>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete the topic "${deleting?.title ?? ""}"?`}
        description="Customers won't see it when they open a ticket."
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}

export default function DepartmentsManager({ departments }: { departments: AdminDepartmentOverview[] }) {
  const [editing, setEditing] = useState<AdminDepartmentOverview | "new" | null>(null);
  const [deleting, setDeleting] = useState<Deleting>(null);
  const toggle = useUpdateDepartment();
  const remove = useDeleteDepartment();

  const nextOrder = departments.reduce((max, item) => Math.max(max, item.order + 1), 0);
  const newButton = (
    <button type="button" onClick={() => setEditing("new")} className="btn btn-primary btn-sm">
      <LuPlus className="size-4" /> New department
    </button>
  );

  if (!departments.length) {
    return (
      <section className="card">
        <EmptyState
          title="No departments yet"
          description="Customers need at least one department with a topic before they can open a ticket."
          icon={LuLifeBuoy}
          action={newButton}
        />
        {editing && <DepartmentForm nextOrder={0} onClose={() => setEditing(null)} />}
      </section>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">{newButton}</div>

      <div className="grid gap-4 lg:grid-cols-2">
        {departments.map((department) => (
          <section key={department.id} className={`card ${department.isActive ? "" : "opacity-75"}`}>
            <div className="card-header flex-nowrap items-start">
              <div className="min-w-0">
                <h2 className="card-title flex flex-wrap items-center gap-2">
                  {department.title}
                  {!department.isActive && <span className="badge badge-neutral">Hidden</span>}
                </h2>
                <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">
                  {department.ticketsCount
                    ? `${department.ticketsCount} ticket${department.ticketsCount === 1 ? "" : "s"}`
                    : "No tickets yet"}
                  {` · position ${department.order}`}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-700 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={department.isActive}
                    disabled={toggle.isPending}
                    onChange={(event) => toggle.mutate({ id: department.id, isActive: event.target.checked })}
                    className="checkbox"
                    aria-label={department.isActive ? `Hide ${department.title}` : `Show ${department.title}`}
                  />
                  Visible
                </label>
                <button
                  type="button"
                  onClick={() => setEditing(department)}
                  className="btn btn-soft-primary btn-sm btn-icon"
                  aria-label={`Edit ${department.title}`}
                  title="Edit"
                >
                  <LuPencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting({ kind: "department", item: department })}
                  disabled={department.ticketsCount > 0}
                  className="btn btn-soft-danger btn-sm btn-icon disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Delete ${department.title}`}
                  title={department.ticketsCount > 0 ? "Tickets use it - hide it instead" : "Delete"}
                >
                  <LuTrash2 className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="card-body space-y-4">
              {department.description && (
                <p className="text-sm text-gray-700 dark:text-gray-400">{department.description}</p>
              )}
              <Topics department={department} />
            </div>
          </section>
        ))}
      </div>

      {editing && (
        <DepartmentForm
          department={editing === "new" ? null : editing}
          nextOrder={nextOrder}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={deleting?.kind === "department"}
        title={`Delete ${deleting?.item.title ?? "this department"}?`}
        description="Its topics are deleted too. This can't be undone."
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.item.id, { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}
