import { SITE_NAME } from "@/utils/constants";

interface SiteLogoProps {
  src?: string | null;
  className?: string;
  textClassName?: string;
}

const isUsable = (src?: string | null): src is string => Boolean(src && /^(\/|https?:\/\/)/.test(src.trim()));

export default function SiteLogo({ src, className = "h-10 w-auto", textClassName = "" }: SiteLogoProps) {
  if (!isUsable(src)) return <span className={textClassName}>{SITE_NAME}</span>;
  return <img src={src.trim()} alt={SITE_NAME} className={`object-contain ${className}`} decoding="async" />;
}
