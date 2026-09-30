import connectToDB from "@/configs/db";
import CommentModel from "@/model/comment";
import { paginatePage } from "@/utils/paginate";
import PageHeader from "@/components/modules/panel/pageHeader";
import Pagination from "@/components/modules/ui/pagination";
import CommentsTable from "@/components/template/p-admin/comments/table";

export default async function CommentsPage({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const paginatedData = await paginatePage(CommentModel, params, {}, ["product", "user"]);

    return (
        <>
            <PageHeader title="Comments" description="Review, approve and answer customer comments." />
            <CommentsTable comments={JSON.parse(JSON.stringify(paginatedData.data))} total={paginatedData.totalCount} />
            <Pagination pageCount={paginatedData.pageCount} limit={paginatedData.limit} />
        </>
    );
}
