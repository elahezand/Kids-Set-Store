"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/modules/ui/modal";
import { useSaveCategory } from "@/services/client/admin";
import { selfAndDescendants, toCategoryRows } from "@/utils/categoryTree";
import type { AdminCategory, Id } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(100, "At most 100 characters"),
  slug: z
    .string()
    .trim()
    .max(120, "At most 120 characters")
    .regex(/^[a-zA-Z0-9-]*$/, "Use only letters, numbers and dashes"),
  parentId: z.string(),
  description: z.string().trim().max(300, "At most 300 characters"),
});

type FormValues = z.infer<typeof schema>;

interface CategoryFormProps {
  categories: AdminCategory[];
  /** Editing this category; empty means create */
  category?: AdminCategory | null;
  /** Pre-selected parent when adding a sub category */
  parentId?: Id | null;
  onClose: () => void;
}

export default function CategoryForm({ categories, category, parentId, onClose }: CategoryFormProps) {
  const editing = Boolean(category);
  const save = useSaveCategory(category?._id, { onDone: onClose });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.title ?? "",
      slug: category?.slug ?? "",
      parentId: (category ? category.parentId : parentId) ?? "",
      description: category?.description ?? "",
    },
  });

  const parentOptions = useMemo(() => {
    const blocked = category ? selfAndDescendants(categories, category._id) : new Set<Id>();
    return toCategoryRows(categories).filter((row) => !blocked.has(row._id));
  }, [categories, category]);

  const onSubmit = (values: FormValues) =>
    save.mutate({
      name: values.name,
      slug: values.slug || undefined,
      parentId: values.parentId || null,
      description: values.description,
    });

  return (
    <Modal
      title={editing ? `Edit ${category?.title}` : "New category"}
      description={
        editing && category?.productsCount
          ? `${category.productsCount} products use this category. Moving it keeps them in it.`
          : "Shoppers see categories in the menu and on the home page."
      }
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={save.isPending}>
            Cancel
          </button>
          <button type="submit" form="category-form" className="btn btn-primary" disabled={save.isPending}>
            {save.isPending ? "Saving…" : editing ? "Save changes" : "Create category"}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category-name" className="label">
            Name
          </label>
          <input
            id="category-name"
            {...register("name")}
            placeholder="Girls' dresses"
            autoComplete="off"
            className={`input ${errors.name ? "input-error" : ""}`}
          />
          {errors.name && <span className="field-error">{errors.name.message}</span>}
        </div>

        <div>
          <label htmlFor="category-slug" className="label">
            Slug
          </label>
          <input
            id="category-slug"
            {...register("slug")}
            placeholder={editing ? "Keep current" : "Made from the name"}
            autoComplete="off"
            className={`input font-mono text-sm lowercase ${errors.slug ? "input-error" : ""}`}
          />
          {errors.slug ? (
            <span className="field-error">{errors.slug.message}</span>
          ) : (
            <span className="field-hint">Used in the link: /products?category=slug</span>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="category-parent" className="label">
            Parent
          </label>
          <select id="category-parent" {...register("parentId")} className="input">
            <option value="">None — top-level category</option>
            {parentOptions.map((row) => (
              <option key={row._id} value={row._id}>
                {"\u00A0\u00A0".repeat(row.depth * 2)}
                {row.depth ? "└ " : ""}
                {row.title}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="category-description" className="label">
            Description
          </label>
          <textarea
            id="category-description"
            rows={3}
            {...register("description")}
            placeholder="Optional. Shown under the name on the home page."
            className={`input resize-y ${errors.description ? "input-error" : ""}`}
          />
          {errors.description && <span className="field-error">{errors.description.message}</span>}
        </div>
      </form>
    </Modal>
  );
}
