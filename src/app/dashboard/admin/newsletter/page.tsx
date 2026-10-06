import PageHeader from "@/components/modules/panel/pageHeader";
import SubscribersTable from "@/components/template/p-admin/newsletter/subscribersTable";
import newsletterService from "@/services/server/admin/newsletter";
import { adminListParams, filtersKey, readAdminFilters } from "@/utils/adminFilters";
import { requireAdmin } from "@/utils/auth/panelUser";
import { toInitialPage } from "@/utils/initialPage";
import type { Metadata } from "next";
import type { NewsletterSubscriber, PageProps, Pagination } from "@/types";

export const metadata: Metadata = { title: "Newsletter" };

const LIMIT = 50;

export default async function AdminNewsletterPage({ searchParams }: PageProps) {
  await requireAdmin();
  const filters = readAdminFilters(await searchParams, [] as string[]);
  const params = adminListParams.newsletter(LIMIT, filters);

  const [list, count] = await Promise.all([newsletterService.getAll(params), newsletterService.countAll()]);
  const result = list as { data: NewsletterSubscriber[]; pagination: Pagination };
  const total = Number(count) || 0;

  return (
    <>
      <PageHeader
        title="Newsletter"
        description={`${total.toLocaleString("en-US")} ${total === 1 ? "person has" : "people have"} signed up from the store footer.`}
      />
      <SubscribersTable
        key={filtersKey(filters)}
        filters={filters}
        params={params}
        initialPage={toInitialPage(result, LIMIT)}
        limit={LIMIT}
      />
    </>
  );
}
