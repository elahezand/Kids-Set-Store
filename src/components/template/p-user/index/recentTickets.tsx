import Link from "next/link";
import { LuArrowRight, LuTicket } from "react-icons/lu";
import EmptyState from "@/components/modules/ui/emptyState";
import TicketCard from "@/components/template/p-user/tickets/ticketCard";
import { ROUTES } from "@/utils/constants";
import type { TicketSummary } from "@/types";

export default function RecentTickets({ tickets }: { tickets: TicketSummary[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="card-header">
        <h2 className="card-title">Recent tickets</h2>
        <Link href={ROUTES.dashboard.tickets} className="btn btn-ghost btn-sm">
          All tickets <LuArrowRight className="size-3.5" />
        </Link>
      </div>
      {tickets.length ? (
        <div className="divide-y divide-gray-200 dark:divide-white/5">
          {tickets.map((ticket) => (
            <TicketCard key={String(ticket._id)} {...ticket} />
          ))}
        </div>
      ) : (
        <EmptyState title="No tickets yet" description="Need help? Open a ticket anytime." icon={LuTicket} />
      )}
    </section>
  );
}
