import { formatDate } from "@/utils/format";
import { TICKET_PRIORITY, ticketState } from "@/utils/panelView";
import { isAdmin, roleLabel } from "@/utils/role";
import type { TicketDetail } from "@/types";

interface TicketThreadProps {
  ticket: TicketDetail | null;
}

const initials = (name?: string) => (name || "?").trim().slice(0, 1).toUpperCase();

export default function TicketThread({ ticket }: TicketThreadProps) {
  if (!ticket) return null;

  const messages = [ticket, ...(ticket.children ?? [])];
  const priority = TICKET_PRIORITY[ticket.priority];
  const state = ticketState(ticket.isAnswer);

  return (
    <section className="card overflow-hidden">
      <div className="card-header">
        <div className="min-w-0 flex-1">
          <h2 className="card-title break-words">{ticket.title}</h2>
          <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">
            {ticket.department?.title || "General"}
            {ticket.subDepartment?.title ? ` / ${ticket.subDepartment.title}` : ""} · Opened{" "}
            {formatDate(ticket.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {priority && <span className={`badge ${priority.badge}`}>{priority.label} priority</span>}
          <span className={`badge ${state.badge}`}>{state.label}</span>
        </div>
      </div>

      <ol className="space-y-5 bg-gray-50/60 p-4 sm:p-5 dark:bg-transparent">
        {messages.map((item) => {
          const fromSupport = isAdmin(item.user);
          const name = fromSupport ? "Support" : item.user?.username || item.user?.email || "You";
          return (
            <li
              key={String(item._id)}
              className={`flex items-end gap-2 sm:gap-3 ${fromSupport ? "flex-row-reverse" : ""}`}
            >
              <span
                aria-hidden="true"
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:size-9 ${
                  fromSupport
                    ? "bg-brand-600 text-white"
                    : "bg-coral-100 text-coral-600 dark:bg-coral-500/15 dark:text-coral-300"
                }`}
              >
                {initials(name)}
              </span>
              <div
                className={`flex max-w-[85%] min-w-0 flex-col gap-1 sm:max-w-[70%] ${fromSupport ? "items-end text-right" : ""}`}
              >
                <div
                  className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-700 dark:text-gray-500 ${fromSupport ? "flex-row-reverse" : ""}`}
                >
                  <span className="font-medium text-gray-900 dark:text-gray-200">{name}</span>
                  <span className={`badge ${fromSupport ? "badge-success" : "badge-neutral"} py-0 text-[10px]`}>
                    {roleLabel(item.user?.role)}
                  </span>
                  <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                </div>
                <p
                  className={`rounded-2xl px-4 py-3 text-left text-sm leading-6 break-words whitespace-pre-line shadow-card ${
                    fromSupport
                      ? "rounded-br-sm bg-brand-600 text-white"
                      : "rounded-bl-sm border border-gray-200 bg-white text-gray-800 dark:border-white/10 dark:bg-ink-900 dark:text-gray-200"
                  }`}
                >
                  {item.content}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
