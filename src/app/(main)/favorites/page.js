import { redirect } from "next/navigation";
import Breadcrumb from "@/components/modules/main/breadCrumb";
import FavoriteItems from "@/components/template/main/favorites/favoriteItems";
import connectToDB from "@/configs/db";
import { getMe } from "@/utils/auth/authGuard";
import favoriteService from "@/services/user/favorite";
import { toProductCards } from "@/utils/productView";

export const metadata = {
  title: "My Favorites | SET KIDS",
  description: "Products you saved for later.",
  robots: { index: false, follow: false },
};

const LIMIT = 20;

export default async function FavoritesPage({ searchParams }) {
  await connectToDB();

  const user = await getMe();
  if (!user) redirect("/login-register");

  const params = (await searchParams) || {};
  const cursor = typeof params.cursor === "string" ? params.cursor : undefined;

  // same service as GET /api/user/favorites
  const result = await favoriteService.getUserFavorites(user._id, {
    limit: LIMIT,
    cursor,
  });

  // a favorite whose product was deleted has productId = null after populate
  const products = (result.data ?? [])
    .map((favorite) => favorite.productId)
    .filter((product) => product && product.status === "active");

  return (
    <div className="page-container">
      <Breadcrumb route="favorites" title="Favorites" />
      <FavoriteItems
        initialFavorites={toProductCards(products)}
        initialCursor={result.pagination?.nextCursor || null}
        initialHasMore={result.pagination?.hasMore || false}
        limit={LIMIT}
      />
    </div>
  );
}
