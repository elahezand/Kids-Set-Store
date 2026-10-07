"use client";

import { LuFolderTree } from "react-icons/lu";
import { useQueryParams } from "@/services/client/listing";

interface CategoryFilterProps {
  /** flattened tree, e.g. { id, label: "Girls › Dresses" } */
  categories: Array<{ id: string; label: string }>;
  value: string;
  param?: string;
}

/** Picking a parent category also lists the products of its sub-categories */
export default function CategoryFilter({ categories, value, param = "category" }: CategoryFilterProps) {
  const { update, isPending } = useQueryParams<string>();

  return (
    <div className={`relative ${isPending ? "opacity-70" : ""}`}>
      <LuFolderTree className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-500" />
      <select
        value={value}
        onChange={(event) => update({ [param]: event.target.value || null })}
        disabled={isPending}
        aria-label="Filter by category"
        className={`input w-auto max-w-[14rem] py-1.5 pl-8 text-xs ${value ? "border-sage-500 text-sage-700 dark:text-sage-300" : ""}`}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </select>
    </div>
  );
}
