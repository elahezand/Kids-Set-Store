import Link from "next/link";
import { LuTrendingUp } from "react-icons/lu";
import type { IconType } from "react-icons";

const tones = {
  sage: "bg-sage-50 text-sage-600 dark:bg-sage-500/10 dark:text-sage-300",
  coral: "bg-coral-50 text-coral-500 dark:bg-coral-500/10 dark:text-coral-300",
  peach: "bg-peach-50 text-peach-600 dark:bg-peach-500/10 dark:text-peach-300",
  mint: "bg-mint-50 text-mint-600 dark:bg-mint-500/10 dark:text-mint-300",
} as const;

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: IconType;
  tone?: keyof typeof tones;
  hint?: string;
  href?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon = LuTrendingUp,
  tone = "sage",
  hint,
  href,
}: StatCardProps) {
  const body = (
    <>
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-12 ${tones[tone] ?? tones.sage}`}
      >
        <Icon className="size-5 sm:size-6" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-gray-700 sm:text-sm dark:text-gray-500">{title}</p>
        <p className="mt-0.5 text-xl font-semibold tracking-tight text-gray-900 tabular-nums sm:text-2xl dark:text-gray-100">
          {typeof value === "number" ? value.toLocaleString("en-US") : value}
        </p>
        {hint && <p className="mt-0.5 text-xs text-gray-600">{hint}</p>}
      </div>
    </>
  );

  const className = "card flex items-center gap-3 p-4 sm:gap-4 sm:p-5";

  return href ? (
    <Link href={href} className={`${className} transition-shadow hover:shadow-float`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
