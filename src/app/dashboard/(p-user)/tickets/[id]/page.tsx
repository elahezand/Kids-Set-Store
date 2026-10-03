import Link from "next/link";
import { notFound } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import PageHeader from "@/components/modules/panel/pageHeader";
import TicketReplyForm from "@/components/modules/panel/ticketReplyForm";
import TicketThread from "@/components/modules/panel/ticketThread";
import ticketService from "@/services/server/user/ticket";
import { getPanelSession } from "@/utils/auth/panelUser";
import { ROUTES } from "@/utils/constants";
import { toPlain } from "@/utils/format";
import type { Metadata } from "next";
import type { PageProps, TicketDetail } from "@/types";

export const metadata: Metadata = { title: "Ticket details" };

export default async function TicketPage({ params }: PageProps<{ id: string }>) {
  const { user } = await getPanelSession();
  if (!user) return null;

  const { id } = await params;
  const result = (await ticketService.getMyTicket(id, user._id)) as { success: boolean; data?: TicketDetail };
  if (!result.success || !result.data) notFound();

  return (
    <>
      <PageHeader
        title="Ticket details"
        actions={
          <Link href={ROUTES.dashboard.tickets} className="btn btn-secondary">
            <LuArrowLeft className="size-4" /> Back to tickets
          </Link>
        }
      />
      <TicketThread ticket={toPlain(result.data)} />
      <TicketReplyForm ticketID={id} />
    </>
  );
}
