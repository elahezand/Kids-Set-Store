import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";

const SectionHeader = ({ title, href, linkLabel = "See More" }) => {
  return (
    <div className="flex items-center justify-between mb-8 sm:mb-10 lg:mb-12 px-4 sm:px-0">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-gray-900 dark:text-white flex-1">
        {title}
      </h2>

      {href && (
        <Link 
          href={href} 
          className="group flex items-center gap-2 text-xs sm:text-sm font-light text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all duration-200 whitespace-nowrap ml-4"
          prefetch={true}
        >
          <span className="group-hover:translate-x-0.5 transition-transform duration-200">
            {linkLabel}
          </span>
          <FaChevronRight 
            className="text-xs opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" 
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;