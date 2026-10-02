import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Breadcrumb from "@/components/modules/main/breadCrumb";
import FavoriteItems from "@/components/template/main/favorites/favoriteItems";
import connectToDB from "@/configs/db";
import { getMe } from "@/utils/auth/authGuard";
import favoriteService from "@/services/server/user/favorite";
import { toInitialPage } from "@/utils/initialPage";
import type { FavoriteEntry, Pagination } from "@/types";

export const metadata: Metadata = {
  title: "My Favorites | SET KIDS",
  description: "Products you saved for later.",
  robots: { index: false, follow: false },
};

const LIMIT = 20;

type FavoritesResult = { data: FavoriteEntry[]; pagination: Pagination };

export default async function FavoritesPage() {
  await connectToDB();

  const user = await getMe();
  if (!user) redirect("/login-register");
  const result = (await favoriteService.getUserFavorites(user._id, { limit: LIMIT })) as FavoritesResult;
  

  return (
    <div className="page-container">
      <Breadcrumb route="favorites" title="Favorites" />
      <FavoriteItems initialPage={toInitialPage(result, LIMIT)} limit={LIMIT} />
    </div>
  );
}
