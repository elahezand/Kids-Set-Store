import connectToDB from "../../../../../configs/db";
import ArticleModel from "../../../../../model/article";
import { paginate } from "@/utils/paginate";
import PageHeader from "@/components/modules/panel/pageHeader";
import Pagination from "@/components/modules/ui/loadMore";
import AddNewArticle from "@/components/template/p-admin/articles/addNewArticle";
import ArticlesTable from "@/components/template/p-admin/articles/dataTable";

export default async function ArticlesPage({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const paginatedData = await paginate(ArticleModel, params);

    return (
        <>
            <PageHeader title="Articles" description="Write and publish blog articles." />
            <AddNewArticle />
            <ArticlesTable data={JSON.parse(JSON.stringify(paginatedData.data))} total={paginatedData.totalCount} />
            <Pagination pageCount={paginatedData.pageCount} limit={paginatedData.limit} />
        </>
    );
}
