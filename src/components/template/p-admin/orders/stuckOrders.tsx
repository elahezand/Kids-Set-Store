"use client";

import { useState } from "react";
import Link from "next/link";
import { LuCircleCheck, LuClock, LuPlay, LuWrench } from "react-icons/lu";
import { toast } from "sonner";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import EmptyState from "@/components/modules/ui/emptyState";
import { useRepairOrder, useRunOrderSweeps } from "@/services/client/admin";
import { ROUTES } from "@/utils/constants";
import { formatDate, formatPrice } from "@/utils/format";
import { ORDER_STATUS, paymentState, personName, shortId } from "@/utils/panelView";
import type { AdminOrder, OrderSweepResult, OrderSweepStatus } from "@/types";

interface StuckOrdersProps {
  orders: AdminOrder[];
  status: OrderSweepStatus;
}

const resultText = (result: OrderSweepResult) => {
  const parts = [
    result.completed && `${result.completed} auto-completed`,
    result.finished && `${result.finished} stuck orders finished`,
    result.paid && `${result.paid} late payments confirmed`,
    result.cancelled && `${result.cancelled} unpaid orders cancelled`,
    result.overdueCash && `${result.overdueCash} overdue cash reminders sent`,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "Nothing needed doing";
};

export default function StuckOrders({ orders, status }: StuckOrdersProps) {
  const sweeps = useRunOrderSweeps();
  const repair = useRepairOrder();
  const [repairing, setRepairing] = useState<AdminOrder | null>(null);
  const [lastRun, setLastRun] = useState<OrderSweepResult | null>(null);

  const run = () =>
    sweeps.mutate(undefined, {
      onSuccess: (response) => {
        setLastRun(response.data);
        toast.success(resultText(response.data));
      },
    });

  const schedule = status.timerDisabled
    ? status.cronConfigured
      ? "The in-app timer is off (DISABLE_ORDER_SWEEPER). They run when your scheduler calls /api/cron/orders."
      : "The in-app timer is off and CRON_SECRET isn't set, so they only run when you press the button."
    : `They run every ${status.timerMinutes} minutes while the server process is up${
        status.cronConfigured ? ", and whenever your scheduler calls /api/cron/orders" : ""
      }. On serverless hosting the timer doesn't survive, so set CRON_SECRET and a cron job.`;

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Automatic order checks</h2>
            <p className="mt-0.5 max-w-2xl text-xs text-gray-700 dark:text-gray-500">{schedule}</p>
          </div>
          <button type="button" onClick={run} disabled={sweeps.isPending} className="btn btn-primary btn-sm">
            <LuPlay className="size-4" /> {sweeps.isPending ? "Running..." : "Run checks now"}
          </button>
        </div>
        <div className="card-body grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
            <p className="text-2xl font-semibold tabular-nums">{status.dueForCompletion}</p>
            <p className="mt-1 text-xs text-gray-700 dark:text-gray-400">
              Paid, shipped and past their delivery window. The next run marks them completed.
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
            <p className="text-2xl font-semibold tabular-nums">{status.overdueCash}</p>
            <p className="mt-1 text-xs text-gray-700 dark:text-gray-400">
              Cash on delivery, past due and unpaid. These never complete on their own.{" "}
              {status.overdueCash > 0 && (
                <Link
                  href={`${ROUTES.admin.orders}?status=overdue`}
                  className="text-brand-700 hover:underline dark:text-brand-300"
                >
                  Review them
                </Link>
              )}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
            <p className="text-2xl font-semibold tabular-nums">{orders.length}</p>
            <p className="mt-1 text-xs text-gray-700 dark:text-gray-400">
              Paid but stock was never reserved. Listed below.
            </p>
          </div>
          {lastRun && (
            <p className="flex items-center gap-2 text-sm text-success-700 sm:col-span-3 dark:text-success-300">
              <LuCircleCheck className="size-4 shrink-0" /> Last run: {resultText(lastRun)}.
            </p>
          )}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="card-header">
          <div>
            <h2 className="card-title">Stuck orders</h2>
            <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">
              The payment went through but the order didn&apos;t finish: stock wasn&apos;t reserved and the coupon
              wasn&apos;t counted. Repair finishes it.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <EmptyState title="Nothing is stuck" description="Every paid order finished normally." icon={LuCircleCheck} />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const payment = paymentState(order);
                  const state = ORDER_STATUS[order.status];
                  const user = typeof order.user === "object" ? order.user : null;
                  const unpaid = order.paymentMethod !== "cash" && order.paymentStatus !== "paid";
                  return (
                    <tr key={String(order._id)}>
                      <td>
                        <p className="font-mono text-xs font-semibold">{shortId(String(order._id))}</p>
                        <p className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-500">
                          <LuClock className="size-3" /> {formatDate(order.createdAt)}
                        </p>
                      </td>
                      <td>
                        <p className="font-medium">{personName(user)}</p>
                        {user?.phone && <p className="text-xs text-gray-600 tabular-nums">{user.phone}</p>}
                      </td>
                      <td className="whitespace-nowrap tabular-nums">{formatPrice(order.pricing?.total)}</td>
                      <td>
                        <span className={`badge ${payment.badge}`}>{payment.label}</span>
                        <p className="mt-1 text-xs text-gray-600 capitalize">{order.paymentMethod}</p>
                      </td>
                      <td>{state && <span className={`badge ${state.badge}`}>{state.label}</span>}</td>
                      <td>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setRepairing(order)}
                            disabled={unpaid}
                            className="btn btn-soft-primary btn-sm disabled:cursor-not-allowed disabled:opacity-40"
                            title={unpaid ? "Not paid yet, so there is nothing to finish" : "Finish this order"}
                          >
                            <LuWrench className="size-3.5" /> Repair
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(repairing)}
        title={`Repair order ${repairing ? shortId(String(repairing._id)) : ""}?`}
        description="Takes its items out of stock, counts its coupon and moves it to Processing. If an item has run out it still goes through (the server only logs it), so check that product afterwards."
        confirmLabel="Repair"
        loading={repair.isPending}
        onClose={() => setRepairing(null)}
        onConfirm={() => repairing && repair.mutate(String(repairing._id), { onSuccess: () => setRepairing(null) })}
      />
    </div>
  );
}
