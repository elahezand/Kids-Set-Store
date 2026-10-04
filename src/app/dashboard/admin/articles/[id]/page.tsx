import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { LuArrowLeft, LuExternalLink } from "react-icons/lu";
import PageHeader from "@/components/modules/panel/pageHeader";
import ArticleForm from "@/components/template/p-admin/articles/articleForm";
import articleService from "@/services/server/admin/article";
import categoryService from "@/services/server/public/category";
import { flattenCategories } from "@/utils/categoryOptions";
import { ROUTES } from "@/utils/constants";
import { toPlain } from "@/utils/format";
import type { Metadata } from "next";
import type { AdminArticleDetail, CategoryNode, PageProps } from "@/types";

export const metadata: Metadata = { title: "Edit article" };

export default async function EditArticlePage({ params }: PageProps<{ id: string }>) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  const [result, categories] = await Promise.all([
    articleService.getArticleByIdAdmin(id) as Promise<{ success: boolean; data?: AdminArticleDetail }>,
    categoryService.getAllCategories() as Promise<CategoryNode[]>,
  ]);
  if (!result.success || !result.data) notFound();

  const article = toPlain(result.data);

  return (
    <>
      <PageHeader
        title="Edit article"
        description={article.title}
        actions={
          <>
            {article.isPublished && (
              <Link
                href={ROUTES.article(article.slug || String(article._id))}
                target="_blank"
                className="btn btn-ghost"
              >
                <LuExternalLink className="size-4" /> View
              </Link>
            )}
            <Link href={ROUTES.admin.articles} className="btn btn-secondary">
              <LuArrowLeft className="size-4" /> All articles
            </Link>
          </>
        }
      />
      <ArticleForm key={String(article._id)} article={article} categories={flattenCategories(categories)} />
    </>
  );
}
