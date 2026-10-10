import Link from "next/link";
import { notFound } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import PageHeader from "@/components/modules/panel/pageHeader";
import TicketReplyForm from "@/components/modules/panel/ticketReplyForm";
import TicketThread from "@/components/modules/panel/ticketThread";
import ticketService from "@/services/server/shared/ticket";
import { ROUTES } from "@/utils/constants";
import { toPlain } from "@/utils/format";
import type { Metadata } from "next";
import type { PageProps, TicketDetail } from "@/types";
import { requireAdmin } from "@/utils/auth/panelUser";

export const metadata: Metadata = { title: "Ticket details" };

export default async function AdminTicketPage({ params }: PageProps<{ id: string }>) {
  await requireAdmin();
  const { id } = await params;

  const result = (await ticketService.getTicketThread(id)) as { success: boolean; data?: TicketDetail };
  if (!result.success || !result.data) notFound();

  return (
    <>
      <PageHeader
        title="Ticket details"
        actions={
          <Link href={ROUTES.admin.tickets} className="btn btn-secondary">
            <LuArrowLeft className="size-4" /> All tickets
          </Link>
        }
      />
      <TicketThread ticket={toPlain(result.data)} />
      <TicketReplyForm ticketID={id} />
    </>
  );
}
