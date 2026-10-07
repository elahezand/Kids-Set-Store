"use client";

import { LuTicket } from "react-icons/lu";
import DateRangeFilter from "@/components/modules/panel/dateRangeFilter";
import ListCard from "@/components/modules/panel/listCard";
import SearchBox from "@/components/modules/panel/searchBox";
import StatusTabs from "@/components/modules/panel/statusTabs";
import EmptyState from "@/components/modules/ui/emptyState";
import TicketRow from "@/components/template/p-admin/tickets/ticketRow";
import { useAdminTickets } from "@/services/client/admin";
import { TICKET_TABS } from "@/utils/panelView";
import { filteredEmptyText } from "@/utils/adminFilters";
import type { AdminFilters, AdminListParams } from "@/utils/adminFilters";
import type { AdminTicket, Paginated, TicketStatusFilter } from "@/types";

const EMPTY_TEXT: Record<TicketStatusFilter, string> = {
  all: "Customer tickets will show up here.",
  waiting: "Every ticket has been answered. Nice work!",
  answered: "No answered tickets yet.",
};

interface TicketsTableProps {
  initialPage: Paginated<AdminTicket>;
  params: AdminListParams;
  filters: AdminFilters<TicketStatusFilter>;
  limit: number;
}

export default function TicketsTable({ initialPage, params, filters, limit }: TicketsTableProps) {
  const { items: tickets, ...pager } = useAdminTickets(initialPage, params);

  return (
    <ListCard
      title="Tickets"
      toolbar={
        <>
          <StatusTabs tabs={TICKET_TABS} value={filters.status} />
          <DateRangeFilter value={filters} label="Opened" />
          <SearchBox placeholder="Search subjects…" />
        </>
      }
      isEmpty={tickets.length === 0}
      empty={
        <EmptyState
          title="No tickets here"
          description={filteredEmptyText(filters) ?? EMPTY_TEXT[filters.status]}
          icon={LuTicket}
        />
      }
      pager={{ ...pager, count: tickets.length, limit, noun: "tickets" }}
    >
      <div className="divide-y divide-gray-200 dark:divide-white/5">
        {tickets.map((ticket) => (
          <TicketRow key={String(ticket._id)} ticket={ticket} />
        ))}
      </div>
    </ListCard>
  );
}
