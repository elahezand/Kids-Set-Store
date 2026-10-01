import type { Id } from "./api";

/* services/server/public/category getAllCategories() node */
export interface CategoryNode {
  id: Id;
  title: string;
  /** alias of title (older UI) */
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  children: CategoryNode[];
}

/* flat option for a <select> (with depth prefix) */
export interface CategoryOption {
  slug: string;
  label: string;
}

export interface CategoryDetail {
  _id: unknown;
  title: string;
  name?: string;
  slug: string;
  description?: string;
}
