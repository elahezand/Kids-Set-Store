import connectToDB from "../../../../../configs/db";
import OrderModel from "../../../../../model/order";
import { authUser } from "@/utils/serverHelper";
import { paginate } from "@/utils/helper";
import PageHeader from "@/components/modules/panel/pageHeader";
import Pagination from "@/components/modules/ui/pagination";
import OrdersTable from "@/components/template/p-user/orders/ordersTable";

export default async function OrdersPage({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const user = await authUser();
    const paginatedData = await paginate(OrderModel, params, { user: user?._id });

    return (
        <>
            <PageHeader title="Orders" description="Track your purchases and their status." />
            <OrdersTable orders={JSON.parse(JSON.stringify(paginatedData.data))} />
            <Pagination pageCount={paginatedData.pageCount} limit={paginatedData.limit} />
        </>
    );
}
