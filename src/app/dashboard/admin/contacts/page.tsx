import PageHeader from "@/components/modules/panel/pageHeader";
import ContactsTable from "@/components/template/p-admin/contacts/contactsTable";
import contactService from "@/services/server/admin/contact";
import { adminListParams, filtersKey, readAdminFilters } from "@/utils/adminFilters";
import { requireAdmin } from "@/utils/auth/panelUser";
import { toInitialPage } from "@/utils/initialPage";
import { CONTACT_TABS, tabValues } from "@/utils/panelView";
import type { Metadata } from "next";
import type { ContactMessage, PageProps, Pagination } from "@/types";

export const metadata: Metadata = { title: "Messages" };

const LIMIT = 20;

export default async function AdminContactsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const filters = readAdminFilters(await searchParams, tabValues(CONTACT_TABS));
  const params = adminListParams.contacts(LIMIT, filters);

  const result = (await contactService.getContacts(params)) as {
    data: ContactMessage[];
    pagination: Pagination;
    meta: { unreadCount: number };
  };
  const unread = result.meta?.unreadCount ?? 0;

  return (
    <>
      <PageHeader
        title="Messages"
        description={
          unread
            ? `${unread} message${unread === 1 ? "" : "s"} from the Contact us page waiting for an answer.`
            : "Messages from the Contact us page. Answers are sent by email."
        }
      />
      <ContactsTable
        key={filtersKey(filters)}
        filters={filters}
        params={params}
        initialPage={toInitialPage(result, LIMIT)}
        limit={LIMIT}
      />
    </>
  );
}
