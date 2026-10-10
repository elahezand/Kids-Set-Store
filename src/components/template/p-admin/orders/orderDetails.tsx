"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import { LuBanknote, LuCircleCheck, LuClock, LuTruck, LuX } from "react-icons/lu";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import Modal from "@/components/modules/ui/modal";
import { useMarkOrderDelivered, useShipOrder, useUpdateOrder } from "@/services/client/admin";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";
import { formatDate, formatPrice } from "@/utils/format";
import {
  AUTO_COMPLETE_AFTER_ETA_DAYS,
  AUTO_COMPLETE_DAYS,
  autoCompleteDate,
  ORDER_STATUS,
  ORDER_STATUS_MOVES,
  canCancelOrder,
  cashReceivedText,
  paymentState,
  personName,
  shortId,
} from "@/utils/panelView";
import type { AdminOrder, AdminOrderItem } from "@/types";

interface OrderDetailsProps {
  order: AdminOrder;
  onClose: () => void;
}

const attributesText = (item: AdminOrderItem) =>
  Object.entries(item.variantSnapshot?.attributes ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");

type ShipValues = { trackingCode: string; estimatedDeliveryAt?: string };

const readShipForm = (event: FormEvent<HTMLFormElement>): ShipValues => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  return {
    trackingCode: String(data.get("trackingCode") || "").trim(),
    estimatedDeliveryAt: String(data.get("estimatedDeliveryAt") || "") || undefined,
  };
};

export default function OrderDetails({ order, onClose }: OrderDetailsProps) {
  const [confirm, setConfirm] = useState<"cancel" | "cashComplete" | "complete" | null>(null);
  const [shippingOrder, setShippingOrder] = useState(false);

  const update = useUpdateOrder({ onDone: () => setConfirm(null) });
  const delivered = useMarkOrderDelivered({ onDone: () => setConfirm(null) });
  const shipAll = useShipOrder({ onDone: () => setShippingOrder(false) });

  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.created;
  const payment = paymentState(order);
  const moves = ORDER_STATUS_MOVES[order.status] ?? [];
  const canCancel = canCancelOrder(order);
  const isCash = order.paymentMethod === "cash";
  const canShip = order.status === "processing";
  const awaitingCash = order.status === "shipped" && isCash && order.paymentStatus === "pending";
  const autoCompletes = order.status === "shipped" && order.paymentStatus === "paid";
  const autoCompleteAt = autoCompletes ? autoCompleteDate(order) : null;
  const dueAt = awaitingCash ? autoCompleteDate(order) : null;
  const user = order.user && typeof order.user === "object" ? order.user : null;
  const address = order.shippingAddress;
  const id = String(order._id);

  const onShipOrder = (event: FormEvent<HTMLFormElement>) => shipAll.mutate({ orderId: id, ...readShipForm(event) });

  const confirmAction = () => {
    if (confirm === "cancel") update.mutate({ id, status: "cancelled" });
    if (confirm === "cashComplete" || confirm === "complete") delivered.mutate(id);
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
                const itemId = String(item._id);
                return (
                  <li key={itemId} className="p-3">
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
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {order.shippedAt && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-gray-200 p-4 text-sm dark:border-white/10">
              <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                <LuTruck className="size-4 text-sage-600" /> Shipped
                {` on ${formatDate(order.shippedAt)}`}
              </span>
              {order.trackingCode && (
                <span className="text-gray-700 dark:text-gray-400">
                  Tracking <span className="font-mono">{order.trackingCode}</span>
                </span>
              )}
              {order.expectedDeliveryAt && (
                <span className="text-gray-700 dark:text-gray-400">
                  Arrives ~{formatDate(order.expectedDeliveryAt)}
                </span>
              )}
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
                ? `Cancelled - ${formatPrice(order.refundAmount)} was refunded to the customer's wallet${
                    order.refundedAt ? ` on ${formatDate(order.refundedAt)}` : ""
                  }.`
                : "Cancelled - nothing was paid, so there was nothing to refund."}
            </p>
          )}

          {order.status === "created" && (
            <p className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-700 dark:bg-white/5 dark:text-gray-400">
              <LuClock className="size-4 shrink-0" /> Waiting for the payment - it can be shipped once it is processing.
            </p>
          )}

          {autoCompletes && (
            <p className="flex items-center gap-2 rounded-xl bg-sage-50 p-3 text-sm text-sage-800 dark:bg-sage-500/10 dark:text-sage-300">
              <LuClock className="size-4 shrink-0" />
              Paid online - completes when the customer confirms delivery
              {autoCompleteAt ? `, or by itself on ${formatDate(autoCompleteAt)}` : ""} (
              {order.expectedDeliveryAt
                ? `${AUTO_COMPLETE_AFTER_ETA_DAYS} days after the expected delivery`
                : `${AUTO_COMPLETE_DAYS} days after shipping`}
              ).
            </p>
          )}

          {awaitingCash && (
            <p
              className={`flex items-center gap-2 rounded-xl p-3 text-sm ${
                order.isCashOverdue
                  ? "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-300"
                  : "bg-peach-50 text-peach-700 dark:bg-peach-500/10 dark:text-peach-300"
              }`}
            >
              <LuBanknote className="size-4 shrink-0" />
              {order.isCashOverdue
                ? `Cash overdue${dueAt ? ` since ${formatDate(dueAt)}` : ""} - it should have arrived and is still unpaid.`
                : `Cash on delivery${
                    order.isDelivered
                      ? ` - the customer confirmed receipt${order.deliveredAt ? ` on ${formatDate(order.deliveredAt)}` : ""}`
                      : ""
                  }. Press "Cash received" once the courier has handed over the money${
                    dueAt ? ` (flagged overdue after ${formatDate(dueAt)})` : ""
                  }.`}
            </p>
          )}

          {shippingOrder && (
            <ShipForm
              onSubmit={onShipOrder}
              onCancel={() => setShippingOrder(false)}
              pending={shipAll.isPending}
              label="Ship order"
              hint="All items ship together with this tracking code, and the customer is notified."
            />
          )}

          {(canCancel || canShip || awaitingCash || (autoCompletes && moves.includes("completed"))) && (
            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end dark:border-white/10">
              {canCancel && (
                <button type="button" onClick={() => setConfirm("cancel")} className="btn btn-soft-danger">
                  <LuX className="size-4" /> Cancel order
                </button>
              )}
              {canShip && !shippingOrder && (
                <button type="button" onClick={() => setShippingOrder(true)} className="btn btn-primary">
                  <LuTruck className="size-4" /> Ship order
                </button>
              )}
              {awaitingCash && (
                <button type="button" onClick={() => setConfirm("cashComplete")} className="btn btn-primary">
                  <LuBanknote className="size-4" /> Cash received · complete
                </button>
              )}
              {autoCompletes && moves.includes("completed") && (
                <button type="button" onClick={() => setConfirm("complete")} className="btn btn-secondary">
                  <LuCircleCheck className="size-4" /> Mark delivered now
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
            : confirm === "cashComplete"
              ? "Cash received?"
              : "Mark this order as delivered?"
        }
        description={
          confirm === "cancel"
            ? "Reserved stock goes back to the store and anything already paid is refunded to the customer's wallet. This can't be undone."
            : confirm === "cashComplete"
              ? cashReceivedText(order)
              : "The order is completed now instead of waiting for the customer, who is notified."
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

interface ShipFormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  pending: boolean;
  label: string;
  hint?: string;
}

function ShipForm({ onSubmit, onCancel, pending, label, hint }: ShipFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-2 rounded-xl bg-gray-50 p-3 dark:bg-white/5">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          name="trackingCode"
          required
          minLength={3}
          maxLength={60}
          placeholder="Tracking code"
          aria-label="Tracking code"
          className="input py-2"
          autoFocus
        />
        <input
          name="estimatedDeliveryAt"
          type="date"
          aria-label="Estimated delivery"
          title="Estimated delivery (optional)"
          className="input py-2"
        />
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="btn btn-primary btn-sm flex-1">
            <LuTruck className="size-3.5" /> {pending ? "Saving..." : "Mark shipped"}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm btn-icon" aria-label="Cancel">
            <LuX className="size-4" />
          </button>
        </div>
      </div>
      {hint && <p className="text-xs text-gray-600">{hint}</p>}
    </form>
  );
}
