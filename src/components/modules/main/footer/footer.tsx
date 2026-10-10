import Link from "next/link";
import { FaInstagram, FaLinkedinIn, FaTelegram } from "react-icons/fa6";
import { LuMail, LuMapPin, LuPhone } from "react-icons/lu";
import NewsletterForm from "@/components/modules/main/footer/newsletterForm";
import SiteLogo from "@/components/modules/ui/siteLogo";
import { ROUTES } from "@/utils/constants";
import type { IconType } from "react-icons";
import type { SiteInfo } from "@/types";

interface ContactLine {
  icon: IconType;
  text: string;
  href?: string;
}

const buildSocials = (info: SiteInfo | null) =>
  [
    { icon: FaInstagram, label: "Instagram", href: info?.socials?.instagram },
    { icon: FaTelegram, label: "Telegram", href: info?.socials?.telegram },
    { icon: FaLinkedinIn, label: "LinkedIn", href: info?.socials?.linkedin },
  ].filter((item): item is { icon: IconType; label: string; href: string } => Boolean(item.href));

const buildContact = (info: SiteInfo | null) =>
  [
    info?.address && { icon: LuMapPin, text: info.address },
    info?.phone && { icon: LuPhone, text: info.phone, href: `tel:${info.phone.replace(/[^\d+]/g, "")}` },
    info?.email && { icon: LuMail, text: info.email, href: `mailto:${info.email}` },
  ].filter((line): line is ContactLine => Boolean(line));

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: ROUTES.products },
      { label: "New arrivals", href: `${ROUTES.products}?sort=latest` },
      { label: "Best sellers", href: `${ROUTES.products}?sort=bestSelling` },
      { label: "Favorites", href: ROUTES.favorites },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: ROUTES.about },
      { label: "Articles", href: ROUTES.articles },
      { label: "Contact", href: ROUTES.contact },
      { label: "Terms & rules", href: ROUTES.rules },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shopping cart", href: ROUTES.cart },
      { label: "My orders", href: ROUTES.dashboard.orders },
      { label: "Support tickets", href: ROUTES.dashboard.tickets },
      { label: "Account", href: ROUTES.dashboard.home },
    ],
  },
];

const Footer = ({ info = null }: { info?: SiteInfo | null }) => {
  const contactInfo = buildContact(info);
  const socialLinks = buildSocials(info);

  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-text dark:border-white/10 dark:bg-ink-950 dark:text-gray-300">
      <div className="container-x grid gap-12 py-14 md:grid-cols-[1.4fr_2fr] md:gap-16 lg:py-16">
        <div>
          <Link
            href={ROUTES.home}
            className="inline-flex items-center text-2xl font-bold tracking-tight text-brand-600 dark:text-brand-300"
            aria-label="Home"
          >
            <SiteLogo src={info?.logo} className="h-12 w-auto max-w-[180px]" />
          </Link>

          <p className="mt-4 max-w-[42ch] text-sm leading-7 text-gray-700 dark:text-gray-500">
            Comfortable, durable clothing for kids from first steps to fourteen - picked by parents, tested by children.
          </p>

          <ul className="mt-6 flex flex-col gap-3 text-sm">
            {contactInfo.map(({ icon: Icon, text, href }) => (
              <li key={text} className="flex items-center gap-3">
                <Icon className="size-4 shrink-0 text-brand-600 dark:text-brand-400" />
                {href ? (
                  <a href={href} className="transition-colors hover:text-brand-600 dark:hover:text-brand-300">
                    {text}
                  </a>
                ) : (
                  <span className="text-gray-700 dark:text-gray-500">{text}</span>
                )}
              </li>
            ))}
          </ul>

          <NewsletterForm />
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-500">
                {column.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-700 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-white/10">
        <div className="container-x flex flex-col-reverse items-center justify-between gap-5 py-6 sm:flex-row">
          <p className="text-xs text-gray-600 dark:text-gray-500">
            © {new Date().getFullYear()} Set Kids. All rights reserved.
          </p>

          <ul className="flex items-center gap-1">
            {socialLinks.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-white hover:text-brand-600 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-brand-300"
                >
                  <Icon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
