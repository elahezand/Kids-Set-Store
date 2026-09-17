import Image from "next/image";
import Link from "next/link";
import { MdOutlineSms } from "react-icons/md";
import { IoShareSocialOutline } from "react-icons/io5";
import { FaFacebookF, FaLinkedinIn, FaPinterest, FaTelegram, FaTwitter } from "react-icons/fa";

const DEFAULT_AVATAR = "/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg";

const shareLinks = [
    { icon: FaTelegram, label: "Telegram" },
    { icon: FaLinkedinIn, label: "LinkedIn" },
    { icon: FaPinterest, label: "Pinterest" },
    { icon: FaTwitter, label: "Twitter" },
    { icon: FaFacebookF, label: "Facebook" },
];

const Article = ({ _id, author, title, createdAt, cover }) => {
    return (
        <article
            data-aos="zoom-in"
            data-aos-duration="1000"
            className="group relative h-[280px] w-full overflow-hidden rounded-[20px] sm:h-[340px] md:h-[400px]"
        >
            {/* cover (the whole image is clickable) */}
            <Link href={`/articles/${_id}`} className="absolute inset-0 block" aria-label={title}>
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
            {createdAt && (
                <time className="pointer-events-none absolute top-4 right-4 z-10 rounded-[10px] bg-coral-300 px-2.5 py-1.5 text-[13px] text-white shadow-card">
                    {createdAt.slice(0, 10)}
                </time>
            )}

            {/* info */}
            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-b from-transparent via-black/65 to-black/80 p-6 pt-10 text-center">
                <Link href={`/articles/${_id}`} className="mb-2.5 line-clamp-2 block rounded-[10px] bg-coral-300 p-2 text-[13px] text-white">
                    {title}
                </Link>
                <div className="flex items-center justify-center gap-3 text-sm text-white">
                    <span>Author</span>
                    <Image width={20} height={20} src={DEFAULT_AVATAR} alt="" className="size-5 shrink-0 rounded-full object-cover" />
                    <span className="max-w-[120px] truncate">{author}</span>
                    <span className="flex items-center gap-1">
                        <MdOutlineSms className="text-lg" />
                        <span>0</span>
                    </span>

                    {/* share menu opens UPWARD so the card's overflow-hidden doesn't clip it */}
                    <div className="group/share relative">
                        <button type="button" aria-label="Share" className="flex items-center">
                            <IoShareSocialOutline className="text-lg" />
                        </button>
                        <div className="invisible absolute right-0 bottom-full mb-2 flex gap-2 rounded-md bg-text p-2 text-white opacity-0 shadow-float transition-all group-focus-within/share:visible group-focus-within/share:opacity-100 group-hover/share:visible group-hover/share:opacity-100">
                            {shareLinks.map(({ icon: Icon, label }) => (
                                <Link key={label} href="/" aria-label={label} className="transition-colors hover:text-coral-300">
                                    <Icon />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default Article;