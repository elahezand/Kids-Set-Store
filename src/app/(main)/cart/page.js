import { redirect } from "next/navigation";
import Breadcrumb from "@/components/modules/main/breadCrumb";
import Table from "@/components/template/main/cart/table";
import connectToDB from "@/configs/db";
import { getMe } from "@/utils/auth/authGuard";
import cartService from "@/services/user/cart";
import { toPlain } from "@/utils/format";

export const metadata = {
  title: "Shopping Cart | SET KIDS",
  description: "Review the items in your cart and check out.",
  robots: { index: false, follow: false },
};

/* The cart lives on the server (model/cart + services/user/cart), so it needs a user. */
export default async function CartPage() {
  await connectToDB();

  const user = await getMe();
  if (!user) redirect("/login-register");

  // same service as GET /api/user/cart -> first paint without a loading spinner
  const cart = await cartService.getUserCart(user._id);

  const addresses = (user.addresses ?? []).map((address) => ({
    name: address.name,
    postalCode: address.postalCode,
    address: address.address,
    state: address.state,
    city: address.city,
  }));

  return (
    <div className="page-container">
      <Breadcrumb route="cart" title="Cart" />
      <div className="flex w-full flex-col items-start gap-8 lg:flex-row">
        <Table
          initialCart={toPlain(cart)}
          addresses={toPlain(addresses)}
          defaultPhone={user.phone ?? ""}
          walletBalance={Number(user.wallet?.balance ?? 0)}
        />
      </div>
    </div>
  );
}
