import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { FaRegHeart, FaPlus } from "react-icons/fa";
import FavoriteModel from "../../../../../model/favorite";
import CartCount from "./cart";
import MobileMenu from "./mobileMenu";
import ThemeToggle from "@/components/modules/ui/themeToggle";
import { getMe } from "@/utils/serverHelper";
import { handleTree } from "@/utils/tree";
import connectToDB from "../../../../../configs/db";
const Navbar = async () => {
    await connectToDB();
    const user = await getMe();
    let favoriteCount = 0;

    if (user) {
        const favorite = await FavoriteModel
            .findOne({ user: user._id })
            .select("products")
            .lean();
        favoriteCount = favorite?.products?.length || 0;
    }
    const tree = JSON.parse(JSON.stringify(await handleTree()));

    return (
        <nav className="fixed inset-x-0 top-[5px] z-[9999] mx-auto h-[70px] rounded-2xl bg-sage-400 shadow-float dark:bg-sage-700 sm:mx-4 lg:mx-6">
            <div className="mx-auto flex h-full w-full max-w-container items-center justify-between gap-4 px-4 sm:px-6">
                <div className="flex items-center gap-6 text-2xl font-bold text-white">
                    <Link href="/">SETKIDS</Link>
                </div>

                {/* desktop links */}
                <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
                    <li className="text-[17px] font-medium text-white transition-all duration-200">
                        <Link href="/">Home</Link>
                    </li>
                    {tree.map((cat, index) => (
                        <li key={index + 1} className="group relative">
                            <Link href={`/products?category=${cat.name}`}
                                className="relative whitespace-nowrap text-[17px] font-medium text-white transition-all duration-200 after:absolute after:right-full after:top-[35%] after:block after:h-[7px] after:w-[7px] after:rotate-[43deg] after:border-b-[3px] after:border-r-[3px] after:border-coral-300 after:transition-all after:duration-200 hover:after:rotate-[230deg]">
                                {cat.name}
                            </Link>
                            <ul className="invisible absolute z-[1000] w-[270px] -translate-y-1 rounded-2xl bg-white dark:bg-ink-800 p-4 opacity-0 shadow-float transition-opacity duration-150 pointer-events-none group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100">
                                {cat.children.map((sub, i) => (
                                    <li key={i + 1}>
                                        <Link href={`/products?category=${sub.name}`}
                                            className="mb-2 block border-b border-coral-300 text-[18px] !text-sage-400">
                                            {sub.name}
                                        </Link>
                                        {sub.children.map((item, j) => (
                                            <ul key={j + 1}>
                                                <li>
                                                    <Link href={`/products?category=${item.name}`}
                                                        className="block py-1 text-[16px] text-gray-600 dark:text-gray-300 transition-colors hover:text-coral-300">
                                                        {item.name}
                                                    </Link>
                                                </li>
                                            </ul>
                                        ))}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                    <li className="text-[17px] font-medium text-white"><Link href="/contact-us">Contact With Us</Link></li>
                    <li className="text-[17px] font-medium text-white"><Link href="/about">About Us</Link></li>
                    <li className="text-[17px] font-medium text-white"><Link href="/rules">Rules</Link></li>

                    {user ? (
                        <li className="group relative inline-block text-[18px] font-semibold text-text dark:text-gray-100">
                            <Link href="/p-user" className="flex items-center whitespace-nowrap text-[18px] text-white">
                                <IoIosArrowDown className="relative right-[3px] font-bold text-coral-300" />
                                {user.username}
                            </Link>
                            <div className="invisible absolute left-[-3px] top-5 z-[1] hidden min-w-[220px] flex-col rounded-2xl bg-white dark:bg-ink-800 p-5 pt-[20px] text-right shadow-float group-hover:!flex">
                                <Link href="/p-user/orders" className="px-2 py-1 text-[16px] text-gray-600 dark:text-gray-300 transition-colors hover:text-coral-300">Orders</Link>
                                <Link href="/p-user/tickets" className="px-2 py-1 text-[16px] text-gray-600 dark:text-gray-300 transition-colors hover:text-coral-300">Tickets</Link>
                                <Link href="/p-user/comments" className="px-2 py-1 text-[16px] text-gray-600 dark:text-gray-300 transition-colors hover:text-coral-300">Comments</Link>
                                <Link href="/p-user/favorites" className="px-2 py-1 text-[16px] text-gray-600 dark:text-gray-300 transition-colors hover:text-coral-300">Favorite</Link>
                                <Link href="/p-user/detail-profile" className="px-2 py-1 text-[16px] text-gray-600 dark:text-gray-300 transition-colors hover:text-coral-300">Account Detail</Link>
                            </div>
                        </li>
                    ) : (
                        <li>
                            <Link href="/login-register" className="btn btn-sm rounded-full border-2 border-coral-300 px-4 py-1.5 text-white transition-colors hover:bg-coral-300">SignUp / LogIn</Link>
                        </li>
                    )}
                </ul>

                {/* desktop icons */}
                <div className="hidden items-center gap-5 text-2xl text-white lg:flex">
                    <ThemeToggle />
                    <CartCount />
                    <Link href="/wishList" className="relative">
                        <FaRegHeart />
                        <span className="absolute -left-[9px] -top-[7px] flex h-4 w-4 items-center justify-center rounded-full bg-coral-300 text-[10px] leading-none text-white">
                            {favoriteCount || "0"}
                        </span>
                    </Link>
                </div>

                {/* منوی موبایل (کامپوننت کلاینت با آکاردئون دسته‌بندی‌ها) */}
                <MobileMenu
                    tree={tree}
                    username={user?.username || null}
                    favoriteCount={favoriteCount}
                />
            </div>
        </nav>
    );
};

export default Navbar;
