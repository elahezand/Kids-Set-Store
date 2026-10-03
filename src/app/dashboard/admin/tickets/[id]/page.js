import Link from "next/link";
import { notFound } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import connectToDB from "@/configs/db";
import ticketService from "@/services/server/shared/ticket";
import PageHeader from "@/components/modules/panel/pageHeader";
import TicketThread from "@/components/modules/panel/ticketThread";
import TicketReplyForm from "@/components/modules/panel/ticketReplyForm";

export default async function AdminTicketPage({ params }) {
    await connectToDB();
    const { id } = await params;

    const result = await ticketService.getTicketThread(id);
    if (!result.success) notFound();

    return (
        <>
            <PageHeader
                title="Ticket details"
                actions={
                    <Link href="/p-admin/tickets" className="btn btn-secondary">
                        <LuArrowLeft className="size-4" /> All tickets
                    </Link>
                }
            />
            <TicketThread ticket={JSON.parse(JSON.stringify(result.data))} />
            <TicketReplyForm ticketID={id} />
        </>
    );
}
