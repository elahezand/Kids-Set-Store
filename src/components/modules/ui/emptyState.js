import { LuInbox } from "react-icons/lu";

export default function EmptyState({ title = "Nothing here yet", description, icon: Icon = LuInbox, action, className = "" }) {
    return (
        <div className={`flex flex-col items-center justify-center gap-3 px-6 py-14 text-center ${className}`}>
            <span className="flex size-14 items-center justify-center rounded-2xl bg-sage-50 text-sage-600 dark:bg-sage-500/10 dark:text-sage-300">
                <Icon className="size-7" />
            </span>
            <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{title}</p>
                {description && <p className="mt-1 text-sm text-gray-700 dark:text-gray-500">{description}</p>}
            </div>
            {action}
        </div>
    );
}
