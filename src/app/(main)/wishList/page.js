import Breadcrumb from "@/components/modules/main/breadCrumb";
import { getMe } from "@/utils/serverHelper";
import { paginate } from "@/utils/paginate";
import WishListItems from "@/components/template/main/wishList/wishListItems";

import { redirect } from "next/navigation";
import FavoriteModel from "../../../../model/favorite";

export const metadata = {
    title: "Favorites List - SET KIDS",
    description: "View your favorite products on Blue Tea. Keep track of all items you love and save them for later.",
    keywords: ["SET KIDS", "Favorites", "Wishlist", "Saved Products", "Shopping"],
    authors: [{ name: "SET KIDS Team" }],
    openGraph: {
        title: "Favorites List - SET KIDS",
        description: "View your favorite products on SET KIDS. Keep track of all items you love and save them for later.",
        url: "https://yourwebsite.com/favorites",
        siteName: "SET KIDS",
        images: [{ url: "https://yourwebsite.com/images/favorites-og.jpg", width: 1200, height: 630, alt: "Favorites List" }],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Favorites List - SET KIDS",
        description: "View your favorite products on SET KIDS. Keep track of all items you love and save them for later.",
        images: ["https://yourwebsite.com/images/favorites-og.jpg"],
    },
};

const page = async ({ searchParams }) => {
    const user = await getMe()
    if (!user) redirect("/login-register")

    const params = await searchParams
    const result = await paginate(FavoriteModel, {
        limit: Number(params?.limit) || 20,
        cursor: params?.cursor || null,

        filters: {
            user: user._id,
        },

        populate: {
            path: "products",
        },
    });

    const wishLists = (result.data || [])
        .map((favorite) => favorite.products)
        .filter(Boolean)
        .map((product) => JSON.parse(JSON.stringify(product)));
console.log(wishLists);

    const queryString = new URLSearchParams(
        Object.entries(params || {}).filter(([key, value]) => key !== "cursor" && typeof value === "string")
    ).toString();

    return (
        <div className="page-container">
            <Breadcrumb route="Favorites" title="Favorites List" />
            <WishListItems
                key={queryString}
                initialWishlists={wishLists}
                initialCursor={result.pagination?.nextCursor || null}
                initialHasMore={result.pagination?.hasMore || false}
                limit={Number(params?.limit) || 20}
            />
        </div>
    );
};

export default page;
