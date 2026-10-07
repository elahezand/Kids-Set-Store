"use client";

import { LuCopy, LuDownload, LuSend } from "react-icons/lu";
import { toast } from "sonner";
import DateRangeFilter from "@/components/modules/panel/dateRangeFilter";
import ListCard from "@/components/modules/panel/listCard";
import SearchBox from "@/components/modules/panel/searchBox";
import EmptyState from "@/components/modules/ui/emptyState";
import { useAdminNewsletter } from "@/services/client/admin";
import { formatDate } from "@/utils/format";
import { filteredEmptyText } from "@/utils/adminFilters";
import type { AdminFilters, AdminListParams } from "@/utils/adminFilters";
import type { NewsletterSubscriber, Paginated } from "@/types";

interface SubscribersTableProps {
  initialPage: Paginated<NewsletterSubscriber>;
  params: AdminListParams;
  filters: AdminFilters<string>;
  limit: number;
}

const downloadCsv = (rows: NewsletterSubscriber[]) => {
  const lines = ["email,subscribed_at", ...rows.map((row) => `${row.email},${row.createdAt ?? ""}`)];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function SubscribersTable({ initialPage, params, filters, limit }: SubscribersTableProps) {
  const { items: subscribers, ...pager } = useAdminNewsletter(initialPage, params);
  const loadedAll = !pager.hasNextPage;
  const scope = loadedAll ? "all" : `the ${subscribers.length} loaded`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(subscribers.map((row) => row.email).join(", "));
      toast.success(`Copied ${subscribers.length} emails`);
    } catch {
      toast.error("Your browser blocked the clipboard");
    }
  };

  return (
    <ListCard
      title="Subscribers"
      toolbar={
        <>
          <DateRangeFilter value={filters} label="Signed up" />
          <SearchBox placeholder="Search emails…" />
          <button
            type="button"
            onClick={copy}
            disabled={!subscribers.length}
            className="btn btn-secondary btn-sm"
            title={`Copy ${scope} emails, comma separated`}
          >
            <LuCopy className="size-4" /> Copy
          </button>
          <button
            type="button"
            onClick={() => downloadCsv(subscribers)}
            disabled={!subscribers.length}
            className="btn btn-secondary btn-sm"
            title={`Download ${scope} rows as CSV`}
          >
            <LuDownload className="size-4" /> CSV
          </button>
        </>
      }
      isEmpty={subscribers.length === 0}
      empty={
        <EmptyState
          title="No subscribers"
          description={filteredEmptyText(filters) ?? "Emails from the footer signup form show up here."}
          icon={LuSend}
        />
      }
      pager={{ ...pager, count: subscribers.length, limit, noun: "subscribers" }}
    >
      {!loadedAll && (
        <p className="border-b border-gray-200 px-4 py-2 text-xs text-gray-700 sm:px-5 dark:border-white/5 dark:text-gray-500">
          Copy and CSV include the rows loaded below. Load more to include everyone.
        </p>
      )}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th className="text-right">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={String(subscriber._id)}>
                <td>
                  <a
                    href={`mailto:${subscriber.email}`}
                    className="font-medium text-gray-900 hover:text-sage-700 hover:underline dark:text-gray-100 dark:hover:text-sage-300"
                  >
                    {subscriber.email}
                  </a>
                </td>
                <td className="text-right text-xs whitespace-nowrap text-gray-700 dark:text-gray-400">
                  {formatDate(subscriber.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListCard>
  );
}
