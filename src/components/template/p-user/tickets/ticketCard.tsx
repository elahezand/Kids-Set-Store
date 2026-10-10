import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";
import { ROUTES } from "@/utils/constants";
import { formatDate } from "@/utils/format";
import { TICKET_PRIORITY, ticketState } from "@/utils/panelView";
import type { TicketSummary } from "@/types";

export default function TicketCard({ _id, title, createdAt, department, isAnswer, priority }: TicketSummary) {
  const state = ticketState(isAnswer);
  const level = TICKET_PRIORITY[priority];

  return (
    <Link
      href={ROUTES.dashboard.ticket(String(_id))}
      className="group flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-gray-50 sm:gap-4 sm:px-5 dark:hover:bg-white/[0.02]"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900 group-hover:text-brand-700 dark:text-gray-100 dark:group-hover:text-brand-300">
          {title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-700 dark:text-gray-500">
          <span>{department?.title || "General"}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={createdAt}>{formatDate(createdAt)}</time>
          {priority >= 2 && level && <span className={`badge ${level.badge} py-0 text-[10px]`}>{level.label}</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className={`badge ${state.badge}`}>{state.label}</span>
        <LuChevronRight className="size-4 text-gray-500 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
