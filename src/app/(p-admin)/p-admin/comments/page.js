import connectToDB from "../../../../../configs/db";
import CommentModel from "../../../../../model/comment";
import { paginate } from "@/utils/paginate";
import PageHeader from "@/components/modules/panel/pageHeader";
import Pagination from "@/components/modules/ui/loadMore";
import CommentsTable from "@/components/template/p-admin/comments/table";

export default async function CommentsPage({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const paginatedData = await paginate(CommentModel, params, {}, "productID");

    return (
        <>
            <PageHeader title="Comments" description="Review, approve and answer customer comments." />
            <CommentsTable comments={JSON.parse(JSON.stringify(paginatedData.data))} total={paginatedData.totalCount} />
            <Pagination pageCount={paginatedData.pageCount} limit={paginatedData.limit} />
        </>
    );
}
