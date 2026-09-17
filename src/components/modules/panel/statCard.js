import { LuTrendingUp } from "react-icons/lu";

const tones = {
    sage: "bg-sage-50 text-sage-600 dark:bg-sage-500/10 dark:text-sage-300",
    coral: "bg-coral-50 text-coral-500 dark:bg-coral-500/10 dark:text-coral-300",
    peach: "bg-peach-50 text-peach-600 dark:bg-peach-500/10 dark:text-peach-300",
    mint: "bg-mint-50 text-mint-600 dark:bg-mint-500/10 dark:text-mint-300",
};

export default function StatCard({ title, value, icon: Icon = LuTrendingUp, tone = "sage", hint }) {
    return (
        <div className="card flex items-center gap-4 p-5">
            <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${tones[tone] || tones.sage}`}>
                <Icon className="size-6" />
            </span>
            <div className="min-w-0">
                <p className="truncate text-sm text-gray-700 dark:text-gray-500">{title}</p>
                <p className="mt-0.5 text-2xl font-semibold tracking-tight text-gray-900 tabular-nums dark:text-gray-100">
                    {typeof value === "number" ? value.toLocaleString() : value}
                </p>
                {hint && <p className="mt-0.5 text-xs text-gray-600">{hint}</p>}
            </div>
        </div>
    );
}
