import Image from "next/image";
import Link from "next/link";
import ArticleShareButton from "@/components/modules/main/articleShareButton";
import type { ArticleSummary } from "@/types";
const DEFAULT_AVATAR =
    "/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

const getAuthorName = (author: ArticleSummary["author"]): string => {
    if (!author) return "Unknown";

    if (typeof author === "object") {
        return author.name || author.username || "Unknown";
    }

    return /^[a-f\d]{24}$/i.test(author) ? "Unknown" : author;
};

const Article = ({
    _id,
    slug,
    author,
    title,
    cover,
    createdAt,
}: ArticleSummary) => {
    const href = `/articles/${encodeURIComponent(slug || _id)}`;

    const date = createdAt ? new Date(createdAt) : null;
    const isValidDate =
        date && !Number.isNaN(date.getTime());

    const share = {
        url: encodeURIComponent(`${SITE_URL}${href}`),
        title: encodeURIComponent(title || ""),
        image: encodeURIComponent(
            cover ? `${SITE_URL}${cover}` : ""
        ),
    };

    

    return (
        <article
            data-aos="zoom-in"
            data-aos-duration="1000"
            className="group relative h-[280px] w-full overflow-hidden rounded-[20px] sm:h-[340px] md:h-[400px]"
        >
            <Link
                href={href}
                className="absolute inset-0 block"
                aria-label={title}
            >
                {cover && (
                    <Image
                        fill
                        src={cover}
                        alt={title}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                    />
                )}

                <span className="pointer-events-none absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            </Link>

            {isValidDate && (
                <time
                    dateTime={date.toISOString()}
                    className="pointer-events-none absolute right-4 top-4 z-10 rounded-[10px] bg-coral-300 px-2.5 py-1.5 text-[13px] text-white shadow-card"
                >
                    {date.toISOString().slice(0, 10)}
                </time>
            )}

            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-b from-transparent via-black/65 to-black/80 p-6 pt-10 text-center">
                <Link
                    href={href}
                    className="mb-2.5 line-clamp-2 block rounded-[10px] bg-coral-300 p-2 text-[13px] text-white"
                >
                    {title}
                </Link>

                <div className="flex items-center justify-center gap-3 text-sm text-white">
                    <span>Author</span>

                    <Image
                        width={20}
                        height={20}
                        src={DEFAULT_AVATAR}
                        alt=""
                        className="size-5 shrink-0 rounded-full object-cover"
                    />

                    <span className="max-w-[120px] truncate">
                        {getAuthorName(author)}
                    </span>

                    <ArticleShareButton share={share} />
                </div>
            </div>
        </article>
    );
};

export default Article;
