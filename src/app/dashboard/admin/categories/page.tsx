import PageHeader from "@/components/modules/panel/pageHeader";
import CategoriesManager from "@/components/template/p-admin/categories/categoriesManager";
import categoryService from "@/services/server/admin/category";
import { requireAdmin } from "@/utils/auth/panelUser";
import { toPlain } from "@/utils/format";
import type { Metadata } from "next";
import type { AdminCategory } from "@/types";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = toPlain((await categoryService.getAdminCategories()) as AdminCategory[]);

  return (
    <>
      <PageHeader
        title="Categories"
        description="How products are grouped in the store menu. Nest categories to build sub menus."
      />
      <CategoriesManager categories={categories} />
    </>
  );
}
