"use client";

import ArticleShareModal from "@/components/modal/articleShareModal";
import { useState } from "react";
import { IoShareSocialOutline } from "react-icons/io5";

const ArticleShareButton = ({ share }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                aria-label="Share"
                onClick={() => setOpen(true)}
                className="flex items-center"
            >
                <IoShareSocialOutline className="text-lg" />
            </button>

            <ArticleShareModal
                share={share}
                open={open}
                onClose={() => setOpen(false)}
            />
        </>
    );
};

export default ArticleShareButton;