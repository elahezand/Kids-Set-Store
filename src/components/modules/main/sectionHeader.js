import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";

/**
 * Shared "title + see more" header used at the top of every storefront
 * section (homepage rows, related products, etc). Keeping this in one
 * place is what keeps every section's heading the same size/spacing.
 */
const SectionHeader = ({ title, href, linkLabel = "See More" }) => {
  return (
    <div className="section-head">
      <h2 className="section-title">{title}</h2>
      {href && (
        <Link href={href} className="section-link">
          {linkLabel}
          <FaChevronRight className="text-xs" />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
