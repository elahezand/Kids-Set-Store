import connectToDB from "../../../../../configs/db";
import CommentModel from "../../../../../model/comment";
import { authUser } from "@/utils/serverHelper";
import { paginate } from "@/utils/paginate";
import PageHeader from "@/components/modules/panel/pageHeader";
import Pagination from "@/components/modules/ui/loadMore";
import CommentsTable from "@/components/template/p-user/comments/commentsTable";

export default async function CommentsPage({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const user = await authUser();
    const paginatedData = await paginate(CommentModel, params, { user: user?._id }, "productID");

    return (
        <>
            <PageHeader title="Comments" description="Reviews you've written on products." />
            <CommentsTable comments={JSON.parse(JSON.stringify(paginatedData.data))} />
            <Pagination pageCount={paginatedData.pageCount} limit={paginatedData.limit} />
        </>
    );
}
