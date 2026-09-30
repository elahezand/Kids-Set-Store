import connectToDB from "@/configs/db";
import CommentModel from "@/model/comment";
import { authUser } from "@/utils/auth/authGuard";
import { paginatePage } from "@/utils/paginate";
import PageHeader from "@/components/modules/panel/pageHeader";
import Pagination from "@/components/modules/ui/pagination";
import CommentsTable from "@/components/template/p-user/comments/commentsTable";

export default async function CommentsPage({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const user = await authUser();
    const paginatedData = await paginatePage(CommentModel, params, { user: user?._id }, "product");

    return (
        <>
            <PageHeader title="Comments" description="Reviews you've written on products." />
            <CommentsTable comments={JSON.parse(JSON.stringify(paginatedData.data))} />
            <Pagination pageCount={paginatedData.pageCount} limit={paginatedData.limit} />
        </>
    );
}
