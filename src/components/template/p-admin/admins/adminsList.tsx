"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuBell, LuMail, LuShieldOff, LuUserPlus } from "react-icons/lu";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import NotificationComposer from "../notifications/notificationComposer";
import Modal from "@/components/modules/ui/modal";
import { useToggleUserRole } from "@/services/client/admin";
import { DEFAULT_AVATAR, ROUTES } from "@/utils/constants";
import { formatDate } from "@/utils/format";
import type { AdminAccount } from "@/types";

interface AdminsListProps {
  admins: AdminAccount[];
  currentUserId: string;
}

export default function AdminsList({ admins, currentUserId }: AdminsListProps) {
  const [notifying, setNotifying] = useState<AdminAccount | null>(null);
  const [composer, setComposer] = useState({ sending: false, canSend: false });
  const [demoting, setDemoting] = useState<AdminAccount | null>(null);
  const role = useToggleUserRole();

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Link href={`${ROUTES.admin.users}?role=USER`} className="btn btn-secondary btn-sm">
          <LuUserPlus className="size-4" /> Make someone admin
        </Link>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {admins.map((admin) => {
          const self = admin._id === currentUserId;
          return (
            <li key={admin._id} className="card flex flex-col p-5">
              <div className="flex items-center gap-3">
                <Image
                  src={admin.profilePicture || DEFAULT_AVATAR}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 shrink-0 rounded-full object-cover ring-2 ring-sage-100 dark:ring-white/10"
                />
                <div className="min-w-0 leading-tight">
                  <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
                    {admin.username}
                    {self && <span className="ml-1.5 text-xs font-normal text-gray-600">(you)</span>}
                  </p>
                  <p className="truncate text-sm text-gray-700 tabular-nums dark:text-gray-500">{admin.phone}</p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-gray-700 dark:text-gray-500">
                {admin.email && (
                  <a href={`mailto:${admin.email}`} className="flex items-center gap-1.5 truncate hover:underline">
                    <LuMail className="size-3.5 shrink-0" /> {admin.email}
                  </a>
                )}
                {admin.createdAt && <p>Joined {formatDate(admin.createdAt)}</p>}
              </div>

              <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4 dark:border-white/10">
                {!self && (
                  <button type="button" onClick={() => setNotifying(admin)} className="btn btn-soft-primary btn-sm">
                    <LuBell className="size-3.5" /> Notify
                  </button>
                )}
                {!self && (
                  <button type="button" onClick={() => setDemoting(admin)} className="btn btn-ghost btn-sm ml-auto">
                    <LuShieldOff className="size-3.5" /> Remove admin
                  </button>
                )}
                {self && <p className="text-xs text-gray-600">You can&apos;t remove your own admin role.</p>}
              </div>
            </li>
          );
        })}
      </ul>

      {notifying && (
        <Modal
          title={`Notify ${notifying.username}`}
          onClose={() => setNotifying(null)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setNotifying(null)}
                className="btn btn-secondary"
                disabled={composer.sending}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="admin-notify"
                className="btn btn-primary"
                disabled={!composer.canSend || composer.sending}
              >
                {composer.sending ? "Sending…" : "Send"}
              </button>
            </>
          }
        >
          <NotificationComposer
            formId="admin-notify"
            admins={admins}
            currentUserId={currentUserId}
            initialRecipients={[notifying._id]}
            hideSubmit
            onStateChange={setComposer}
            onSent={() => setNotifying(null)}
          />
        </Modal>
      )}

      <ConfirmDialog
        open={Boolean(demoting)}
        title={`Remove ${demoting?.username ?? "this person"} as admin?`}
        description="They keep their customer account but lose access to this panel right away."
        confirmLabel="Remove admin"
        danger
        loading={role.isPending}
        onClose={() => setDemoting(null)}
        onConfirm={() => demoting && role.mutate(demoting._id, { onSuccess: () => setDemoting(null) })}
      />
    </>
  );
}
