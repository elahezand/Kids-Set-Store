import { cache } from "react";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import Image from "next/image";
import Link from "next/link";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import Breadcrumb from "@/components/modules/main/breadCrumb";
import connectToDB from "@/configs/db";
import ArticleModel from "@/model/article";

// Created once per server instance instead of on every request
const DOMPurify = createDOMPurify(new JSDOM("").window);

const RELATED_LIMIT = 4;

// Only public user fields (never password, phone, ...)
const AUTHOR_FIELDS = "name username";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Works whether the folder is named [slug] or [id]
const getParam = async (params) => {
  const { slug, id } = (await params) || {};
  return slug ?? id;
};

const getArticleFilter = (idOrSlug) => {
  if (isValidObjectId(idOrSlug)) return { _id: idOrSlug };

  try {
    return { slug: decodeURIComponent(idOrSlug).toLowerCase() };
  } catch {
    return { slug: String(idOrSlug).toLowerCase() };
  }
};

// cache() -> generateMetadata and the page share one DB query per request
const getArticle = cache(async (idOrSlug) => {
  if (!idOrSlug) return null;

  await connectToDB();

  return ArticleModel.findOne({
    ...getArticleFilter(idOrSlug),
    status: "publish",
  })
    .populate("author", AUTHOR_FIELDS)
    .lean();
});

const getOtherArticles = async (excludeId) => {
  await connectToDB();

  return ArticleModel.find({ _id: { $ne: excludeId }, status: "publish" })
    .sort({ publishedAt: -1, _id: -1 })
    .limit(RELATED_LIMIT)
    .select("title slug")
    .lean();
};

const articleHref = (item) => `/articles/${item.slug || item._id}`;

const getAuthorName = (author) =>
  (typeof author === "object" && (author?.name || author?.username)) || "Unknown";

export async function generateMetadata({ params }) {
  const article = await getArticle(await getParam(params));

  if (!article) {
    return { title: "Article not found" };
  }

  const images = article.cover ? [article.cover] : [];

  return {
    title: article.title,
    description: article.shortDescription,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.shortDescription,
      publishedTime: (article.publishedAt ?? article.createdAt)?.toISOString(),
      authors: [getAuthorName(article.author)],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.shortDescription,
      images,
    },
  };
}

export default async function Page({ params }) {
  const article = await getArticle(await getParam(params));

  if (!article) notFound();

  const otherArticles = await getOtherArticles(article._id);
  const publishedDate = article.publishedAt ?? article.createdAt;

  return (
    <div className="page-container">
      <Breadcrumb title={article.title} route="articles" />

      <div className="flex flex-col gap-8 text-text dark:text-gray-100 lg:flex-row lg:gap-10">
        <div className="w-full lg:w-[60%]">
          <article className="card card-body [&_h3]:mb-4 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:uppercase [&_h3]:text-sage-400 [&_p]:mb-4 [&_p]:text-base [&_p]:leading-7 [&_ul]:mb-5 [&_ul_li]:mb-2.5 [&_ul_li]:list-none [&_ul_li]:text-lg sm:p-8">
            <h1 className="mb-2.5 text-lg font-bold text-coral-300">
              {article.title}
            </h1>

            <h3>{article.shortDescription}</h3>

            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(article.content),
              }}
            />

            <div className="mt-6 flex flex-wrap items-center gap-3 text-base">
              <span>Posted by:</span>

              <div className="flex items-center gap-2">
                <Image
                  src="/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg"
                  alt=""
                  height={40}
                  width={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <strong className="text-coral-300">
                  {getAuthorName(article.author)}
                </strong>
              </div>

              {publishedDate && (
                <span>
                  Published:{" "}
                  <time dateTime={publishedDate.toISOString()}>
                    {dateFormatter.format(publishedDate)}
                  </time>
                </span>
              )}
            </div>
          </article>
        </div>

        <aside className="w-full rounded-2xl bg-coral-300 p-6 shadow-card sm:p-8 lg:w-[35%]">
          <h2 className="mb-4 text-xl font-bold text-white">{article.title}</h2>

          {article.cover && (
            <div className="overflow-hidden rounded-xl">
              <Image
                src={article.cover}
                alt={article.title}
                width={400}
                height={250}
                priority
                className="h-[200px] w-full object-cover sm:h-[250px]"
              />
            </div>
          )}

          {otherArticles.length > 0 && (
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-float dark:bg-ink-800 sm:p-8">
              <span className="relative pl-2 text-lg text-sage-400 before:absolute before:-left-4 before:-top-[5px] before:h-[39px] before:w-[22px] before:skew-x-[10deg] before:rounded-bl-[12px] before:rounded-tl-[8px] before:bg-sage-400">
                New articles
              </span>

              <ul className="mt-8">
                {otherArticles.map((item) => (
                  <li key={String(item._id)} className="border-b border-text py-4">
                    <Link
                      href={articleHref(item)}
                      className="text-base text-text transition-all duration-500 hover:text-sage-400 dark:text-gray-100"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}