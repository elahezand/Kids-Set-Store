import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Breadcrumb from "@/components/modules/main/breadCrumb";
import Table from "@/components/template/main/cart/table";
import connectToDB from "@/configs/db";
import { getMe } from "@/utils/auth/authGuard";
import cartService from "@/services/server/user/cart";
import { toPlain } from "@/utils/format";
import type { CartView, SavedAddress, SessionUser } from "@/types";

export const metadata: Metadata = {
  title: "Shopping Cart | SET KIDS",
  description: "Review the items in your cart and check out.",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  await connectToDB();

  const user = (await getMe()) as SessionUser | null;
  if (!user) redirect("/login-register");

  const cart = (await cartService.getUserCart(user._id)) as CartView;

  const addresses: SavedAddress[] = (user.addresses ?? []).map(({ name, postalCode, address, state, city }) => ({
    name,
    postalCode,
    address,
    state,
    city,
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
