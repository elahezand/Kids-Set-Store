import type { CategoryNode } from "@/types";

export const flattenCategories = (nodes: CategoryNode[], prefix = ""): Array<{ id: string; label: string }> =>
  nodes.flatMap((node) => {
    const label = prefix ? `${prefix} › ${node.title}` : node.title;
    return [{ id: node.id, label }, ...flattenCategories(node.children ?? [], label)];
  });
