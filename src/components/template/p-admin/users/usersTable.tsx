"use client";

import { useState } from "react";
import Image from "next/image";
import { LuBan, LuShieldCheck, LuShieldOff, LuTrash2, LuUndo2, LuUsers } from "react-icons/lu";
import DateRangeFilter from "@/components/modules/panel/dateRangeFilter";
import ListCard from "@/components/modules/panel/listCard";
import SearchBox from "@/components/modules/panel/searchBox";
import StatusTabs from "@/components/modules/panel/statusTabs";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import EmptyState from "@/components/modules/ui/emptyState";
import { useAdminUsers, useDeleteUser, useToggleUserBan, useToggleUserRole } from "@/services/client/admin";
import { DEFAULT_AVATAR } from "@/utils/constants";
import { formatDate, formatPrice } from "@/utils/format";
import { USER_ROLE_TABS } from "@/utils/panelView";
import { isAdmin } from "@/utils/role";
import { filteredEmptyText } from "@/utils/adminFilters";
import type { AdminFilters, AdminListParams } from "@/utils/adminFilters";
import type { AdminUser, Paginated, UserRoleFilter } from "@/types";

interface UsersTableProps {
  initialPage: Paginated<AdminUser>;
  params: AdminListParams;
  filters: AdminFilters<UserRoleFilter>;
  currentUserId: string;
  limit: number;
}

type Pending = { user: AdminUser; action: "role" | "ban" | "delete" };

export default function UsersTable({ initialPage, params, filters, currentUserId, limit }: UsersTableProps) {
  const { items: users, ...pager } = useAdminUsers(initialPage, params);
  const [pending, setPending] = useState<Pending | null>(null);

  const role = useToggleUserRole();
  const ban = useToggleUserBan();
  const remove = useDeleteUser();
  const busy = role.isPending || ban.isPending || remove.isPending;

  const run = () => {
    if (!pending) return;
    const id = String(pending.user._id);
    const done = { onSuccess: () => setPending(null) };
    if (pending.action === "role") role.mutate(id, done);
    if (pending.action === "ban") ban.mutate(id, done);
    if (pending.action === "delete") remove.mutate(id, done);
  };

  const identity = (user: AdminUser) => (
    <div className="flex min-w-0 items-center gap-3">
      <Image
        width={36}
        height={36}
        src={user.profilePicture || DEFAULT_AVATAR}
        alt=""
        className="size-9 shrink-0 rounded-full object-cover ring-2 ring-sage-100 dark:ring-white/10"
      />
      <div className="min-w-0 leading-tight">
        <p className="truncate font-medium text-gray-900 dark:text-gray-100">
          {user.username}
          {String(user._id) === currentUserId && (
            <span className="ml-1.5 text-xs font-normal text-gray-600">(you)</span>
          )}
        </p>
        <p className="truncate text-xs text-gray-700 tabular-nums dark:text-gray-500">{user.phone}</p>
      </div>
    </div>
  );

  const badges = (user: AdminUser) => (
    <div className="flex flex-wrap gap-1.5">
      <span className={`badge ${isAdmin(user) ? "badge-success" : "badge-neutral"}`}>
        {isAdmin(user) ? "Admin" : "Customer"}
      </span>
      {user.isBanned && <span className="badge badge-danger">Banned</span>}
    </div>
  );

  const actions = (user: AdminUser) => {
    if (String(user._id) === currentUserId) return null;
    const admin = isAdmin(user);
    return (
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setPending({ user, action: "role" })}
          className="btn btn-soft-primary btn-sm"
          title={admin ? "Remove admin role" : "Make admin"}
        >
          {admin ? <LuShieldOff className="size-3.5" /> : <LuShieldCheck className="size-3.5" />}
          {admin ? "Remove admin" : "Make admin"}
        </button>
        {!admin && (
          <>
            <button
              type="button"
              onClick={() => setPending({ user, action: "ban" })}
              className={`btn btn-sm btn-icon ${user.isBanned ? "btn-secondary" : "btn-soft-danger"}`}
              aria-label={user.isBanned ? `Unban ${user.username}` : `Ban ${user.username}`}
              title={user.isBanned ? "Unban" : "Ban"}
            >
              {user.isBanned ? <LuUndo2 className="size-3.5" /> : <LuBan className="size-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setPending({ user, action: "delete" })}
              className="btn btn-soft-danger btn-sm btn-icon"
              aria-label={`Delete ${user.username}`}
              title="Delete"
            >
              <LuTrash2 className="size-3.5" />
            </button>
          </>
        )}
      </div>
    );
  };

  const dialog = (() => {
    if (!pending) return { title: "", description: "", label: "" };
    const { user, action } = pending;
    if (action === "role")
      return isAdmin(user)
        ? {
            title: `Remove admin role from ${user.username}?`,
            description: "They lose access to this panel.",
            label: "Remove admin",
          }
        : {
            title: `Make ${user.username} an admin?`,
            description: "They will be able to manage the whole store.",
            label: "Make admin",
          };
    if (action === "ban")
      return user.isBanned
        ? { title: `Unban ${user.username}?`, description: "They can sign in again.", label: "Unban" }
        : {
            title: `Ban ${user.username}?`,
            description: "They are signed out of every device and can't sign in again.",
            label: "Ban",
          };
    return {
      title: `Delete ${user.username}?`,
      description: "The account is removed for good. Users with wallet balance can't be deleted.",
      label: "Delete",
    };
  })();

  return (
    <>
      <ListCard
        title="Accounts"
        toolbar={
          <>
            <StatusTabs tabs={USER_ROLE_TABS} value={filters.status} param="role" />
            <DateRangeFilter value={filters} label="Joined" />
            <SearchBox placeholder="Name, phone or email…" />
          </>
        }
        isEmpty={users.length === 0}
        empty={
          <EmptyState
            title="No users found"
            description={filteredEmptyText(filters) ?? "Accounts will show up here."}
            icon={LuUsers}
          />
        }
        pager={{ ...pager, count: users.length, limit, noun: "users" }}
      >
        <ul className="divide-y divide-gray-200 lg:hidden dark:divide-white/5">
          {users.map((user) => (
            <li key={String(user._id)} className="space-y-3 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                {identity(user)}
                {badges(user)}
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-500">
                Joined {formatDate(user.joinedAt ?? user.createdAt)} · {user.ordersCount ?? 0} orders
                {user.lastLoginAt && ` · last seen ${formatDate(user.lastLoginAt)}`}
              </p>
              {actions(user)}
            </li>
          ))}
        </ul>

        <div className="table-wrap hidden lg:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Last seen</th>
                <th>Orders</th>
                <th>Wallet</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={String(user._id)}>
                  <td className="max-w-[240px]">{identity(user)}</td>
                  <td>{badges(user)}</td>
                  <td className="whitespace-nowrap tabular-nums">{formatDate(user.joinedAt ?? user.createdAt)}</td>
                  <td className="whitespace-nowrap">
                    {user.lastLoginAt ? (
                      <>
                        <span className="tabular-nums">{formatDate(user.lastLoginAt)}</span>
                        {user.lastDevice && <span className="block text-xs text-gray-600">{user.lastDevice}</span>}
                      </>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="tabular-nums">{user.ordersCount ?? 0}</td>
                  <td className="whitespace-nowrap tabular-nums">{formatPrice(user.wallet?.balance)}</td>
                  <td>
                    <div className="flex justify-end">{actions(user)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ListCard>

      <ConfirmDialog
        open={Boolean(pending)}
        title={dialog.title}
        description={dialog.description}
        confirmLabel={dialog.label}
        danger={pending?.action === "delete" || (pending?.action === "ban" && !pending.user.isBanned)}
        loading={busy}
        onClose={() => setPending(null)}
        onConfirm={run}
      />
    </>
  );
}
