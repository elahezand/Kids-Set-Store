"use client";

import { useState } from "react";
import { IoShareSocialOutline } from "react-icons/io5";
import ArticleShareModal from "@/components/modules/main/article/articleShareModal";
import type { ShareTarget } from "@/types";

export default function ArticleShareButton({ share }: { share: ShareTarget }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" aria-label="Share" onClick={() => setOpen(true)} className="flex items-center">
        <IoShareSocialOutline className="text-lg" />
      </button>
      {open && <ArticleShareModal share={share} onClose={() => setOpen(false)} />}
    </>
  );
}
