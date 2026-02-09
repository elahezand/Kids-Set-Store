import AddNewArticle from '@/components/template/p-admin/articles/addNewArticle'
import connectToDB from '../../../../../configs/db';
import ArticleModel from '../../../../../model/article';
import Table from '@/components/template/p-admin/articles/dataTable';
import Pagination from '@/components/modules/pageination/pagination';
import { paginate } from '@/utils/helper';
export default async function page({ searchParams }) {
    await connectToDB()
    const param = await searchParams
    const paginatedData = await paginate(ArticleModel, param)

    return (
            <div>
                <AddNewArticle />
                <Table
                    title={"Article List"}
                    data={JSON.parse(JSON.stringify(paginatedData.data))} />
                <Pagination
                    href={`articles?`}
                    currentPage={paginatedData.page}
                    pageCount={paginatedData.pageCount}
                    limit={paginatedData.limit}
                />
            </div>
    )
}


