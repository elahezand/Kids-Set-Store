import { cache } from "react";
import { notFound } from "next/navigation";
import connectToDB from "@/configs/db";
import productService from "@/services/public/product";
import commentService from "@/services/public/comment";
import favoriteService from "@/services/user/favorite";
import { getMe } from "@/utils/auth/authGuard";
import Breadcrumb from "@/components/modules/main/breadCrumb";
import ProductContent from "@/components/template/main/product/productContent";
import Comments from "@/components/template/main/product/comments/comments";
import MoreProducts from "@/components/template/main/product/moreProducts";
import { toProductView, toProductCards } from "@/utils/productView";
import { toPlain } from "@/utils/format";

const RELATED_LIMIT = 8;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

// cache() => generateMetadata and the page share ONE query (and one view count) per request
const getProduct = cache(async (id) => {
    await connectToDB();

    // same service as GET /api/products/:id (only "active" products, 400/404 otherwise)
    const result = await productService.getProductById(id, { countView: true });

    return result.success ? result.data : null;
});

export async function generateMetadata({ params }) {
    const { id } = await params;

    const product = await getProduct(id);
    if (!product) return { title: "Product not found" };

    const view = toProductView(product);

    return {
        title: `${view.name} | SET KIDS`,
        description: view.shortDescription,
        ...(SITE_URL && { alternates: { canonical: `${SITE_URL}/products/${view._id}` } }),
        openGraph: {
            title: view.name,
            description: view.shortDescription,
            images: view.images.length ? [view.img] : [],
        },
    };
}

const Product = async ({ params }) => {
    const { id } = await params;

    const product = await getProduct(id);
    if (!product) notFound();

    const view = toPlain(toProductView(product));

    const [commentsCount, related, user] = await Promise.all([
        commentService.countByProduct(product._id),
        productService.getRelatedProducts(product, RELATED_LIMIT),
        getMe(),
    ]);

    // known favorite state => the heart can toggle (only for logged-in users)
    const isFavorited = user
        ? (await favoriteService.isFavorited(user._id, product._id)).data.isFavorited
        : undefined;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: view.name,
        description: view.shortDescription || undefined,
        image: view.images.length ? view.images : undefined,
        sku: view.variants[0]?.sku || undefined,
        ...(view.reviewsCount > 0 && {
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.metrics?.score ?? 0,
                reviewCount: view.reviewsCount,
            },
        }),
        offers: {
            "@type": "Offer",
            price: view.price,
            availability: view.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
        },
    };

    return (
        <div className="page-container">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
                }}
            />

            <Breadcrumb route="products" title={view.name} />

            <div
                data-aos="fade-up"
                className="mx-auto max-w-[1200px] text-text dark:text-gray-100"
            >
                <ProductContent
                    product={view}
                    commentsCount={commentsCount}
                    isFavorited={isFavorited}
                    isLoggedIn={Boolean(user)}
                />

                <section
                    id="comments"
                    className="scroll-mt-28 border-t border-gray-200 pt-10 dark:border-white/10"
                >
                    <Comments
                        productId={view._id}
                        total={commentsCount}
                        isLoggedIn={Boolean(user)}
                    />
                </section>

                <MoreProducts related={toProductCards(related)} />
            </div>
        </div>
    );
};

export default Product;
