import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";

interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

export default function SectionHeader({
  title,
  eyebrow,
  description,
  href,
  linkLabel = "View all",
}: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6 sm:mb-8">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-coral-600 uppercase dark:text-coral-300">
            <span aria-hidden="true" className="h-px w-6 bg-current" />
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl leading-tight font-bold tracking-tight text-text-dark sm:text-3xl dark:text-white">
          {title}
          <span data-star-anchor aria-hidden="true" className="ml-2 inline-block size-9 align-middle sm:size-10" />
        </h2>
        {description && (
          <p className="mt-2 max-w-[52ch] text-sm text-gray-600 sm:text-base dark:text-gray-400">{description}</p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1.5 pb-1 text-sm font-semibold text-sage-700 transition-colors hover:text-sage-900 dark:text-sage-300 dark:hover:text-white"
        >
          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1.5px]">
            {linkLabel}
          </span>
          <LuArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}
