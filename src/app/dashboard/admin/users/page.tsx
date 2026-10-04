import PageHeader from "@/components/modules/panel/pageHeader";
import UsersTable from "@/components/template/p-admin/users/usersTable";
import userService from "@/services/server/admin/user";
import { getPanelSession } from "@/utils/auth/panelUser";
import { adminListParams, filtersKey, readAdminFilters } from "@/utils/adminFilters";
import { toInitialPage } from "@/utils/initialPage";
import { tabValues, USER_ROLE_TABS } from "@/utils/panelView";
import type { Metadata } from "next";
import type { AdminUser, PageProps, Pagination } from "@/types";

export const metadata: Metadata = { title: "Users" };

const LIMIT = 20;

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { user } = await getPanelSession();
  if (!user) return null;

  const filters = readAdminFilters(await searchParams, tabValues(USER_ROLE_TABS), "role");
  const params = adminListParams.users(LIMIT, filters);

  const result = (await userService.getAllUsers(params)) as { data: AdminUser[]; pagination: Pagination };

  return (
    <>
      <PageHeader title="Users" description="Customers and admins, their activity, roles and access." />
      <UsersTable
        key={filtersKey(filters)}
        filters={filters}
        params={params}
        currentUserId={String(user._id)}
        initialPage={toInitialPage(result, LIMIT)}
        limit={LIMIT}
      />
    </>
  );
}
