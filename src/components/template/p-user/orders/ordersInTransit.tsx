"use client";

import { useState } from "react";
import Image from "next/image";
import { LuCheck, LuPackageCheck, LuTruck } from "react-icons/lu";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import { useConfirmDelivery } from "@/services/client/panel";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";
import { formatDate } from "@/utils/format";
import { autoCompleteDate, shortId } from "@/utils/panelView";
import type { OrderListItem } from "@/types";

const STEPS = ["Ordered", "Prepared", "Shipped", "Delivered"] as const;
const CURRENT_STEP = 2; // every order here is shipped

function Steps({ order }: { order: OrderListItem }) {
  const dates = [order.createdAt, null, order.shippedAt, order.expectedDeliveryAt];
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label="Order progress">
      {STEPS.map((label, index) => {
        const done = index <= CURRENT_STEP;
        const current = index === CURRENT_STEP;
        return (
          <li key={label} className="min-w-0" aria-current={current ? "step" : undefined}>
            <div className={`h-1.5 rounded-full ${done ? "bg-sage-500" : "bg-gray-200 dark:bg-white/10"}`} />
            <p
              className={`mt-1.5 truncate text-xs ${
                current
                  ? "font-semibold text-sage-700 dark:text-sage-300"
                  : done
                    ? "text-gray-800 dark:text-gray-300"
                    : "text-gray-600 dark:text-gray-500"
              }`}
            >
              {label}
            </p>
            {dates[index] && (
              <p className="truncate text-[11px] text-gray-600 tabular-nums dark:text-gray-500">
                {index === 3 ? "Expected " : ""}
                {formatDate(dates[index])}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function OrdersInTransit({ orders }: { orders: OrderListItem[] }) {
  const [confirming, setConfirming] = useState<OrderListItem | null>(null);
  const confirm = useConfirmDelivery({ onDone: () => setConfirming(null) });

  if (!orders.length) return null;

  return (
    <section className="card mb-6 overflow-hidden" aria-labelledby="in-transit-title">
      <div className="card-header">
        <div>
          <h2 id="in-transit-title" className="card-title flex items-center gap-2">
            <LuTruck className="size-5 text-sage-600 dark:text-sage-300" />
            On the way to you
          </h2>
          <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">
            Let us know when {orders.length === 1 ? "it arrives" : "they arrive"}.
          </p>
        </div>
      </div>

      <ul className="divide-y divide-gray-200 dark:divide-white/5">
        {orders.map((order) => {
          const waitingForCash = order.paymentMethod === "cash" && order.isDelivered;
          const autoAt = order.paymentStatus === "paid" ? autoCompleteDate(order) : null;
          const images = order.items.slice(0, 3);
          return (
            <li key={String(order._id)} className="grid gap-4 px-4 py-5 sm:px-5 lg:grid-cols-[1fr_16rem] lg:items-center">
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <div className="flex -space-x-2">
                    {images.map((item) => (
                      <Image
                        key={String(item._id)}
                        src={item.productSnapshot?.image || PLACEHOLDER_IMAGE}
                        alt=""
                        width={36}
                        height={36}
                        className="size-9 rounded-full bg-gray-100 object-cover ring-2 ring-white dark:bg-white/5 dark:ring-ink-900"
                      />
                    ))}
                  </div>
                  <p className="text-sm">
                    <span className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {shortId(order._id)}
                    </span>
                    {order.trackingCode && (
                      <span className="ml-2 text-xs text-gray-700 dark:text-gray-400">
                        Tracking code{" "}
                        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-900 dark:bg-white/5 dark:text-gray-100">
                          {order.trackingCode}
                        </code>
                      </span>
                    )}
                  </p>
                </div>
                <Steps order={order} />
              </div>

              <div className="flex flex-col gap-1.5 lg:items-end lg:text-right">
                {waitingForCash ? (
                  <p className="flex items-center gap-1.5 text-sm text-gray-700 lg:justify-end dark:text-gray-400">
                    <LuCheck className="size-4 text-sage-600" /> You confirmed it arrived. Waiting for the store to
                    confirm your cash payment.
                  </p>
                ) : (
                  <>
                    <button type="button" onClick={() => setConfirming(order)} className="btn btn-primary">
                      <LuPackageCheck className="size-4" /> I received it
                    </button>
                    {autoAt && (
                      <span className="text-[11px] text-gray-600 dark:text-gray-500">
                        Completes automatically on {formatDate(autoAt)}
                      </span>
                    )}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={Boolean(confirming)}
        title="Did you receive this order?"
        description={
          confirming
            ? confirming.paymentMethod === "cash" && confirming.paymentStatus !== "paid"
              ? `Order ${shortId(confirming._id)} is marked as received. It completes once the store confirms your cash payment.`
              : `Order ${shortId(confirming._id)} will be marked as completed.`
            : undefined
        }
        confirmLabel="Yes, I received it"
        loading={confirm.isPending}
        onClose={() => setConfirming(null)}
        onConfirm={() => confirming && confirm.mutate(String(confirming._id))}
      />
    </section>
  );
}
