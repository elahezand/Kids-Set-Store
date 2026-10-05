import Link from "next/link";
import CartCount from "@/components/modules/main/navbar/cartCount";
import DesktopMenu from "@/components/modules/main/navbar/desktopMenu";
import FavoritesCount from "@/components/modules/main/navbar/favoritesCount";
import MobileMenu from "@/components/modules/main/navbar/mobileMenu";
import NavbarShell from "@/components/modules/main/navbar/navbarShell";
import ThemeToggle from "@/components/modules/ui/themeToggle";
import connectToDB from "@/configs/db";
import categoryService from "@/services/server/public/category";
import favoriteService from "@/services/server/user/favorite";
import { getMe } from "@/utils/auth/authGuard";
import { ROUTES } from "@/utils/constants";
import type { CategoryNode } from "@/types";

export default async function Navbar() {
  await connectToDB();

  const [user, tree] = await Promise.all([getMe(), categoryService.getAllCategories() as Promise<CategoryNode[]>]);

  const username: string | null = user?.username || null;
  const isLoggedIn = Boolean(user);
  const favoriteCount: number = user ? (await favoriteService.getFavoriteCount(user._id)).data.count : 0;

  return (
    <NavbarShell>
      <div className="mx-auto flex h-full w-full max-w-container items-center justify-between gap-3 px-4 sm:px-6">
        <Link href={ROUTES.home} className="shrink-0 text-2xl font-bold">
          SETKIDS
        </Link>

        <DesktopMenu tree={tree} username={username} />

        <div className="hidden shrink-0 items-center gap-4 text-2xl lg:flex xl:gap-5">
          <ThemeToggle />
          <CartCount isLoggedIn={isLoggedIn} />
          <FavoritesCount isLoggedIn={isLoggedIn} initialCount={favoriteCount} />
        </div>

        <MobileMenu tree={tree} username={username} favoriteCount={favoriteCount} />
      </div>
    </NavbarShell>
  );
}
