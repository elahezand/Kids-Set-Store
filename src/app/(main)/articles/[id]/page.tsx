import { cache } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import Breadcrumb from "@/components/modules/main/breadcrumb";
import connectToDB from "@/configs/db";
import articleService from "@/services/server/public/article";
import { articleHref, getAuthorName } from "@/utils/articleView";
import { DEFAULT_AVATAR, ROUTES, SITE_URL } from "@/utils/constants";
import type { Metadata } from "next";
import type { ArticleDetail, ArticleSummary, PageProps, ServiceResult } from "@/types";

type ArticlePageProps = PageProps<{ id: string }>;

const DOMPurify = createDOMPurify(new JSDOM("").window);

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const CONTENT_CLASSES = [
  "text-base leading-7",
  "[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold",
  "[&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-brand-400",
  "[&_p]:mb-4",
  "[&_a]:text-brand-600 [&_a]:underline [&_a]:underline-offset-2",
  "[&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_li]:mb-2",
  "[&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl",
  "[&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-300 [&_blockquote]:pl-4 [&_blockquote]:italic",
  "[&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-gray-100 [&_pre]:p-4 dark:[&_pre]:bg-ink-700",
  "[&_table]:my-5 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto",
].join(" ");

const toDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getParam = async (params: ArticlePageProps["params"]) => (await params).id;

const getArticle = cache(async (idOrSlug: string): Promise<ArticleDetail | null> => {
  if (!idOrSlug) return null;
  await connectToDB();

  const result = (await articleService.getPublicArticleById(idOrSlug)) as ServiceResult<ArticleDetail>;
  return result?.success ? (result.data ?? null) : null;
});

const getOtherArticles = async (excludeId: string): Promise<ArticleSummary[]> => {
  try {
    await connectToDB();
    const items = (await articleService.getOtherPublicArticles(excludeId, 4)) as ArticleSummary[];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

const sanitize = (html: string | null | undefined) => DOMPurify.sanitize(String(html || ""));

const getReadingMinutes = (html: string) => {
  const words = html
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / 200));
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticle(await getParam(params));

  if (!article) {
    return { title: "Article not found" };
  }

  const description = article.excerpt || article.title;
  const images = article.cover ? [article.cover] : [];
  const path = articleHref(article);

  return {
    title: article.title,
    description,

    ...(SITE_URL && { alternates: { canonical: `${SITE_URL}${path}` } }),

    openGraph: {
      type: "article",
      title: article.title,
      description,
      publishedTime: toDate(article.createdAt)?.toISOString(),
      modifiedTime: toDate(article.updatedAt)?.toISOString(),
      authors: [getAuthorName(article.author)],
      images,
    },

    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images,
    },
  };
}

export default async function Page({ params }: ArticlePageProps) {
  const article = await getArticle(await getParam(params));

  if (!article) {
    notFound();
  }

  const otherArticles = await getOtherArticles(String(article._id));

  const safeContent = sanitize(article.content);
  const readingMinutes = getReadingMinutes(safeContent);
  const publishedDate = toDate(article.createdAt);
  const authorName = getAuthorName(article.author);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || undefined,
    image: article.cover ? [article.cover] : undefined,
    datePublished: publishedDate?.toISOString(),
    dateModified: toDate(article.updatedAt)?.toISOString(),
    author: { "@type": "Person", name: authorName },
  };

  return (
    <div className="page-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Breadcrumb title={article.title} route="articles" />
      <div className="flex flex-col gap-8 text-text dark:text-gray-100 lg:flex-row lg:items-start lg:gap-10">
        <div className="w-full lg:w-[65%]">
          <article className="card card-body sm:p-8">
            <header className="mb-6">
              <h1 className="mb-3 text-2xl font-bold leading-snug text-text-dark dark:text-white sm:text-3xl">{article.title}</h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Image
                    src={DEFAULT_AVATAR}
                    alt=""
                    height={32}
                    width={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />

                  <strong className="font-semibold text-brand-600">{authorName}</strong>
                </div>

                {publishedDate && (
                  <time dateTime={publishedDate.toISOString()}>{dateFormatter.format(publishedDate)}</time>
                )}

                <span>{readingMinutes} min read</span>
              </div>
            </header>

            {article.cover && (
              <div className="mb-6 overflow-hidden rounded-xl">
                <Image
                  src={article.cover}
                  alt={article.title}
                  width={800}
                  height={450}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  priority
                  className="h-auto w-full rounded-xl object-cover"
                />
              </div>
            )}

            {article.excerpt && (
              <p className="mb-6 border-l-4 border-brand-400 pl-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
                {article.excerpt}
              </p>
            )}

            <div className={CONTENT_CLASSES} dangerouslySetInnerHTML={{ __html: safeContent }} />

            <footer className="mt-8 border-t border-gray-200 pt-4 dark:border-white/10">
              <Link
                href={ROUTES.articles}
                className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
              >
                ← Back to all articles
              </Link>
            </footer>
          </article>
        </div>

        {otherArticles.length > 0 && (
          <aside className="w-full rounded-2xl bg-brand-50 p-6 dark:bg-brand-500/10 shadow-card sm:p-8 lg:sticky lg:top-24 lg:w-[35%]">
            <div className="rounded-2xl bg-white p-6 shadow-float dark:bg-ink-800 sm:p-8">
              <h2 className="relative pl-2 text-lg text-brand-600 before:absolute before:-left-4 before:-top-[5px] before:h-[39px] before:w-[22px] before:skew-x-[10deg] before:rounded-bl-[12px] before:rounded-tl-[8px] before:bg-brand-400">
                New articles
              </h2>

              <ul className="mt-8">
                {otherArticles.map((item) => (
                  <li
                    key={String(item._id)}
                    className="border-b border-gray-200 py-4 last:border-b-0 dark:border-white/10"
                  >
                    <Link
                      href={articleHref(item)}
                      className="text-base text-text transition-colors duration-300 hover:text-brand-400 dark:text-gray-100"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
