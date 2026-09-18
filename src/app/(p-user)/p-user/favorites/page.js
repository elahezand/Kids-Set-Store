import Link from "next/link";
import { redirect } from "next/navigation";
import { LuHeart } from "react-icons/lu";
import connectToDB from "../../../../../configs/db";
import FavoriteModel from "../../../../../model/favorite";
import ProductModel from "../../../../../model/product";
import { authUser } from "@/utils/serverHelper";
import { paginate } from "@/utils/paginate";
import PageHeader from "@/components/modules/panel/pageHeader";
import Pagination from "@/components/modules/ui/loadMore";
import EmptyState from "@/components/modules/ui/emptyState";
import FavoriteCard from "@/components/template/p-user/favorites/favoriteCard";

export default async function FavoritesPage({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const user = await authUser();
    if (!user) redirect("/login-register");

    const wishlist = await FavoriteModel.findOne({ user: user._id }).select("products").lean();
    const paginatedData = wishlist?.products?.length
        ? await paginate(ProductModel, params, { _id: { $in: wishlist.products } })
        : { data: [], pageCount: 0, limit: 10 };
    const products = JSON.parse(JSON.stringify(paginatedData.data));

    return (
        <>
            <PageHeader title="Favorites" description="Products you've saved for later." />
            {products.length ? (
                <>
                    <section className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <FavoriteCard key={product._id} id={product._id} name={product.name}
                                score={product.score} price={product.price} img={product.img} />
                        ))}
                    </section>
                    <Pagination pageCount={paginatedData.pageCount} limit={paginatedData.limit} />
                </>
            ) : (
                <div className="card">
                    <EmptyState title="No favorites yet" description="Tap the heart on any product to save it here." icon={LuHeart}
                        action={<Link href="/products" className="btn btn-primary btn-sm">Browse products</Link>} />
                </div>
            )}
        </>
    );
}
