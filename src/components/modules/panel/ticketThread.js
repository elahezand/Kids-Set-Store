import Image from "next/image";

const DEFAULT_AVATAR = "/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg";

const priorityLabel = { 1: "Low", 2: "Medium", 3: "High" };

// Conversation view of a ticket and its replies (used by both panels)
export default function TicketThread({ ticket }) {
    if (!ticket) return null;
    const messages = [ticket, ...(ticket.children || [])];

    return (
        <section className="card overflow-hidden">
            <div className="card-header">
                <div className="min-w-0">
                    <h2 className="card-title truncate">{ticket.title}</h2>
                    <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">
                        {ticket.department?.title || "General"} · Opened {ticket.createdAt?.slice(0, 10)}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {ticket.priority && (
                        <span className={`badge ${ticket.priority >= 3 ? "badge-danger" : ticket.priority === 2 ? "badge-warning" : "badge-neutral"}`}>
                            {priorityLabel[ticket.priority] || ticket.priority} priority
                        </span>
                    )}
                    <span className={`badge ${ticket.isAnswer ? "badge-success" : "badge-accent"}`}>
                        {ticket.isAnswer ? "Answered" : "Open"}
                    </span>
                </div>
            </div>

            <ol className="space-y-5 bg-gray-50/60 p-5 dark:bg-transparent">
                {messages.map((item, index) => {
                    const isAdmin = item.user?.role === "ADMIN";
                    return (
                        <li key={item._id || index} className={`flex items-end gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}>
                            <Image
                                width={36}
                                height={36}
                                src={DEFAULT_AVATAR}
                                alt=""
                                className="size-9 shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-ink-800"
                            />
                            <div className={`max-w-[85%] sm:max-w-[70%] ${isAdmin ? "items-end text-right" : ""} flex flex-col gap-1`}>
                                <div className={`flex items-center gap-2 text-xs text-gray-700 dark:text-gray-500 ${isAdmin ? "flex-row-reverse" : ""}`}>
                                    <span className="font-medium text-gray-900 dark:text-gray-200">{item.user?.email || item.user?.name || "Unknown"}</span>
                                    <span className={`badge ${isAdmin ? "badge-success" : "badge-neutral"} py-0 text-[10px]`}>{item.user?.role || "USER"}</span>
                                    <time>{item.createdAt?.slice(0, 10)}</time>
                                </div>
                                <p className={`rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-line shadow-card ${isAdmin
                                    ? "rounded-br-sm bg-sage-600 text-left text-white"
                                    : "rounded-bl-sm border border-gray-200 bg-white text-gray-800 dark:border-white/10 dark:bg-ink-900 dark:text-gray-200"}`}>
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
