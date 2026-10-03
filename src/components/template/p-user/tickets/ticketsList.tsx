"use client";

import { LuTicket } from "react-icons/lu";
import EmptyState from "@/components/modules/ui/emptyState";
import LoadMore from "@/components/modules/main/loadMore";
import StatusTabs from "@/components/modules/panel/statusTabs";
import TicketCard from "@/components/template/p-user/tickets/ticketCard";
import { useMyTickets } from "@/services/client/panel";
import { TICKET_TABS } from "@/utils/panelView";
import type { Paginated } from "@/types";
import { TicketStatusFilter, TicketSummary } from "@/types/ticket";

const EMPTY_TEXT: Record<TicketStatusFilter, string> = {
  all: "Use the form to open your first ticket.",
  waiting: "No tickets waiting for an answer.",
  answered: "None of your tickets has been answered yet.",
};

interface TicketsListProps {
  initialPage: Paginated<TicketSummary>;
  limit: number;
  status: TicketStatusFilter;
}

export default function TicketsList({ initialPage, limit, status }: TicketsListProps) {
  const { items: tickets, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyTickets(initialPage, limit, status);

  return (
    <section className="card overflow-hidden">
      <div className="card-header">
        <h2 className="card-title">My tickets</h2>
        <StatusTabs tabs={TICKET_TABS} value={status} />
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
        <EmptyState title="No tickets here" description={EMPTY_TEXT[status]} icon={LuTicket} />
      )}
    </section>
  );
}
