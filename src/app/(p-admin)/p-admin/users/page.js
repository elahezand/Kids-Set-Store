import connectToDB from "../../../../../configs/db";
import UserModel from "../../../../../model/user";
import { paginate } from "@/utils/paginate";
import PageHeader from "@/components/modules/panel/pageHeader";
import Pagination from "@/components/modules/ui/loadMore";
import UsersTable from "@/components/template/p-admin/users/table";

export default async function UsersPage({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const paginatedData = await paginate(UserModel, params);

    return (
        <>
            <PageHeader title="Users" description="Manage accounts, roles and access." />
            <UsersTable users={JSON.parse(JSON.stringify(paginatedData.data))} total={paginatedData.totalCount} />
            <Pagination pageCount={paginatedData.pageCount} limit={paginatedData.limit} />
        </>
    );
}
