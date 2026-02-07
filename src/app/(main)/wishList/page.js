
import Breadcrumb from "@/components/modules/breadCrumb/breadCrumb";
import { getMe } from "@/utils/serverHelper";
import { paginate } from "@/utils/helper";
import WishListItems from "@/components/template/wishList/wishListItems";
import ProductModel from "../../../../model/product";
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
        title: "Favorites List - SET KIDS",
        description: "View your favorite products on SET KIDS. Keep track of all items you love and save them for later.",
        images: ["https://yourwebsite.com/images/favorites-og.jpg"],
    },
};

const page = async ({ searchParams }) => {
    const user = await getMe()
    if (!user) redirect("/login-register")

    const searchparams = searchParams

    const wishlist = await FavoriteModel.findOne({ user: user.id })
    if (!wishlist) return null

    const paginatedData = await paginate(
        ProductModel,
        searchparams,
        { _id: { $in: wishlist.products } }
    )

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
