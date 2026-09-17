import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";

// Single ticket row (dashboard + tickets list)
export default function TicketCard({ _id, title, createdAt, department, isAnswer, priority }) {
    return (
        <Link
            href={`/p-user/tickets/${_id}`}
            className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
        >
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 group-hover:text-sage-700 dark:text-gray-100 dark:group-hover:text-sage-300">{title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-700 dark:text-gray-500">
                    <span>{department?.title || "General"}</span>
                    <span aria-hidden="true">·</span>
                    <time>{createdAt ? new Date(createdAt).toISOString().slice(0, 10) : ""}</time>
                    {priority >= 3 && <span className="badge badge-danger py-0 text-[10px]">High</span>}
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
                <span className={`badge ${isAnswer ? "badge-success" : "badge-accent"}`}>{isAnswer ? "Answered" : "Waiting"}</span>
                <LuChevronRight className="size-4 text-gray-500 transition-transform group-hover:translate-x-0.5" />
            </div>
        </Link>
    );
}
