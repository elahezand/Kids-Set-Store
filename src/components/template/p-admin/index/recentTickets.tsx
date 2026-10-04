import Link from "next/link";
import { LuArrowRight, LuTicket } from "react-icons/lu";
import EmptyState from "@/components/modules/ui/emptyState";
import TicketRow from "@/components/template/p-admin/tickets/ticketRow";
import { ROUTES } from "@/utils/constants";
import type { AdminTicket } from "@/types";

export default function RecentTickets({ tickets }: { tickets: AdminTicket[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="card-header">
        <h2 className="card-title">Latest tickets</h2>
        <Link href={ROUTES.admin.tickets} className="btn btn-ghost btn-sm">
          All tickets <LuArrowRight className="size-3.5" />
        </Link>
      </div>
      {tickets.length ? (
        <div className="divide-y divide-gray-200 dark:divide-white/5">
          {tickets.map((ticket) => (
            <TicketRow key={String(ticket._id)} ticket={ticket} />
          ))}
        </div>
      ) : (
        <EmptyState title="No tickets yet" description="Support requests from customers appear here." icon={LuTicket} />
      )}
    </section>
  );
}
