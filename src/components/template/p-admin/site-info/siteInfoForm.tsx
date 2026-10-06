"use client";

import { type ChangeEvent, useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LuImage, LuSave, LuUpload } from "react-icons/lu";
import { imagesFormData, useSaveSiteInfo, useUploadImages } from "@/services/client/admin";
import type { SiteInfo } from "@/types";

const social = z.string().trim().max(300, "At most 300 characters");

/* mirrors validators/info.js (the server checks again) */
const schema = z.object({
  phone: z.string().trim().min(5, "Phone is required").max(20, "At most 20 characters"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  logo: z.string().trim().min(1, "Upload a logo or paste its address"),
  address: z.string().trim().max(300, "At most 300 characters"),
  socials: z.object({ instagram: social, telegram: social, linkedin: social }),
});

type FormValues = z.infer<typeof schema>;

const SOCIALS = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/setkids" },
  { key: "telegram", label: "Telegram", placeholder: "https://t.me/setkids" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/setkids" },
] as const;

export default function SiteInfoForm({ info }: { info: SiteInfo | null }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const upload = useUploadImages();
  const save = useSaveSiteInfo();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: info?.phone ?? "",
      email: info?.email ?? "",
      logo: info?.logo ?? "",
      address: info?.address ?? "",
      socials: {
        instagram: info?.socials?.instagram ?? "",
        telegram: info?.socials?.telegram ?? "",
        linkedin: info?.socials?.linkedin ?? "",
      },
    },
  });

  const logo = watch("logo");
  const logoPreview = /^(\/|https?:\/\/)/.test(logo?.trim() ?? "") ? logo.trim() : null;

  const onLogoPicked = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const result = await upload.mutateAsync(imagesFormData([file])).catch(() => null);
    const path = result?.data?.[0];
    if (path) setValue("logo", path, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = (values: FormValues) => save.mutate(values, { onSuccess: () => reset(values) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Contact details</h2>
              <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">Shown in the footer and on Contact us.</p>
            </div>
          </div>
          <div className="card-body grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="info-phone" className="label">
                Phone
              </label>
              <input
                id="info-phone"
                type="tel"
                {...register("phone")}
                placeholder="021 1234 5678"
                className={`input tabular-nums ${errors.phone ? "input-error" : ""}`}
              />
              {errors.phone && <span className="field-error">{errors.phone.message}</span>}
            </div>
            <div>
              <label htmlFor="info-email" className="label">
                Email
              </label>
              <input
                id="info-email"
                type="email"
                {...register("email")}
                placeholder="hello@setkids.com"
                className={`input ${errors.email ? "input-error" : ""}`}
              />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="info-address" className="label">
                Address
              </label>
              <textarea
                id="info-address"
                rows={3}
                {...register("address")}
                className={`input resize-y ${errors.address ? "input-error" : ""}`}
              />
              {errors.address && <span className="field-error">{errors.address.message}</span>}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Social links</h2>
              <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">Leave one empty to hide its icon.</p>
            </div>
          </div>
          <div className="card-body grid gap-5">
            {SOCIALS.map((item) => (
              <div key={item.key}>
                <label htmlFor={`info-${item.key}`} className="label">
                  {item.label}
                </label>
                <input
                  id={`info-${item.key}`}
                  type="url"
                  {...register(`socials.${item.key}`)}
                  placeholder={item.placeholder}
                  className={`input ${errors.socials?.[item.key] ? "input-error" : ""}`}
                />
                {errors.socials?.[item.key] && (
                  <span className="field-error">{errors.socials[item.key]?.message}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Logo</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex aspect-[3/2] items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-4 dark:bg-white/5">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Store logo"
                  width={240}
                  height={160}
                  unoptimized
                  className="max-h-full w-auto object-contain"
                />
              ) : (
                <LuImage className="size-10 text-gray-400" aria-hidden="true" />
              )}
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={onLogoPicked}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={upload.isPending}
              className="btn btn-secondary w-full"
            >
              <LuUpload className="size-4" /> {upload.isPending ? "Uploading…" : logo ? "Replace logo" : "Upload logo"}
            </button>
            <div>
              <label htmlFor="info-logo" className="label">
                Or image address
              </label>
              <input
                id="info-logo"
                {...register("logo")}
                placeholder="/uploads/logo.png"
                className={`input text-sm ${errors.logo ? "input-error" : ""}`}
              />
              {errors.logo ? (
                <span className="field-error">{errors.logo.message}</span>
              ) : (
                <span className="field-hint">PNG, JPG, WEBP or AVIF, up to 5 MB.</span>
              )}
            </div>
          </div>
        </section>

        <div className="xl:sticky xl:top-20">
          <button type="submit" disabled={save.isPending || upload.isPending || !isDirty} className="btn btn-primary w-full">
            <LuSave className="size-4" /> {save.isPending ? "Saving…" : isDirty ? "Save changes" : "Saved"}
          </button>
          {!info && (
            <p className="mt-2 text-center text-xs text-gray-700 dark:text-gray-500">
              Nothing is saved yet. The store footer stays empty until you save.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
