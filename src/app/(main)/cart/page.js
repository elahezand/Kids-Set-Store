import Table from "@/components/template/main/cart/table";
import Breadcrumb from "@/components/modules/main/breadCrumb";

export const metadata = {
  title: "Shopping Cart - YourSiteName",
  description: "View and manage the items in your shopping cart. Proceed to checkout or continue shopping.",
  keywords: "shopping cart, checkout, products, ecommerce, your site name",
  openGraph: {
    title: "Shopping Cart - YourSiteName",
    description: "View and manage the items in your shopping cart. Proceed to checkout or continue shopping.",
    url: "https://yoursite.com/cart",
    siteName: "YourSiteName",
    images: [{ url: "https://yoursite.com/images/cart-og-image.png", width: 800, height: 600, alt: "Shopping Cart" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopping Cart - YourSiteName",
    description: "View and manage the items in your shopping cart. Proceed to checkout or continue shopping.",
    images: ["https://yoursite.com/images/cart-og-image.png"],
  },
};

export default async function page() {
  return (
    <div className="page-container">
      <Breadcrumb title="Basket CART" route="Cart" />
      <div
        className="flex w-full flex-col items-start gap-8 lg:flex-row"
        data-aos="fade-up" >
        <Table />
      </div>
    </div>
  )
}
