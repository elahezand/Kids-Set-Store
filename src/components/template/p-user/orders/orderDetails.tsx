"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { LuClock, LuPackageCheck, LuTruck, LuX } from "react-icons/lu";
import Modal from "@/components/modules/ui/modal";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";
import { formatDate, formatPrice } from "@/utils/format";
import { ORDER_STATUS, paymentState, shortId } from "@/utils/panelView";
import type { OrderItem, OrderListItem } from "@/types";

interface OrderDetailsProps {
  order: OrderListItem;
  actions?: ReactNode;
  onClose: () => void;
}

const PAYMENT_METHOD: Record<string, string> = {
  cash: "Cash on delivery",
  zarinpal: "Online (ZarinPal)",
  wallet: "Wallet",
};

const attributesText = (item: OrderItem) =>
  Object.entries(item.variantSnapshot?.attributes ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");

const statusNote = (order: OrderListItem) => {
  if (order.status === "created") return "Waiting for your payment.";
  if (order.status === "processing") return "We're preparing your order - you can still cancel it until it ships.";
  if (order.status === "shipped" && order.paymentMethod === "cash")
    return order.isDelivered
      ? "You confirmed you received it - the order completes once the store confirms your cash payment."
      : "On its way - pay the courier in cash when it arrives.";
  if (order.status === "shipped") return "On its way.";
  if (order.status === "completed")
    return `Completed${order.deliveredAt ? ` on ${formatDate(order.deliveredAt)}` : ""}. Thanks for your order!`;
  return null;
};

export default function OrderDetails({ order, actions, onClose }: OrderDetailsProps) {
  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.created;
  const payment = paymentState(order);
  const address = order.shippingAddress;
  const note = statusNote(order);

  return (
    <Modal
      title={`Order ${shortId(order._id)}`}
      description={`Placed ${formatDate(order.createdAt)}`}
      size="lg"
      onClose={onClose}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-1.5">
          <span className={`badge ${status.badge}`}>{status.label}</span>
          <span className={`badge ${payment.badge}`}>{payment.label}</span>
          <span className="badge badge-neutral">{PAYMENT_METHOD[order.paymentMethod] ?? order.paymentMethod}</span>
        </div>

        {note && (
          <p className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-700 dark:bg-white/5 dark:text-gray-400">
            {order.status === "completed" ? (
              <LuPackageCheck className="size-4 shrink-0" />
            ) : (
              <LuClock className="size-4 shrink-0" />
            )}
            {note}
          </p>
        )}

        {order.shippedAt && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-gray-200 p-4 text-sm dark:border-white/10">
            <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
              <LuTruck className="size-4 text-sage-600" /> Shipped on {formatDate(order.shippedAt)}
            </span>
            {order.trackingCode && (
              <span className="text-gray-700 dark:text-gray-400">
                Tracking <span className="font-mono">{order.trackingCode}</span>
              </span>
            )}
            {order.expectedDeliveryAt && (
              <span className="text-gray-700 dark:text-gray-400">Arrives ~{formatDate(order.expectedDeliveryAt)}</span>
            )}
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-gray-600 uppercase">Items</p>
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-white/10">
            {order.items.map((item) => (
              <li key={String(item._id)} className="flex items-center gap-3 p-3">
                <Image
                  width={48}
                  height={48}
                  src={item.productSnapshot?.image || PLACEHOLDER_IMAGE}
                  alt=""
                  className="size-12 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-white/10"
                />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-100">{item.productSnapshot?.title}</p>
                  <p className="truncate text-xs text-gray-700 dark:text-gray-500">
                    {[attributesText(item), `× ${item.quantity}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatPrice(item.finalPrice * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {address && (
          <div className="rounded-xl border border-gray-200 p-4 text-sm dark:border-white/10">
            <p className="mb-1 text-xs font-semibold tracking-wide text-gray-600 uppercase">Ship to</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{address.name}</p>
            <p className="text-gray-700 dark:text-gray-400">
              {address.address}, {address.city}, {address.state} · {address.postalCode}
            </p>
            {address.phone && <p className="text-gray-700 tabular-nums dark:text-gray-400">{address.phone}</p>}
          </div>
        )}

        <dl className="space-y-1.5 rounded-xl bg-gray-50 p-4 text-sm dark:bg-white/5">
          {[
            ["Subtotal", order.pricing?.subtotal],
            ["Discount", order.pricing?.discount ? -order.pricing.discount : 0],
            ["Shipping", order.pricing?.shippingCost],
            ["Paid from wallet", order.pricing?.walletUsed ? -order.pricing.walletUsed : 0],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between text-gray-700 dark:text-gray-400">
              <dt>{label}</dt>
              <dd className="tabular-nums">{formatPrice(Number(value))}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900 dark:border-white/10 dark:text-gray-100">
            <dt>Total{order.coupon?.code ? ` (code ${order.coupon.code})` : ""}</dt>
            <dd className="tabular-nums">{formatPrice(order.pricing?.total)}</dd>
          </div>
        </dl>

        {order.status === "cancelled" && (
          <p className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-700 dark:bg-white/5 dark:text-gray-400">
            <LuX className="size-4 shrink-0" />
            {order.refundAmount
              ? `Cancelled - ${formatPrice(order.refundAmount)} was refunded to your wallet${
                  order.refundedAt ? ` on ${formatDate(order.refundedAt)}` : ""
                }.`
              : "Cancelled - nothing was paid, so there was nothing to refund."}
          </p>
        )}

        {actions && (
          <div className="flex justify-end border-t border-gray-200 pt-4 dark:border-white/10">{actions}</div>
        )}
      </div>
    </Modal>
  );
}
