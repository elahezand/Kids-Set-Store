import { LuTicket } from "react-icons/lu";
import connectToDB from "../../../../../configs/db";
import TicketModel from "../../../../../model/ticket";
import "../../../../../model/department";
import { authUser } from "@/utils/serverHelper";
import { paginate } from "@/utils/helper";
import PageHeader from "@/components/modules/panel/pageHeader";
import Pagination from "@/components/modules/ui/pagination";
import EmptyState from "@/components/modules/ui/emptyState";
import TicketCard from "@/components/template/p-user/tickets/ticketCard";
import SendTicket from "@/components/template/p-user/tickets/sendTicket";

export default async function TicketsPage({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const user = await authUser();
    const paginatedData = await paginate(TicketModel, params, { user: user?._id, parent: null }, "department");
    const tickets = JSON.parse(JSON.stringify(paginatedData.data));

    return (
        <>
            <PageHeader title="Support tickets" description="Ask questions and follow up on your requests." />

            <div className="grid items-start gap-6 xl:grid-cols-5">
                <section className="card overflow-hidden xl:col-span-3">
                    <div className="card-header">
                        <h2 className="card-title">My tickets</h2>
                        <span className="badge badge-neutral">{paginatedData.totalCount}</span>
                    </div>
                    {tickets.length ? (
                        <div className="divide-y divide-gray-200 dark:divide-white/5">
                            {tickets.map((ticket) => <TicketCard key={ticket._id} {...ticket} />)}
                        </div>
                    ) : (
                        <EmptyState title="No tickets yet" description="Use the form to open your first ticket." icon={LuTicket} />
                    )}
                    <Pagination pageCount={paginatedData.pageCount} limit={paginatedData.limit} className="my-4" />
                </section>

                <div className="xl:col-span-2">
                    <SendTicket />
                </div>
            </div>
        </>
    );
}
