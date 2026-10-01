import Link from "next/link";
import { IoCheckmarkCircle, IoCloseCircle, IoTimeOutline } from "react-icons/io5";
import connectToDB from "@/configs/db";
import orderService from "@/services/public/order";
import { getMe } from "@/utils/auth/authGuard";
import { formatPrice } from "@/utils/format";

export const metadata = {
  title: "Payment result | SET KIDS",
  robots: { index: false, follow: false },
};

const STATES = {
  paid: {
    Icon: IoCheckmarkCircle,
    color: "text-green-600 dark:text-green-400",
    title: "Payment successful",
    text: "Thank you! Your order has been placed.",
  },
  pending: {
    Icon: IoTimeOutline,
    color: "text-amber-500",
    title: "Payment is being checked",
    text: "We could not confirm the payment yet. Your order stays pending and will be updated automatically.",
  },
  failed: {
    Icon: IoCloseCircle,
    color: "text-danger-500",
    title: "Payment failed",
    text: "The payment was not completed. Any amount taken from your account is returned by the bank.",
  },
};

export default async function VerifyPaymentPage({ searchParams }) {
  const params = (await searchParams) || {};
  const authority = String(params.Authority ?? params.authority ?? "").trim();

  await connectToDB();

  let order = null;
  let errorMessage = null;

  if (!authority) {
    errorMessage = "Missing payment information.";
  } else {
    try {
      const result = await orderService.verify(authority);
      if (result.success) order = result.data;
      else errorMessage = result.message;
    } catch (error) {
      console.error("[checkout/verify]", error);
      errorMessage = "Something went wrong while checking your payment.";
    }
  }

  // only the owner sees the order details
  const user = order ? await getMe() : null;
  const isOwner = Boolean(user && order && String(order.user) === String(user._id));

  const state =
    order?.paymentStatus === "paid"
      ? STATES.paid
      : order?.paymentStatus === "pending" && params.Status !== "NOK"
        ? STATES.pending
        : STATES.failed;

  const { Icon } = state;

  return (
    <div className="page-container">
      <div className="card card-body mx-auto max-w-xl py-12 text-center text-text dark:text-gray-100">
        <Icon className={`mx-auto mb-4 text-7xl ${state.color}`} aria-hidden="true" />
        <h1 className="mb-2 text-2xl font-bold">{errorMessage ? "Payment not found" : state.title}</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">{errorMessage || state.text}</p>

        {isOwner && (
          <dl className="mx-auto mb-8 grid max-w-sm grid-cols-2 gap-y-2 text-left text-sm">
            <dt className="text-gray-500">Order</dt>
            <dd className="text-right font-mono">#{String(order._id).slice(-6).toUpperCase()}</dd>
            <dt className="text-gray-500">Amount</dt>
            <dd className="text-right">{formatPrice(order.pricing?.total)}</dd>
            {order.payment?.refId && (
              <>
                <dt className="text-gray-500">Reference</dt>
                <dd className="text-right font-mono">{order.payment.refId}</dd>
              </>
            )}
          </dl>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/p-user/orders" className="btn btn-primary">
            My orders
          </Link>
          <Link href="/products" className="btn btn-secondary">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
