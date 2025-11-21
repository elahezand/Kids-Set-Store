import AddNewArticle from '@/components/template/p-admin/articles/addNewArticle'
import ArticleModel from '../../../../model/article';
import Table from '@/components/template/p-admin/articles/dataTable';
import Pagination from '@/components/modules/pageination/pagination';
import Layout from '@/layouts/adminPanelLayout';
import { pageinatedData } from '@/utils/helper';

export default async function page({ searchParams }) {
    const param = await searchParams
    const { page } = param

    const articles = await ArticleModel.find({}).lean();
    const [filteredArray, pageCount] = pageinatedData(articles, page, 5)

    return (
        <Layout>
            <div>
                <AddNewArticle />
                <Table
                    title={"Article List"}
                    articles={JSON.parse(JSON.stringify(filteredArray))} />
                <Pagination
                    pageCount={pageCount}
                    href="articles?"
                    currentPage={page}
                />
            </div>
        </Layout>
    )
}


