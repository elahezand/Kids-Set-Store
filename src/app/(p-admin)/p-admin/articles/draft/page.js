import connectToDB from "../../../../../../configs/db"
import AddNewArticle from "@/components/template/p-admin/articles/addNewArticle"
import ArticleModel from "../../../../../../model/article"
import Layout from "@/layouts/adminPanelLayout"
export default async function page({ searchParams }) {
    await connectToDB()
    const { id } = await searchParams

    const article = await ArticleModel.findOne({ _id: id })
    const safeArticles = JSON.parse(JSON.stringify(article))

    return (
        <Layout>
            <div>
                <AddNewArticle
                  article={safeArticles}
                 />
            </div>
        </Layout>
    )
}
