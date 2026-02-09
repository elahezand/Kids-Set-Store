
import connectToDB from "../../../../../../configs/db";
import ArticleModel from "../../../../../../model/article";
import AddNewArticle from "@/components/template/p-admin/articles/addNewArticle";
export default async function page({ params }) {
    await connectToDB()
    const { id } = await params
    const article = await ArticleModel.findOne({ _id: id }).lean()
    const safeArticles = JSON.parse(JSON.stringify(article))

    return (
        <div>
            <AddNewArticle
                article={safeArticles} />
        </div>
    );
}
