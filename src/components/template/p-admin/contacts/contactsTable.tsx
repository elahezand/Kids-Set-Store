"use client";

import { useState } from "react";
import { LuMail } from "react-icons/lu";
import DateRangeFilter from "@/components/modules/panel/dateRangeFilter";
import ListCard from "@/components/modules/panel/listCard";
import SearchBox from "@/components/modules/panel/searchBox";
import StatusTabs from "@/components/modules/panel/statusTabs";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import EmptyState from "@/components/modules/ui/emptyState";
import ContactDialog from "@/components/template/p-admin/contacts/contactDialog";
import { useAdminContacts, useDeleteContact } from "@/services/client/admin";
import { CONTACT_TABS, contactState, timeAgo } from "@/utils/panelView";
import { filteredEmptyText, isFiltered } from "@/utils/adminFilters";
import type { AdminFilters, AdminListParams } from "@/utils/adminFilters";
import type { ContactMessage, ContactStatusFilter, Paginated } from "@/types";

interface ContactsTableProps {
  initialPage: Paginated<ContactMessage>;
  params: AdminListParams;
  filters: AdminFilters<ContactStatusFilter>;
  limit: number;
}

export default function ContactsTable({ initialPage, params, filters, limit }: ContactsTableProps) {
  const { items: messages, ...pager } = useAdminContacts(initialPage, params);
  const [opened, setOpened] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);
  const remove = useDeleteContact();

  return (
    <>
      <ListCard
        title="Inbox"
        toolbar={
          <>
            <StatusTabs tabs={CONTACT_TABS} value={filters.status} />
            <DateRangeFilter value={filters} label="Received" />
            <SearchBox placeholder="Name, email, phone or text..." />
          </>
        }
        isEmpty={messages.length === 0}
        empty={
          <EmptyState
            title={filters.status === "pending" && !isFiltered(filters) ? "Inbox zero" : "No messages"}
            description={
              filteredEmptyText(filters) ??
              (filters.status === "pending"
                ? "Every message has an answer."
                : "Messages sent from the Contact us page show up here.")
            }
            icon={LuMail}
          />
        }
        pager={{ ...pager, count: messages.length, limit, noun: "messages" }}
      >
        <ul className="divide-y divide-gray-200 dark:divide-white/5">
          {messages.map((message) => {
            const state = contactState(message.status);
            const unread = message.status === "pending";
            return (
              <li key={String(message._id)}>
                <button
                  type="button"
                  onClick={() => setOpened(message)}
                  className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none sm:px-5 dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${unread ? "bg-brand-500" : "bg-transparent"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span
                        className={`truncate text-sm text-gray-900 dark:text-gray-100 ${unread ? "font-semibold" : "font-medium"}`}
                      >
                        {message.name}
                        <span className="ml-2 font-normal text-gray-600 dark:text-gray-500">{message.email}</span>
                      </span>
                      <span className="shrink-0 text-xs text-gray-600 dark:text-gray-500">
                        {timeAgo(message.createdAt)}
                      </span>
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm text-gray-700 dark:text-gray-400">
                      {message.body}
                    </span>
                  </span>
                  <span className={`badge ${state.badge} hidden shrink-0 sm:inline-flex`}>{state.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </ListCard>

      {opened && (
        <ContactDialog
          message={opened}
          onClose={() => setOpened(null)}
          onDelete={() => {
            setDeleting(opened);
            setOpened(null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete the message from ${deleting?.name ?? "this sender"}?`}
        description="This can't be undone."
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(String(deleting._id), { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}
