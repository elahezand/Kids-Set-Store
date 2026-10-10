import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { LuArrowLeft, LuExternalLink } from "react-icons/lu";
import PageHeader from "@/components/modules/panel/pageHeader";
import ProductForm from "@/components/template/p-admin/products/productForm";
import categoryService from "@/services/server/public/category";
import productService from "@/services/server/admin/product";
import { ROUTES } from "@/utils/constants";
import { toPlain } from "@/utils/format";
import type { Metadata } from "next";
import type { AdminProduct, CategoryNode, PageProps } from "@/types";
import { requireAdmin } from "@/utils/auth/panelUser";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<{ id: string }>) {
  await requireAdmin();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  const [result, categories] = await Promise.all([
    productService.getProductPreview(id) as Promise<{ success: boolean; data?: { productData: AdminProduct } }>,
    categoryService.getAllCategories() as Promise<CategoryNode[]>,
  ]);
  const product = result.success && result.data ? toPlain(result.data.productData) : null;
  if (!product || product.status === "deleted") notFound();

  return (
    <>
      <PageHeader
        title="Edit product"
        description={product.title}
        actions={
          <>
            {product.status === "active" && (
              <Link href={ROUTES.product(String(product._id))} target="_blank" className="btn btn-ghost">
                <LuExternalLink className="size-4" /> View in store
              </Link>
            )}
            <Link href={ROUTES.admin.products} className="btn btn-secondary">
              <LuArrowLeft className="size-4" /> All products
            </Link>
          </>
        }
      />
      <ProductForm key={String(product._id)} product={product} categories={categories} />
    </>
  );
}
