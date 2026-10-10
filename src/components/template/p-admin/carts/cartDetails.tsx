"use client";

import Image from "next/image";
import { LuTrash2 } from "react-icons/lu";
import Modal from "@/components/modules/ui/modal";
import { useAdminCart } from "@/services/client/admin";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";
import { formatPrice } from "@/utils/format";
import { cartState, personName, shortId, timeAgo } from "@/utils/panelView";
import type { AdminCart } from "@/types";

interface CartDetailsProps {
  cart: AdminCart;
  onDelete: () => void;
  onClose: () => void;
}

export default function CartDetails({ cart, onDelete, onClose }: CartDetailsProps) {
  const { data, isLoading, isError } = useAdminCart(String(cart._id));
  const detail = data?.data;
  const state = cartState(cart.status);
  const owner = typeof cart.user === "object" ? cart.user : null;

  return (
    <Modal
      size="lg"
      title={
        <span className="flex flex-wrap items-center gap-2">
          Cart {shortId(String(cart._id))}
          <span className={`badge ${state.badge}`}>{state.label}</span>
        </span>
      }
      description={`${personName(owner, "Unknown customer")}${owner?.phone ? ` · ${owner.phone}` : ""} · updated ${timeAgo(cart.updatedAt)}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onDelete} className="btn btn-soft-danger sm:mr-auto">
            <LuTrash2 className="size-4" /> Delete cart
          </button>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((key) => (
            <div key={key} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      ) : isError || !detail ? (
        <p className="text-sm text-gray-700 dark:text-gray-400">Could not load this cart.</p>
      ) : (
        <div className="space-y-5">
          {detail.items.length === 0 ? (
            <p className="text-sm text-gray-700 dark:text-gray-400">This cart is empty.</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-white/5">
              {detail.items.map((item, index) => {
                const attributes = item.variantSnapshot?.attributes
                  ? Object.values(item.variantSnapshot.attributes).join(" / ")
                  : "";
                return (
                  <li
                    key={`${item.productId?._id}-${item.variantId ?? index}`}
                    className="flex items-center gap-3 py-3"
                  >
                    <Image
                      src={item.productId?.images?.[0] || PLACEHOLDER_IMAGE}
                      alt=""
                      width={48}
                      height={48}
                      className="size-12 shrink-0 rounded-lg bg-gray-100 object-cover dark:bg-white/5"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.productId?.title ?? "Removed product"}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-500">
                        {attributes ? `${attributes} · ` : ""}
                        {item.quantity} × {formatPrice(item.finalPrice)}
                      </p>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap text-gray-900 tabular-nums dark:text-gray-100">
                      {formatPrice(item.finalPrice * item.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {detail.removedItems.length > 0 && (
            <p className="rounded-lg bg-sun-50 px-3 py-2 text-xs text-sun-800 dark:bg-sun-500/10 dark:text-sun-300">
              {detail.removedItems.length} item{detail.removedItems.length === 1 ? " is" : "s are"} no longer available
              (out of stock or hidden) and would be dropped at checkout.
            </p>
          )}

          <dl className="space-y-1.5 rounded-xl bg-gray-50 p-4 text-sm dark:bg-white/5">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-700 dark:text-gray-400">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(detail.pricing.subtotal)}</dd>
            </div>
            {detail.pricing.discount > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-700 dark:text-gray-400">
                  Discount{detail.coupon ? ` (${detail.coupon.code})` : ""}
                </dt>
                <dd className="text-success-700 tabular-nums dark:text-success-300">
                  −{formatPrice(detail.pricing.discount)}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-gray-700 dark:text-gray-400">Shipping</dt>
              <dd className="tabular-nums">{formatPrice(detail.pricing.shippingCost)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-gray-200 pt-1.5 font-semibold dark:border-white/10">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(detail.pricing.total)}</dd>
            </div>
          </dl>
        </div>
      )}
    </Modal>
  );
}
