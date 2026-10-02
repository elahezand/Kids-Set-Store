import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  /** one short line under the title */
  description?: string;
  href?: string;
  linkLabel?: string;
}

const SectionHeader = ({ title, description, href, linkLabel = "View all" }: SectionHeaderProps) => {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        <h2 className="font-shabnam-bold text-2xl leading-tight tracking-tight text-text-dark dark:text-white sm:text-[2rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-[52ch] text-sm text-gray-700 dark:text-gray-500 sm:text-base">{description}</p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="shrink-0 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-text-dark transition-colors hover:border-sage-600 hover:text-sage-700 dark:border-white/15 dark:text-gray-100 dark:hover:border-sage-400 dark:hover:text-sage-300"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
