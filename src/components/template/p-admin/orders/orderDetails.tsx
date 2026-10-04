"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import { LuBanknote, LuCircleCheck, LuTruck, LuX } from "react-icons/lu";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import Modal from "@/components/modules/ui/modal";
import { useMarkOrderDelivered, useShipOrderItem, useUpdateOrder } from "@/services/client/admin";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";
import { formatDate, formatPrice } from "@/utils/format";
import { ORDER_STATUS, ORDER_STATUS_MOVES, PAYMENT_STATUS, personName, shortId } from "@/utils/panelView";
import type { AdminOrder, AdminOrderItem } from "@/types";

interface OrderDetailsProps {
  order: AdminOrder;
  onClose: () => void;
}

const attributesText = (item: AdminOrderItem) =>
  Object.entries(item.variantSnapshot?.attributes ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");

export default function OrderDetails({ order, onClose }: OrderDetailsProps) {
  const [confirm, setConfirm] = useState<"cancel" | "complete" | "paid" | null>(null);
  const [shippingItem, setShippingItem] = useState<string | null>(null);

  const update = useUpdateOrder({ onDone: () => setConfirm(null) });
  const delivered = useMarkOrderDelivered({ onDone: () => setConfirm(null) });
  const ship = useShipOrderItem({ onDone: () => setShippingItem(null) });

  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.created;
  const payment = PAYMENT_STATUS[order.paymentStatus] ?? PAYMENT_STATUS.pending;
  const moves = ORDER_STATUS_MOVES[order.status] ?? [];
  const canMarkPaid =
    order.paymentMethod === "cash" && order.paymentStatus === "pending" && order.status !== "cancelled";
  const canShip = order.status === "processing";
  const user = order.user && typeof order.user === "object" ? order.user : null;
  const address = order.shippingAddress;
  const id = String(order._id);

  const onShip = (item: AdminOrderItem) => (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    ship.mutate({
      orderId: id,
      itemId: String(item._id),
      trackingCode: String(data.get("trackingCode") || "").trim(),
      estimatedDeliveryAt: String(data.get("estimatedDeliveryAt") || "") || undefined,
    });
  };

  const confirmAction = () => {
    if (confirm === "cancel") update.mutate({ id, status: "cancelled" });
    if (confirm === "paid") update.mutate({ id, paymentStatus: "paid" });
    if (confirm === "complete") delivered.mutate(id);
  };

  return (
    <>
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
            <span className="badge badge-neutral capitalize">{order.paymentMethod}</span>
            {order.isCashOverdue && <span className="badge badge-danger">Cash overdue</span>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4 text-sm dark:border-white/10">
              <p className="mb-1 text-xs font-semibold tracking-wide text-gray-600 uppercase">Customer</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{personName(user, "Customer")}</p>
              {user?.phone && <p className="text-gray-700 tabular-nums dark:text-gray-400">{user.phone}</p>}
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
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-600 uppercase">Items</p>
            <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-white/10">
              {order.items.map((item) => {
                const shipped = item.fulfillment?.status === "shipped";
                const itemId = String(item._id);
                return (
                  <li key={itemId} className="space-y-3 p-3">
                    <div className="flex items-center gap-3">
                      <Image
                        width={48}
                        height={48}
                        src={item.productSnapshot?.image || PLACEHOLDER_IMAGE}
                        alt=""
                        className="size-12 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-white/10"
                      />
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                          {item.productSnapshot?.title}
                        </p>
                        <p className="truncate text-xs text-gray-700 dark:text-gray-500">
                          {[attributesText(item), `× ${item.quantity}`].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatPrice(item.finalPrice * item.quantity)}
                        </p>
                        {shipped ? (
                          <span className="badge badge-success mt-1">Shipped</span>
                        ) : (
                          canShip &&
                          shippingItem !== itemId && (
                            <button
                              type="button"
                              onClick={() => setShippingItem(itemId)}
                              className="btn btn-soft-primary btn-sm mt-1"
                            >
                              <LuTruck className="size-3.5" /> Ship
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {shipped && item.fulfillment?.trackingCode && (
                      <p className="text-xs text-gray-700 dark:text-gray-500">
                        Tracking <span className="font-mono">{item.fulfillment.trackingCode}</span>
                        {item.fulfillment.estimatedDeliveryAt &&
                          ` · arrives ~${formatDate(item.fulfillment.estimatedDeliveryAt)}`}
                      </p>
                    )}

                    {shippingItem === itemId && (
                      <form
                        onSubmit={onShip(item)}
                        className="grid gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-[1fr_auto_auto] dark:bg-white/5"
                      >
                        <input
                          name="trackingCode"
                          required
                          minLength={3}
                          maxLength={60}
                          placeholder="Tracking code"
                          aria-label="Tracking code"
                          className="input py-2"
                        />
                        <input
                          name="estimatedDeliveryAt"
                          type="date"
                          aria-label="Estimated delivery"
                          title="Estimated delivery (optional)"
                          className="input py-2"
                        />
                        <div className="flex gap-2">
                          <button type="submit" disabled={ship.isPending} className="btn btn-primary btn-sm flex-1">
                            {ship.isPending ? "Saving…" : "Mark shipped"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShippingItem(null)}
                            className="btn btn-ghost btn-sm btn-icon"
                            aria-label="Cancel"
                          >
                            <LuX className="size-4" />
                          </button>
                        </div>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

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

          {(canMarkPaid || moves.length > 0) && (
            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end dark:border-white/10">
              {moves.includes("cancelled") && (
                <button type="button" onClick={() => setConfirm("cancel")} className="btn btn-soft-danger">
                  <LuX className="size-4" /> Cancel order
                </button>
              )}
              {canMarkPaid && (
                <button type="button" onClick={() => setConfirm("paid")} className="btn btn-secondary">
                  <LuBanknote className="size-4" /> Cash received
                </button>
              )}
              {moves.includes("completed") && (
                <button type="button" onClick={() => setConfirm("complete")} className="btn btn-primary">
                  <LuCircleCheck className="size-4" /> Mark delivered
                </button>
              )}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm === "cancel"
            ? "Cancel this order?"
            : confirm === "paid"
              ? "Mark the cash as received?"
              : "Mark this order as delivered?"
        }
        description={
          confirm === "cancel"
            ? "Reserved stock goes back to the store and anything already paid is refunded to the customer's wallet. This can't be undone."
            : confirm === "paid"
              ? "Use this once the courier has handed over the cash."
              : "The order will be completed and the customer notified."
        }
        confirmLabel={confirm === "cancel" ? "Cancel order" : "Confirm"}
        danger={confirm === "cancel"}
        loading={update.isPending || delivered.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={confirmAction}
      />
    </>
  );
}
