"use client";

import Modal from "@/components/modules/ui/modal";
import { buildShareLinks } from "@/utils/share";
import type { ShareTarget } from "@/types";

interface ArticleShareModalProps {
  share: ShareTarget;
  onClose: () => void;
}

export default function ArticleShareModal({ share, onClose }: ArticleShareModalProps) {
  return (
    <Modal title="Share this article" size="sm" onClose={onClose}>
      <div className="flex justify-center gap-3">
        {buildShareLinks(share).map(({ name, Icon, href }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${name}`}
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-full bg-text text-white transition-colors hover:bg-coral-300"
          >
            <Icon />
          </a>
        ))}
      </div>
    </Modal>
  );
}
