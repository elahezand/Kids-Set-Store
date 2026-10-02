"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { profileValidationSchema } from "@/validators/user";
import { useUpdateProfile } from "@/services/client/panel";
import { DEFAULT_AVATAR } from "@/utils/panelView";
import { roleLabel } from "@/utils/role";
import type { SessionUser } from "@/types";

type ProfileInput = z.input<typeof profileValidationSchema>;
type ProfileOutput = z.output<typeof profileValidationSchema>;

interface ProfileFormProps {
  userData: SessionUser | null;
}

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

// Account details form — shared by admin "detail-account" and user "detail-profile"
export default function ProfileForm({ userData }: ProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileInput, unknown, ProfileOutput>({
    resolver: zodResolver(profileValidationSchema),
    defaultValues: {
      username: userData?.username ?? "",
      email: userData?.email ?? "",
      phone: userData?.phone ?? "",
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useUpdateProfile({
    onSaved: () => {
      // keep the saved values as the new defaults, empty the password fields
      reset((values) => ({ ...values, password: "", newPassword: "", confirmPassword: "" }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPreview(null);
    },
  });

  // free the preview blob url
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAvatarError("");
    if (!file) {
      setPreview(null);
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      event.target.value = "";
      setAvatarError("Image must be smaller than 2 MB");
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = (values: ProfileOutput) => {
    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") data.append(key, String(value));
    });
    const avatar = fileInputRef.current?.files?.[0];
    if (avatar) data.append("avatar", avatar);
    mutate(data);
  };

  const field = (name: FieldPath<ProfileInput>, label: string, type = "text", autoComplete?: string) => {
    const error = errors[name]?.message;
    return (
      <div>
        <label htmlFor={name} className="label">
          {label}
        </label>
        <input
          id={name}
          type={type}
          autoComplete={autoComplete}
          {...register(name)}
          className={`input ${error ? "input-error" : ""}`}
        />
        {error && <span className="field-error">{String(error)}</span>}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6 lg:grid-cols-3">
      <section className="card p-5 text-center sm:p-6 lg:col-span-1 lg:self-start">
        <Image
          width={112}
          height={112}
          src={preview || userData?.profilePicture || DEFAULT_AVATAR}
          alt=""
          unoptimized={Boolean(preview)}
          className="mx-auto size-24 rounded-full object-cover ring-4 ring-sage-100 sm:size-28 dark:ring-white/10"
        />
        <p className="mt-4 truncate font-semibold text-gray-900 dark:text-gray-100">{userData?.username}</p>
        <p className="truncate text-sm text-gray-700 dark:text-gray-500">{userData?.email || userData?.phone}</p>
        <span className="badge badge-success mt-3">{roleLabel(userData?.role)}</span>
        <div className="mt-6 text-left">
          <label htmlFor="avatar" className="label">
            Profile picture
          </label>
          <input
            id="avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            ref={fileInputRef}
            onChange={onAvatarChange}
            className="input"
          />
          {avatarError ? (
            <span className="field-error">{avatarError}</span>
          ) : (
            <span className="field-hint">JPG, PNG or WEBP, up to 2 MB. Square images look best.</span>
          )}
        </div>
      </section>

      <div className="min-w-0 space-y-6 lg:col-span-2">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Personal information</h2>
          </div>
          <div className="card-body grid gap-5 sm:grid-cols-2">
            {field("username", "Username", "text", "name")}
            {field("email", "Email (optional)", "email", "email")}
            {field("phone", "Phone", "tel", "tel")}
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Change password</h2>
              <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">
                Leave empty to keep your current password. If you only sign in with an SMS code, skip
                &quot;Current password&quot;.
              </p>
            </div>
          </div>
          <div className="card-body grid gap-5 md:grid-cols-3">
            {field("password", "Current password", "password", "current-password")}
            {field("newPassword", "New password", "password", "new-password")}
            {field("confirmPassword", "Confirm password", "password", "new-password")}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || (!isDirty && !preview)}
            className="btn btn-primary btn-lg w-full sm:w-auto"
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
