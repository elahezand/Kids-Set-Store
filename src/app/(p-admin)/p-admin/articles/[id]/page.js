import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import connectToDB from "../../../../../../configs/db";
import ArticleModel from "../../../../../../model/article";
import PageHeader from "@/components/modules/panel/pageHeader";
import AddNewArticle from "@/components/template/p-admin/articles/addNewArticle";

export default async function EditArticlePage({ params }) {
    await connectToDB();
    const { id } = await params;
    const article = id ? await ArticleModel.findById(id).lean() : null;
    const safeArticle = article ? JSON.parse(JSON.stringify(article)) : null;

    return (
        <>
            <PageHeader
                title={safeArticle?._id ? "Edit article" : "Add new article"}
                description={safeArticle?.title}
                actions={
                    <Link href="/p-admin/articles" className="btn btn-secondary">
                        <LuArrowLeft className="size-4" /> All articles
                    </Link>
                }
            />
            <AddNewArticle article={safeArticle} />
        </>
    );
}
