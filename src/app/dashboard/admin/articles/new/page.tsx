import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import PageHeader from "@/components/modules/panel/pageHeader";
import ArticleForm from "@/components/template/p-admin/articles/articleForm";
import categoryService from "@/services/server/public/category";
import { flattenCategories } from "@/utils/categoryOptions";
import { ROUTES } from "@/utils/constants";
import type { Metadata } from "next";
import type { CategoryNode } from "@/types";

export const metadata: Metadata = { title: "New article" };

export default async function NewArticlePage() {
  const categories = (await categoryService.getAllCategories()) as CategoryNode[];

  return (
    <>
      <PageHeader
        title="New article"
        actions={
          <Link href={ROUTES.admin.articles} className="btn btn-secondary">
            <LuArrowLeft className="size-4" /> All articles
          </Link>
        }
      />
      <ArticleForm categories={flattenCategories(categories)} />
    </>
  );
}
