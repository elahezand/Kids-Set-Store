import { FaFacebookF, FaLinkedinIn, FaPinterest, FaTelegram, FaTwitter } from "react-icons/fa";
import type { IconType } from "react-icons";
import type { ShareTarget } from "@/types";

export interface ShareLink {
  name: string;
  Icon: IconType;
  href: string;
}

export const buildShareLinks = ({ url, title, image = "" }: ShareTarget): ShareLink[] => {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const media = encodeURIComponent(image);

  return [
    { name: "Telegram", Icon: FaTelegram, href: `https://t.me/share/url?url=${u}&text=${t}` },
    { name: "LinkedIn", Icon: FaLinkedinIn, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    {
      name: "Pinterest",
      Icon: FaPinterest,
      href: `https://pinterest.com/pin/create/button/?url=${u}&media=${media}&description=${t}`,
    },
    { name: "Twitter", Icon: FaTwitter, href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: "Facebook", Icon: FaFacebookF, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  ];
};
