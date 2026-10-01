import Link from "next/link";

/*
  <Breadcrumb title="Blue hoodie" route="products" />
  -> Home / Products / Blue hoodie

  `route` is one of the keys below (case-insensitive). Without it: Home / title.
*/
type BreadcrumbRoute = "products" | "articles" | "cart" | "favorites" | "about" | "contact-us" | "rules";

const ROUTES: Record<BreadcrumbRoute, { label: string; href: string }> = {
  products: { label: "Products", href: "/products" },
  articles: { label: "Articles", href: "/articles" },
  cart: { label: "Cart", href: "/cart" },
  favorites: { label: "Favorites", href: "/favorites" },
  about: { label: "About Us", href: "/about" },
  "contact-us": { label: "Contact Us", href: "/contact-us" },
  rules: { label: "Rules", href: "/rules" },
};

const linkClass =
  "font-medium text-coral-400 transition-colors hover:text-coral-500";

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
  const parent = route ? ROUTES[route] : null;
  // a page that IS the route (e.g. /products) does not repeat itself
  const showParent = parent && parent.label !== title;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-8 border-b-2 border-sage-400 pb-4 text-sm text-gray-600 dark:border-sage-600 dark:text-gray-400 sm:mb-10 sm:text-base"
    >
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className={linkClass}>
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
            <li
              aria-current="page"
              className="max-w-[60vw] truncate text-text dark:text-gray-200"
            >
              {title}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
