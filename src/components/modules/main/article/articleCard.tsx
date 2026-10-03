import Image from "next/image";
import Link from "next/link";
import ArticleShareButton from "@/components/modules/main/article/articleShareButton";
import { articleHref, getAuthorName } from "@/utils/articleView";
import { DEFAULT_AVATAR, toAbsoluteUrl } from "@/utils/constants";
import { formatDate } from "@/utils/format";
import type { ArticleSummary } from "@/types";

export default function ArticleCard({ _id, slug, author, title, cover, excerpt, createdAt }: ArticleSummary) {
  const href = articleHref({ _id, slug });
  const date = formatDate(createdAt);
  const share = {
    url: toAbsoluteUrl(href),
    title: title || "",
    image: cover ? toAbsoluteUrl(cover) : "",
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-100 transition-shadow hover:shadow-float dark:bg-ink-800 dark:ring-white/10">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[4/3] overflow-hidden bg-sage-50 dark:bg-ink-900"
      >
        {cover && (
          <Image
            fill
            src={cover}
            alt=""
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {date && (
          <time
            dateTime={String(createdAt)}
            className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-text-dark shadow-card dark:bg-ink-900/90 dark:text-gray-100"
          >
            {date}
          </time>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="min-h-[3.1rem] font-shabnam-bold text-lg leading-snug text-text-dark dark:text-gray-100">
          <Link
            href={href}
            className="line-clamp-2 transition-colors group-hover:text-sage-600 dark:group-hover:text-sage-300"
          >
            {title}
          </Link>
        </h3>

        {excerpt && (
          <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-gray-600 dark:text-gray-400">{excerpt}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
          <span className="flex min-w-0 items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Image
              width={28}
              height={28}
              src={DEFAULT_AVATAR}
              alt=""
              className="size-7 shrink-0 rounded-full object-cover"
            />
            <span className="truncate">{getAuthorName(author)}</span>
          </span>

          <span className="shrink-0 text-gray-500 transition-colors hover:text-sage-600 dark:text-gray-400">
            <ArticleShareButton share={share} />
          </span>
        </div>
      </div>
    </article>
  );
}
