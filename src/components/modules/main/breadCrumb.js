import Link from "next/link";

const Breadcrumb = ({ title, route }) => {
    return (
        <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-2 border-b-2 border-sage-400 pb-4 text-sm text-gray-600 dark:border-sage-600 dark:text-gray-400 sm:mb-10 sm:text-base"
        >
            <Link href="/" className="font-medium text-coral-400 transition-colors hover:text-coral-500">Home</Link>
            <span className="text-gray-400 dark:text-gray-600">/</span>
            <Link href={route} className="font-medium text-coral-400 capitalize transition-colors hover:text-coral-500">{route}</Link>
            <span className="text-gray-400 dark:text-gray-600">/</span>
            <p className="truncate text-text dark:text-gray-200">{title}</p>
        </nav>
    );
};

export default Breadcrumb;
