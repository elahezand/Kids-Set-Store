import type { Metadata } from "next";
import PageHeader from "@/components/modules/panel/pageHeader";
import TicketsList from "@/components/template/p-user/tickets/ticketsList";
import SendTicket from "@/components/template/p-user/tickets/sendTicket";
import ticketService from "@/services/server/user/ticket";
import { getPanelSession } from "@/utils/auth/panelUser";
import { TicketSummary } from "@/types/ticket";
import { Pagination } from "@/types";
import { toInitialPage } from "@/utils/initialPage";

export const metadata: Metadata = { title: "Support tickets" };

const LIMIT = 10;

export default async function TicketsPage() {
  const { user } = await getPanelSession();
  if (!user) return null;

  const result = (await ticketService.getMyTickets(user._id, { limit: LIMIT })) as {
    data: TicketSummary[];
    pagination: Pagination;
  };

  return (
    <>
      <PageHeader title="Support tickets" description="Ask questions and follow up on your requests." />

      {/* phones/tablets: form first, then the list; desktop: side by side */}
      <div className="grid items-start gap-6 xl:grid-cols-5">
        <div className="xl:order-2 xl:col-span-2">
          <SendTicket />
        </div>
        <div className="min-w-0 xl:order-1 xl:col-span-3">
          <TicketsList initialPage={toInitialPage(result, LIMIT)} limit={LIMIT} />
        </div>
      </div>
    </>
  );
}
