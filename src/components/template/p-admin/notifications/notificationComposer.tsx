"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import { LuSend } from "react-icons/lu";
import { toast } from "sonner";
import { useSendNotification } from "@/services/client/admin";
import { DEFAULT_AVATAR } from "@/utils/constants";
import type { AdminAccount, Id } from "@/types";

interface NotificationComposerProps {
  admins: AdminAccount[];
  currentUserId: Id;
  initialRecipients?: Id[];
  formId?: string;
  hideSubmit?: boolean;
  onSent?: () => void;
  onStateChange?: (state: { sending: boolean; canSend: boolean }) => void;
}

const MAX = 500;

export default function NotificationComposer({
  admins,
  currentUserId,
  initialRecipients = [],
  formId = "notification-form",
  hideSubmit = false,
  onSent,
  onStateChange,
}: NotificationComposerProps) {
  const [recipients, setRecipients] = useState<Set<Id>>(new Set(initialRecipients));
  const [msg, setMsg] = useState("");
  const [link, setLink] = useState("");
  const [sending, setSending] = useState(false);
  const send = useSendNotification();

  const allSelected = admins.length > 0 && recipients.size === admins.length;
  const linkInvalid = link.trim() !== "" && !/^(\/|https?:\/\/)/.test(link.trim());
  const ready = recipients.size > 0 && msg.trim().length >= 3 && !linkInvalid;

  const report = (next: { sending?: boolean; ready?: boolean }) =>
    onStateChange?.({ sending: next.sending ?? sending, canSend: (next.ready ?? ready) && !(next.sending ?? sending) });

  const toggle = (id: Id) => {
    const next = new Set(recipients);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRecipients(next);
    report({ ready: next.size > 0 && msg.trim().length >= 3 && !linkInvalid });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ready || sending) return;
    setSending(true);
    report({ sending: true });

    const results = await Promise.allSettled(
      [...recipients].map((user) => send.mutateAsync({ user, msg: msg.trim(), link: link.trim() || null }))
    );
    const sent = results.filter((result) => result.status === "fulfilled").length;

    setSending(false);
    report({ sending: false });

    if (sent) {
      toast.success(sent === 1 ? "Notification sent" : `Notification sent to ${sent} admins`);
      setMsg("");
      setLink("");
      report({ sending: false, ready: false });
      onSent?.();
    }
  };

  return (
    <form id={formId} onSubmit={submit} noValidate className="space-y-5">
      <fieldset>
        <div className="mb-2 flex items-center justify-between gap-3">
          <legend className="label mb-0">Send to</legend>
          <button
            type="button"
            onClick={() => {
              const next = allSelected ? new Set<Id>() : new Set(admins.map((admin) => admin._id));
              setRecipients(next);
              report({ ready: next.size > 0 && msg.trim().length >= 3 && !linkInvalid });
            }}
            className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            {allSelected ? "Clear" : "All admins"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {admins.map((admin) => {
            const checked = recipients.has(admin._id);
            return (
              <label
                key={admin._id}
                className={`flex cursor-pointer items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${
                  checked
                    ? "border-brand-400 bg-brand-50 text-brand-800 dark:border-brand-500/50 dark:bg-brand-500/10 dark:text-brand-200"
                    : "border-gray-200 text-gray-800 hover:border-gray-300 dark:border-white/10 dark:text-gray-300"
                }`}
              >
                <input type="checkbox" checked={checked} onChange={() => toggle(admin._id)} className="sr-only" />
                <Image
                  src={admin.profilePicture || DEFAULT_AVATAR}
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 rounded-full object-cover"
                />
                {admin.username}
                {admin._id === currentUserId && <span className="text-xs opacity-70">(you)</span>}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${formId}-msg`} className="label">
          Message
        </label>
        <textarea
          id={`${formId}-msg`}
          rows={4}
          value={msg}
          onChange={(event) => {
            const value = event.target.value.slice(0, MAX);
            setMsg(value);
            report({ ready: recipients.size > 0 && value.trim().length >= 3 && !linkInvalid });
          }}
          placeholder="Stock count is on Friday. Please update the warehouse sheet before 5pm."
          className="input resize-y"
        />
        <span className="field-hint">{MAX - msg.length} characters left</span>
      </div>

      <div>
        <label htmlFor={`${formId}-link`} className="label">
          Link <span className="font-normal text-gray-600">(optional)</span>
        </label>
        <input
          id={`${formId}-link`}
          value={link}
          onChange={(event) => {
            const value = event.target.value;
            setLink(value);
            const invalid = value.trim() !== "" && !/^(\/|https?:\/\/)/.test(value.trim());
            report({ ready: recipients.size > 0 && msg.trim().length >= 3 && !invalid });
          }}
          placeholder="/dashboard/admin/orders"
          maxLength={300}
          className={`input ${linkInvalid ? "input-error" : ""}`}
        />
        {linkInvalid ? (
          <span className="field-error">Start with / for a page on this site, or with https://</span>
        ) : (
          <span className="field-hint">Opens when they click the notification.</span>
        )}
      </div>

      {!hideSubmit && (
        <div className="flex justify-end">
          <button type="submit" disabled={!ready || sending} className="btn btn-primary">
            <LuSend className="size-4" />
            {sending ? "Sending..." : recipients.size > 1 ? `Send to ${recipients.size} admins` : "Send notification"}
          </button>
        </div>
      )}
    </form>
  );
}
