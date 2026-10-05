import PageHeader from "@/components/modules/panel/pageHeader";
import TicketsTable from "@/components/template/p-admin/tickets/ticketsTable";
import ticketService from "@/services/server/admin/ticket";
import { adminListParams, filtersKey, readAdminFilters } from "@/utils/adminFilters";
import { toInitialPage } from "@/utils/initialPage";
import { requireAdmin } from "@/utils/auth/panelUser";
import { tabValues, TICKET_TABS } from "@/utils/panelView";
import type { Metadata } from "next";
import type { AdminTicket, PageProps, Pagination } from "@/types";

export const metadata: Metadata = { title: "Support tickets" };

const LIMIT = 15;

export default async function AdminTicketsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const filters = readAdminFilters(await searchParams, tabValues(TICKET_TABS));
  const params = adminListParams.tickets(LIMIT, filters);

  const result = (await ticketService.getAllTickets(params)) as { data: AdminTicket[]; pagination: Pagination };

  return (
    <>
      <PageHeader title="Support tickets" description="Answer customer questions. Waiting tickets need a reply." />
      <TicketsTable
        key={filtersKey(filters)}
        filters={filters}
        params={params}
        initialPage={toInitialPage(result, LIMIT)}
        limit={LIMIT}
      />
    </>
  );
}
