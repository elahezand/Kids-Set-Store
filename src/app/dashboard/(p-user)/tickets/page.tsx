import type { Metadata } from "next";
import PageHeader from "@/components/modules/panel/pageHeader";
import TicketsList from "@/components/template/p-user/tickets/ticketsList";
import SendTicket from "@/components/template/p-user/tickets/sendTicket";
import ticketService from "@/services/server/user/ticket";
import { getPanelSession } from "@/utils/auth/panelUser";
import { toInitialPage } from "@/utils/initialPage";
import { pickStatus } from "@/utils/panelStatus";
import { TICKET_TABS, tabValues } from "@/utils/panelView";
import type { PageProps, Pagination } from "@/types";
import { TicketSummary } from "@/types/ticket";

export const metadata: Metadata = { title: "Support tickets" };

const LIMIT = 10;

export default async function TicketsPage({ searchParams }: PageProps) {
  const { user } = await getPanelSession();
  if (!user) return null;

  const status = pickStatus(await searchParams, tabValues(TICKET_TABS));

  const result = (await ticketService.getMyTickets(user._id, { limit: LIMIT, status })) as {
    data: TicketSummary[];
    pagination: Pagination;
  };

  return (
    <>
      <PageHeader title="Support tickets" description="Ask questions and follow up on your requests." />
      <div className="flex w-full flex-col gap-6">
        <div className="w-full">
          <TicketsList key={status} status={status} initialPage={toInitialPage(result, LIMIT)} limit={LIMIT} />
        </div>
        <div className="w-full">
          <SendTicket />
        </div>
      </div>
    </>
  );
}
