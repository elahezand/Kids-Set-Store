import type { Metadata } from "next";
import PageHeader from "@/components/modules/panel/pageHeader";
import FavoritesGrid from "@/components/template/p-user/favorites/favoritesGrid";
import favoriteService from "@/services/server/user/favorite";
import { getPanelSession } from "@/utils/auth/panelUser";
import { toInitialPage } from "@/utils/initialPage";
import type { FavoriteEntry, Pagination } from "@/types";

export const metadata: Metadata = { title: "Favorites" };

const LIMIT = 20;

export default async function FavoritesPage() {
  const { user } = await getPanelSession();
  if (!user) return null;

  const result = (await favoriteService.getUserFavorites(user._id, { limit: LIMIT })) as {
    data: FavoriteEntry[];
    pagination: Pagination;
  };

  return (
    <>
      <PageHeader title="Favorites" description="Products you've saved for later." />
      <FavoritesGrid initialPage={toInitialPage(result, LIMIT)} limit={LIMIT} />
    </>
  );
}
