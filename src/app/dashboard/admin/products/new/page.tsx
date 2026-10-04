import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import PageHeader from "@/components/modules/panel/pageHeader";
import ProductForm from "@/components/template/p-admin/products/productForm";
import categoryService from "@/services/server/public/category";
import { ROUTES } from "@/utils/constants";
import type { Metadata } from "next";
import type { CategoryNode } from "@/types";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = (await categoryService.getAllCategories()) as CategoryNode[];

  return (
    <>
      <PageHeader
        title="New product"
        description="Add the options (size, color…) and one row per variant you sell."
        actions={
          <Link href={ROUTES.admin.products} className="btn btn-secondary">
            <LuArrowLeft className="size-4" /> All products
          </Link>
        }
      />
      <ProductForm categories={categories} />
    </>
  );
}
