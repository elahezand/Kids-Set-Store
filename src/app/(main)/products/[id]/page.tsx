import { cache } from "react";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/modules/main/breadcrumb";
import Comments from "@/components/template/main/product/comments/comments";
import ProductContent from "@/components/template/main/product/productContent";
import RelatedProducts from "@/components/template/main/product/relatedProducts";
import connectToDB from "@/configs/db";
import commentService from "@/services/server/public/comment";
import productService from "@/services/server/public/product";
import favoriteService from "@/services/server/user/favorite";
import { getMe } from "@/utils/auth/authGuard";
import { toPlain } from "@/utils/format";
import { toProductCards, toProductView } from "@/utils/productView";
import type { Metadata } from "next";
import type { PageProps, ProductDoc, ServiceResult } from "@/types";

type ProductPageProps = PageProps<{ id: string }>;

const RELATED_LIMIT = 8;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

const getProduct = cache(async (id: string): Promise<ProductDoc | null> => {
  await connectToDB();
  const result = (await productService.getProductById(id, { countView: true })) as ServiceResult<ProductDoc>;
  return result.success ? (result.data ?? null) : null;
});

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const view = toProductView(await getProduct(id));
  if (!view) return { title: "Product not found" };

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

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const product = await getProduct(id);
  const productView = toProductView(product);
  if (!product || !productView) notFound();

  const view = toPlain(productView);

  const [commentsCount, related, user] = await Promise.all([
    commentService.countByProduct(product._id) as Promise<number>,
    productService.getRelatedProducts(product, RELATED_LIMIT) as Promise<ProductDoc[]>,
    getMe(),
  ]);

  const isFavorited: boolean | undefined = user
    ? Boolean((await favoriteService.isFavorited(user._id, product._id)).data?.isFavorited)
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
      availability: view.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="page-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <Breadcrumb route="products" title={view.name} />

      <div
        data-aos="fade-up"
        className="mx-auto flex max-w-[1200px] flex-col gap-16 pb-20 text-text sm:gap-20 lg:gap-28 lg:pb-28 dark:text-gray-100"
      >
        <ProductContent product={view} commentsCount={commentsCount} isFavorited={isFavorited} />

        <section id="comments" className="scroll-mt-28 border-t border-gray-200 pt-12 sm:pt-16 dark:border-white/10">
          <Comments productId={view._id} total={commentsCount} isLoggedIn={Boolean(user)} />
        </section>

        <section className="border-t border-gray-200 pt-12 sm:pt-16 dark:border-white/10">
          <RelatedProducts related={toProductCards(related)} />
        </section>
      </div>
    </div>
  );
}
