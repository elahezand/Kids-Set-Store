import type { Id } from "./api";

export interface CategoryNode {
  id: Id;
  title: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  children: CategoryNode[];
}

export interface CategoryOption {
  slug: string;
  label: string;
}

export type CategoryFilterType = "select" | "radio" | "boolean" | "text";

export interface CategoryFilterOption {
  value: string;
  label: string;
}

export interface CategoryFilter {
  name: string;
  slug: string;
  type: CategoryFilterType;
  options: CategoryFilterOption[];
  required?: boolean;
}

export interface CategoryDetail {
  _id: unknown;
  title: string;
  name?: string;
  slug: string;
  description?: string;
  filters?: CategoryFilter[];
}
