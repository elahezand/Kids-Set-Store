import Image from "next/image";
import Link from "next/link";
import { MdOutlineSms } from "react-icons/md";
import { IoShareSocialOutline } from "react-icons/io5";
import { FaFacebookF, FaLinkedinIn, FaPinterest, FaTelegram, FaTwitter } from "react-icons/fa";

const DEFAULT_AVATAR =
  "/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

const shareLinks = [
  {
    icon: FaTelegram,
    label: "Telegram",
    getHref: ({ url, title }) => `https://t.me/share/url?url=${url}&text=${title}`,
  },
  {
    icon: FaLinkedinIn,
    label: "LinkedIn",
    getHref: ({ url }) => `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
  },
  {
    icon: FaPinterest,
    label: "Pinterest",
    getHref: ({ url, title, image }) =>
      `https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${title}`,
  },
  {
    icon: FaTwitter,
    label: "Twitter",
    getHref: ({ url, title }) => `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
  },
  {
    icon: FaFacebookF,
    label: "Facebook",
    getHref: ({ url }) => `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  },
];

// author can be a populated user, an unpopulated id, or an old plain-text name
const getAuthorName = (author) => {
  if (!author) return "Unknown";

  if (typeof author === "object") {
    return author.name || author.username || "Unknown";
  }

  // 24-char hex = ObjectId that wasn't populated
  return /^[a-f\d]{24}$/i.test(author) ? "Unknown" : author;
};

const Article = ({
  id,
  _id,
  slug,
  author,
  title,
  cover,
  publishedAt,
  createdAt,
  commentsCount,
}) => {
  // toJSON returns "id", lean() returns "_id" -> support both
  const articleId = id ?? _id;

  // Slug URL, falls back to id for old articles without a slug
  const href = `/articles/${encodeURIComponent(slug || articleId)}`;

  // Works with both ISO strings (from API/JSON) and Date objects
  const rawDate = publishedAt ?? createdAt;
  const date = rawDate ? new Date(rawDate) : null;
  const isValidDate = date && !Number.isNaN(date.getTime());

  const share = {
    url: encodeURIComponent(`${SITE_URL}${href}`),
    title: encodeURIComponent(title || ""),
    image: encodeURIComponent(cover ? `${SITE_URL}${cover}` : ""),
  };

  return (
    <article
      data-aos="zoom-in"
      data-aos-duration="1000"
      className="group relative h-[280px] w-full overflow-hidden rounded-[20px] sm:h-[340px] md:h-[400px]"
    >
      {/* cover (the whole image is clickable) */}
      <Link href={href} className="absolute inset-0 block" aria-label={title}>
        {cover && (
          <Image
            fill
            src={cover}
            alt={title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
        )}
        {/* hover shade — pointer-events-none so it never blocks the link */}
        <span className="pointer-events-none absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
      </Link>

      {/* date badge — positioned against the card, top right */}
      {isValidDate && (
        <time
          dateTime={date.toISOString()}
          className="pointer-events-none absolute right-4 top-4 z-10 rounded-[10px] bg-coral-300 px-2.5 py-1.5 text-[13px] text-white shadow-card"
        >
          {date.toISOString().slice(0, 10)}
        </time>
      )}

      {/* info */}
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
          <span className="max-w-[120px] truncate">{getAuthorName(author)}</span>

          {typeof commentsCount === "number" && (
            <span className="flex items-center gap-1">
              <MdOutlineSms className="text-lg" />
              <span>{commentsCount}</span>
            </span>
          )}

          {/* share menu opens UPWARD so the card's overflow-hidden doesn't clip it */}
          <div className="group/share relative">
            <button type="button" aria-label="Share" className="flex items-center">
              <IoShareSocialOutline className="text-lg" />
            </button>

            <div className="invisible absolute bottom-full right-0 mb-2 flex gap-2 rounded-md bg-text p-2 text-white opacity-0 shadow-float transition-all group-focus-within/share:visible group-focus-within/share:opacity-100 group-hover/share:visible group-hover/share:opacity-100">
              {shareLinks.map(({ icon: Icon, label, getHref }) => (
                <a
                  key={label}
                  href={getHref(share)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Share on ${label}`}
                  className="transition-colors hover:text-coral-300"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Article;