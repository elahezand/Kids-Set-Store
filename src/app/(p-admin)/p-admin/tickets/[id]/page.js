import Link from "next/link";
import { notFound } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import connectToDB from "../../../../../../configs/db";
import TicketModel from "../../../../../../model/ticket";
import PageHeader from "@/components/modules/panel/pageHeader";
import TicketThread from "@/components/modules/panel/ticketThread";
import TicketReplyForm from "@/components/modules/panel/ticketReplyForm";

export default async function AdminTicketPage({ params }) {
    await connectToDB();
    const { id } = await params;

    const ticket = await TicketModel.findById(id)
        .populate("user", "username email role")
        .populate("department", "title")
        .lean();
    if (!ticket) notFound();

    ticket.children = await TicketModel.find({ parent: ticket._id })
        .populate("user", "username email role")
        .lean();

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
            <TicketThread ticket={JSON.parse(JSON.stringify(ticket))} />
            <TicketReplyForm ticketID={id} />
        </>
    );
}
