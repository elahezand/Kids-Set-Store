"use client";

import { LuTicket } from "react-icons/lu";
import EmptyState from "@/components/modules/ui/emptyState";
import LoadMore from "@/components/modules/main/loadMore";
import TicketCard from "@/components/template/p-user/tickets/ticketCard";
import { useMyTickets } from "@/services/client/panel";
import type { Paginated, TicketSummary } from "@/types";

interface TicketsListProps {
  initialPage: Paginated<TicketSummary>;
  limit: number;
}

export default function TicketsList({ initialPage, limit }: TicketsListProps) {
  const { items: tickets, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyTickets(initialPage, limit);

  return (
    <section className="card overflow-hidden">
      <div className="card-header">
        <h2 className="card-title">My tickets</h2>
      </div>
      {tickets.length ? (
        <>
          <div className="divide-y divide-gray-200 dark:divide-white/5">
            {tickets.map((ticket) => (
              <TicketCard key={String(ticket._id)} {...ticket} />
            ))}
          </div>
          <div className="px-4 pb-6">
            <LoadMore
              hasMore={Boolean(hasNextPage)}
              isLoading={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
              count={tickets.length}
              limit={limit}
              noun="tickets"
            />
          </div>
        </>
      ) : (
        <EmptyState title="No tickets yet" description="Use the form to open your first ticket." icon={LuTicket} />
      )}
    </section>
  );
}
