import connectToDB from "../../../../../configs/db";
import TicketModel from "../../../../../model/ticket";
import "../../../../../model/department";
import { paginate } from "@/utils/helper";
import PageHeader from "@/components/modules/panel/pageHeader";
import Pagination from "@/components/modules/ui/pagination";
import TicketsTable from "@/components/template/p-admin/tickets/table";

export default async function TicketsPage({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const paginatedData = await paginate(TicketModel, params, { parent: null }, ["department", { path: "user", select: "username email phone" }]);

    return (
        <>
            <PageHeader title="Tickets" description="Customer support requests." />
            <TicketsTable tickets={JSON.parse(JSON.stringify(paginatedData.data))} total={paginatedData.totalCount} />
            <Pagination pageCount={paginatedData.pageCount} limit={paginatedData.limit} />
        </>
    );
}
