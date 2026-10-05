import { LuArrowDownLeft, LuArrowUpRight, LuWallet } from "react-icons/lu";
import { formatDate, formatPrice } from "@/utils/format";
import { shortId } from "@/utils/panelView";
import type { WalletSummary, WalletTransaction } from "@/types";

interface WalletCardProps {
  wallet: WalletSummary;
  transactions: WalletTransaction[];
}

export default function WalletCard({ wallet, transactions }: WalletCardProps) {
  return (
    <section className="card overflow-hidden">
      <div className="card-header">
        <div>
          <h2 className="card-title">Wallet</h2>
          <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">
            Refunds of cancelled orders land here. You can spend it at checkout.
          </p>
        </div>
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,16rem)_1fr]">
        <div className="rounded-2xl bg-gradient-to-br from-sage-500 to-sage-700 p-5 text-white shadow-card">
          <div className="flex items-center gap-2 text-sm text-white/85">
            <LuWallet className="size-4" /> Balance
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{formatPrice(wallet.balance)}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/85">
            <div>
              <dt>Refunded</dt>
              <dd className="mt-0.5 text-sm font-medium text-white tabular-nums">
                {formatPrice(wallet.totals.refunded)}
              </dd>
            </div>
            <div>
              <dt>Spent</dt>
              <dd className="mt-0.5 text-sm font-medium text-white tabular-nums">{formatPrice(wallet.totals.spent)}</dd>
            </div>
          </dl>
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold tracking-wide text-gray-600 uppercase">Latest activity</p>
          {transactions.length ? (
            <ul className="divide-y divide-gray-200 dark:divide-white/5">
              {transactions.map((tx) => {
                const refund = tx.type === "refund";
                const Icon = refund ? LuArrowDownLeft : LuArrowUpRight;
                return (
                  <li key={String(tx._id)} className="flex items-center gap-3 py-2.5">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                        refund
                          ? "bg-sage-50 text-sage-600 dark:bg-sage-500/10 dark:text-sage-300"
                          : "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-400"
                      }`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                        {refund ? "Refund" : "Paid for an order"}
                        {tx.order?._id && (
                          <span className="ml-1.5 font-mono text-xs text-gray-600">
                            {shortId(String(tx.order._id))}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-600">{formatDate(tx.createdAt)}</p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-semibold tabular-nums ${
                        refund ? "text-sage-700 dark:text-sage-300" : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {refund ? "+" : "−"}
                      {formatPrice(tx.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-6 text-sm text-gray-600">No wallet activity yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
