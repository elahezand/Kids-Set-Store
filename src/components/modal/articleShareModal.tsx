"use client";

import {
    FaFacebookF,
    FaLinkedinIn,
    FaPinterest,
    FaTelegram,
    FaTwitter,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import type { IconType } from "react-icons";
import type { ArticleShareLinks } from "@/types";

interface ShareTarget {
    icon: IconType;
    label: string;
    getHref: (share: ArticleShareLinks) => string;
}

const shareLinks: ShareTarget[] = [
    {
        icon: FaTelegram,
        label: "Telegram",
        getHref: ({ url, title }) =>
            `https://t.me/share/url?url=${url}&text=${title}`,
    },
    {
        icon: FaLinkedinIn,
        label: "LinkedIn",
        getHref: ({ url }) =>
            `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
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
        getHref: ({ url, title }) =>
            `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    },
    {
        icon: FaFacebookF,
        label: "Facebook",
        getHref: ({ url }) =>
            `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    },
];

interface ArticleShareModalProps {
    share: ArticleShareLinks;
    open: boolean;
    onClose: () => void;
}

const ArticleShareModal = ({ share, open, onClose }: ArticleShareModalProps) => {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-float dark:bg-ink-800"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-4 top-4 text-2xl text-text transition-colors hover:text-coral-300 dark:text-white"
                >
                    <IoClose />
                </button>

                <h2 className="mb-6 text-center text-xl font-bold text-text dark:text-white">
                    Share this article
                </h2>

                <div className="flex justify-center gap-4">
                    {shareLinks.map(
                        ({ icon: Icon, label, getHref }) => (
                            <a
                                key={label}
                                href={getHref(share)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Share on ${label}`}
                                onClick={onClose}
                                className="flex size-11 items-center justify-center rounded-full bg-text text-white transition-colors hover:bg-coral-300"
                            >
                                <Icon />
                            </a>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArticleShareModal;