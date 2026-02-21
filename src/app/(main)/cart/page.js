import Table from "@/components/template/cart/table";
import styles from "@/styles/cart.module.css";
import { getMe } from "@/utils/serverHelper";
import Breadcrumb from "@/components/modules/breadCrumb/breadCrumb";
// Generate metadata for SEO and social sharing
export const metadata = {
  title: "Shopping Cart - YourSiteName",
  description: "View and manage the items in your shopping cart. Proceed to checkout or continue shopping.",
  keywords: "shopping cart, checkout, products, ecommerce, your site name",
  openGraph: {
    title: "Shopping Cart - YourSiteName",
    description: "View and manage the items in your shopping cart. Proceed to checkout or continue shopping.",
    url: "https://yoursite.com/cart",
    siteName: "YourSiteName",
    images: [
      {
        url: "https://yoursite.com/images/cart-og-image.png",
        width: 800,
        height: 600,
        alt: "Shopping Cart",
      },
    ],
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
  const user = await getMe()

  return (
    <div className="container">
      <Breadcrumb title={"Basket CART"} route={"Cart"} />
      <div
        className={styles.cart}
        data-aos="fade-up">
        <Table user={JSON.parse(JSON.stringify(user._id))} />
      </div>
    </div>
  )
}
