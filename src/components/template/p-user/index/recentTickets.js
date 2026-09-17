import Link from "next/link";
import { LuArrowRight, LuTicket } from "react-icons/lu";
import EmptyState from "@/components/modules/ui/emptyState";
import TicketCard from "../tickets/ticketCard";

export default function RecentTickets({ tickets = [] }) {
    return (
        <div className="card overflow-hidden">
            <div className="card-header">
                <h2 className="card-title">Recent tickets</h2>
                <Link href="/p-user/tickets" className="btn btn-ghost btn-sm">
                    All tickets <LuArrowRight className="size-3.5" />
                </Link>
            </div>
            {tickets.length ? (
                <div className="divide-y divide-gray-200 dark:divide-white/5">
                    {tickets.map((ticket) => <TicketCard key={ticket._id} {...ticket} />)}
                </div>
            ) : (
                <EmptyState title="No tickets yet" description="Need help? Open a ticket anytime." icon={LuTicket} />
            )}
        </div>
    );
}
