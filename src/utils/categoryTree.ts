import type { AdminCategory, Id } from "@/types";

export interface CategoryRow extends AdminCategory {
  depth: number;
  path: string[];
}

const childrenMap = (categories: AdminCategory[]) => {
  const ids = new Set(categories.map((category) => category._id));
  const map = new Map<Id | "root", AdminCategory[]>();
  for (const category of categories) {
    const key = category.parentId && ids.has(category.parentId) ? category.parentId : "root";
    map.set(key, [...(map.get(key) ?? []), category]);
  }
  return map;
};

export const toCategoryRows = (categories: AdminCategory[]): CategoryRow[] => {
  const map = childrenMap(categories);
  const rows: CategoryRow[] = [];
  const seen = new Set<Id>();

  const walk = (key: Id | "root", depth: number, path: string[]) => {
    for (const category of map.get(key) ?? []) {
      if (seen.has(category._id)) continue;
      seen.add(category._id);
      rows.push({ ...category, depth, path });
      walk(category._id, depth + 1, [...path, category.title]);
    }
  };

  walk("root", 0, []);
  return rows;
};

export const selfAndDescendants = (categories: AdminCategory[], id: Id): Set<Id> => {
  const map = childrenMap(categories);
  const result = new Set<Id>([id]);
  const stack = [id];
  while (stack.length) {
    const current = stack.pop() as Id;
    for (const child of map.get(current) ?? []) {
      if (result.has(child._id)) continue;
      result.add(child._id);
      stack.push(child._id);
    }
  }
  return result;
};
