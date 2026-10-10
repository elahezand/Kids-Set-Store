import Link from "next/link";
import { ROUTES } from "@/utils/constants";

type BreadcrumbRoute = "products" | "articles" | "cart" | "favorites" | "about" | "contact-us" | "rules";

const PARENTS: Record<BreadcrumbRoute, { label: string; href: string }> = {
  products: { label: "Products", href: ROUTES.products },
  articles: { label: "Articles", href: ROUTES.articles },
  cart: { label: "Cart", href: ROUTES.cart },
  favorites: { label: "Favorites", href: ROUTES.favorites },
  about: { label: "About Us", href: ROUTES.about },
  "contact-us": { label: "Contact Us", href: ROUTES.contact },
  rules: { label: "Rules", href: ROUTES.rules },
};

const linkClass = "font-medium text-brand-600 transition-colors hover:text-brand-700";

const Separator = () => (
  <span aria-hidden="true" className="text-gray-400 dark:text-gray-600">
    /
  </span>
);

interface BreadcrumbProps {
  title?: string;
  route?: BreadcrumbRoute;
}

const Breadcrumb = ({ title, route }: BreadcrumbProps) => {
  const parent = route ? PARENTS[route] : null;
  const showParent = parent && parent.label !== title;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-8 border-b-2 border-brand-400 pb-4 text-sm text-gray-600 dark:border-brand-600 dark:text-gray-400 sm:mb-10 sm:text-base"
    >
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href={ROUTES.home} className={linkClass}>
            Home
          </Link>
        </li>

        {showParent && (
          <>
            <li aria-hidden="true">
              <Separator />
            </li>
            <li>
              <Link href={parent.href} className={linkClass}>
                {parent.label}
              </Link>
            </li>
          </>
        )}

        {title && (
          <>
            <li aria-hidden="true">
              <Separator />
            </li>
            <li aria-current="page" className="max-w-[60vw] truncate text-text dark:text-gray-200">
              {title}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
