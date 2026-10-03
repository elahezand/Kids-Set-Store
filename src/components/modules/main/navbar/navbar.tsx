import Link from "next/link";
import connectToDB from "@/configs/db";
import CartCount from "@/components/modules/main/navbar/cart";
import FavoriteCount from "./favoritesCount";
import DesktopMenu from "./DesktopMenu";
import MobileMenu from "@/components/modules/main/navbar/mobileMenu";
import ThemeToggle from "@/components/modules/ui/themeToggle";
import { getMe } from "@/utils/auth/authGuard";
import type { CategoryNode } from "@/types";
import categoryService from "@/services/server/public/category";
import favoriteService from "@/services/server/user/favorite";

const Navbar = async () => {
  await connectToDB();

  const [user, tree] = await Promise.all([
    getMe(),
    categoryService.getAllCategories() as Promise<CategoryNode[]>,
  ]);

  // same service as GET /api/user/favorites/count
  const favoriteCount = user
    ? (await favoriteService.getFavoriteCount(user._id)).data.count
    : 0;

  return (
    <nav className="fixed inset-x-0 top-[5px] z-[9999] mx-auto h-[70px] rounded-2xl bg-sage-400 shadow-float dark:bg-sage-700 sm:mx-4 lg:mx-6">
      <div className="mx-auto flex h-full w-full max-w-container items-center justify-between gap-3 px-4 sm:px-6">

        {/* Logo */}
        <Link href="/" className="shrink-0 text-2xl font-bold text-white">
          SETKIDS
        </Link>

        {/* Desktop links (lg+) */}
        <DesktopMenu tree={tree} username={user?.username || null} />

        {/* Desktop icons */}
        <div className="hidden shrink-0 items-center gap-4 text-2xl text-white lg:flex xl:gap-5">
          <ThemeToggle />
          <CartCount isLoggedIn={Boolean(user)} />
          <FavoriteCount isLoggedIn={Boolean(user)} initialCount={favoriteCount} />
        </div>

        {/* Mobile menu */}
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
