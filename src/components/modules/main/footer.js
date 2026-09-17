import { FaRegHeart, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaPinterest } from "react-icons/fa";
import Link from "next/link";

const socialLinks = [
    { icon: FaFacebook, label: "Facebook", hoverBg: "hover:bg-sage-400" },
    { icon: FaTwitter, label: "Twitter", hoverBg: "hover:bg-mint-500" },
    { icon: FaInstagram, label: "Instagram", hoverBg: "hover:bg-coral-400" },
    { icon: FaPinterest, label: "Pinterest", hoverBg: "hover:bg-peach-500" },
    { icon: FaYoutube, label: "Youtube", hoverBg: "hover:bg-danger-400" },
];

const menuLinks = [
    { label: "Contact", href: "/contact-us" },
    { label: "About Us", href: "/about" },
    { label: "Rules", href: "/rules" },
];

const quickLinks = [
    { label: "Store", href: "/products" },
    { label: "Articles", href: "/articles" },
    { label: "Shopping Cart", href: "/cart" },
    { label: "Favorites", href: "/wishList" },
];

const Footer = () => {
    return (
        <footer className="bg-sage-400 pt-14 dark:bg-sage-800 sm:pt-16">
            <div className="mx-auto flex w-full max-w-container flex-col-reverse justify-between gap-10 px-4 pb-10 text-white sm:px-6 md:flex-row-reverse lg:px-8">
                <section className="w-full text-[15px] md:w-[300px]">
                    <p className="mb-6 leading-6 text-white/90">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    </p>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                            <FaRegHeart className="text-xl shrink-0" />
                            <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit.</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <FaRegHeart className="shrink-0" />
                            <p>234567876543</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <FaRegHeart className="shrink-0" />
                            <p>support [at] set-kid.com</p>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col gap-8 sm:flex-row sm:gap-16 lg:gap-20">
                    <div>
                        <h4 className="mb-4 text-lg font-semibold">Menu</h4>
                        <ul className="flex flex-col gap-2.5">
                            {menuLinks.map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="text-white/85 transition-colors hover:text-white">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 text-lg font-semibold">Quick Access</h4>
                        <ul className="flex flex-col gap-2.5">
                            {quickLinks.map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="text-white/85 transition-colors hover:text-white">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    {socialLinks.map(({ icon: Icon, label, hoverBg }) => (
                        <Link
                            key={label}
                            href="/"
                            aria-label={label}
                            className={`flex size-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-card transition-colors duration-200 ${hoverBg} hover:text-white`}
                        >
                            <Icon />
                        </Link>
                    ))}
                </div>
            </div>
            <div className="border-t border-white/15">
                <p className="mx-auto max-w-container px-4 py-4 text-center text-sm text-white/70 sm:px-6 lg:px-8">
                    © {new Date().getFullYear()} Set Kids. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
