import Link from "next/link";
import { FaFacebookF, FaInstagram, FaPinterestP, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { LuMail, LuMapPin, LuPhone } from "react-icons/lu";

const socialLinks = [
    { icon: FaInstagram, label: "Instagram", href: "/" },
    { icon: FaFacebookF, label: "Facebook", href: "/" },
    { icon: FaXTwitter, label: "X", href: "/" },
    { icon: FaPinterestP, label: "Pinterest", href: "/" },
    { icon: FaYoutube, label: "YouTube", href: "/" },
];

const columns = [
    {
        title: "Shop",
        links: [
            { label: "All products", href: "/products" },
            { label: "New arrivals", href: "/products?value=latest&page=1" },
            { label: "Best sellers", href: "/products?value=bestSelling&page=1" },
            { label: "Favorites", href: "/wishList" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About us", href: "/about" },
            { label: "Articles", href: "/articles" },
            { label: "Contact", href: "/contact-us" },
            { label: "Terms & rules", href: "/rules" },
        ],
    },
    {
        title: "Help",
        links: [
            { label: "Shopping cart", href: "/cart" },
            { label: "My orders", href: "/p-user/orders" },
            { label: "Support tickets", href: "/p-user/tickets" },
            { label: "Account", href: "/p-user" },
        ],
    },
];

const contactInfo = [
    { icon: LuMapPin, text: "Teaxs, USA" },
    { icon: LuPhone, text: "+1 (940) 987654345", href: "tel:+194034567" },
    { icon: LuMail, text: "support@set-kids.com", href: "mailto:support@set-kids.com" },
];

const Footer = () => {
    return (
        <footer className="border-t border-gray-200 bg-gray-50 text-text dark:border-white/10 dark:bg-ink-950 dark:text-gray-300">
            <div className="container-x grid gap-12 py-14 md:grid-cols-[1.4fr_2fr] md:gap-16 lg:py-16">
                <div>
                    <Link href="/" className="text-2xl font-bold tracking-tight text-sage-600 dark:text-sage-300">
                        SETKIDS
                    </Link>

                    <p className="mt-4 max-w-[42ch] text-sm leading-7 text-gray-700 dark:text-gray-500">
                        Comfortable, durable clothing for kids from first steps to fourteen — picked by parents,
                        tested by children.
                    </p>

                    <ul className="mt-6 flex flex-col gap-3 text-sm">
                        {contactInfo.map(({ icon: Icon, text, href }) => (
                            <li key={text} className="flex items-center gap-3">
                                <Icon className="size-4 shrink-0 text-sage-600 dark:text-sage-400" />
                                {href ? (
                                    <a href={href} className="transition-colors hover:text-sage-600 dark:hover:text-sage-300">
                                        {text}
                                    </a>
                                ) : (
                                    <span className="text-gray-700 dark:text-gray-500">{text}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ستون‌های لینک */}
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
                                            className="text-gray-700 transition-colors hover:text-sage-600 dark:text-gray-400 dark:hover:text-sage-300"
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

            {/* نوار پایین */}
            <div className="border-t border-gray-200 dark:border-white/10">
                <div className="container-x flex flex-col-reverse items-center justify-between gap-5 py-6 sm:flex-row">
                    <p className="text-xs text-gray-600 dark:text-gray-500">
                        © {new Date().getFullYear()} Set Kids. All rights reserved.
                    </p>

                    <ul className="flex items-center gap-1">
                        {socialLinks.map(({ icon: Icon, label, href }) => (
                            <li key={label}>
                                <Link
                                    href={href}
                                    aria-label={label}
                                    className="flex size-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-white hover:text-sage-600 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-sage-300"
                                >
                                    <Icon className="size-4" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
