
import Breadcrumb from "@/components/modules/breadCrumb/breadCrumb";
import { getMe } from "@/utils/serverHelper";
import WishListItems from "@/components/template/wishList/wishListItems";
import FavoriteModel from "../../../model/favorite";

export const metadata = {
    title: "Favorites List - Blue Tea",
    description: "View your favorite products on Blue Tea. Keep track of all items you love and save them for later.",
    keywords: ["Blue Tea", "Favorites", "Wishlist", "Saved Products", "Shopping"],
    authors: [{ name: "Blue Tea Team" }],
    openGraph: {
        title: "Favorites List - Blue Tea",
        description: "View your favorite products on Blue Tea. Keep track of all items you love and save them for later.",
        url: "https://yourwebsite.com/favorites",
        siteName: "Blue Tea",
        images: [
            {
                url: "https://yourwebsite.com/images/favorites-og.jpg",
                width: 1200,
                height: 630,
                alt: "Favorites List",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Favorites List - Blue Tea",
        description: "View your favorite products on Blue Tea. Keep track of all items you love and save them for later.",
        images: ["https://yourwebsite.com/images/favorites-og.jpg"],
    },
};

const page = async ({ searchParams }) => {

    const user = await getMe()
    if (!user) return redirect("/login-register")

    const searchparams = await searchParams
    const paginatedData = await paginate(FavoriteModel, searchparams, { user: user.id }, "products", true, false)

    return (
        <>
            <Breadcrumb route={"Favorites"} title={"Favorites List"} />
            <WishListItems
                nextCursor={paginatedData.nextCursor}
                limit={paginatedData.limit}
                data={JSON.parse(JSON.stringify(paginatedData.data))} />
        </>
    );
};

export default page;
