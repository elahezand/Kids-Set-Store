import Link from "next/link";
import { redirect } from "next/navigation";
import { LuHeart } from "react-icons/lu";
import connectToDB from "@/configs/db";
import FavoriteModel from "@/model/favorite";
import ProductModel from "@/model/product";
import { authUser } from "@/utils/auth/authGuard";
import { paginatePage } from "@/utils/paginate";
import PageHeader from "@/components/modules/panel/pageHeader";
import Pagination from "@/components/modules/ui/pagination";
import EmptyState from "@/components/modules/ui/emptyState";
import FavoriteCard from "@/components/template/p-user/favorites/favoriteCard";

export default async function FavoritesPage({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const user = await authUser();
    if (!user) redirect("/login-register");

    const favorites = await FavoriteModel.find({ user: user._id }).select("productId").lean();
    const productIds = favorites.map((f) => f.productId);
    const paginatedData = productIds.length
        ? await paginatePage(ProductModel, params, { _id: { $in: productIds } })
        : { data: [], pageCount: 0, limit: 10 };
    const products = JSON.parse(JSON.stringify(paginatedData.data));

    return (
        <>
            <PageHeader title="Favorites" description="Products you've saved for later." />
            {products.length ? (
                <>
                    <section className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <FavoriteCard key={product._id} id={product._id} name={product.title}
                                score={product.metrics?.score} price={product.minPrice ?? product.price}
                                img={product.images?.[0]} />
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
