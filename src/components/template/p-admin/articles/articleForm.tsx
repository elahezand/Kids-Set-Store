"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import { LuImagePlus, LuSave, LuX } from "react-icons/lu";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import RichEditor from "@/components/template/p-admin/articles/richEditor";
import { imagesFormData, useSaveArticle, useUploadImages } from "@/services/client/admin";
import { articleFormSchema } from "@/validators/article";
import type { z } from "zod";
import type { AdminArticleDetail, ArticlePayload } from "@/types";

type FormInput = z.input<typeof articleFormSchema>;
type FormOutput = z.output<typeof articleFormSchema>;

export interface CategoryOptionItem {
  id: string;
  label: string;
}

interface ArticleFormProps {
  article?: AdminArticleDetail | null;
  categories: CategoryOptionItem[];
}

const COVER_MAX_BYTES = 5 * 1024 * 1024;

const categoryIdOf = (article?: AdminArticleDetail | null) =>
  article?.category && typeof article.category === "object" ? String(article.category._id ?? "") : "";

export default function ArticleForm({ article, categories }: ArticleFormProps) {
  const isEdit = Boolean(article?._id);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: article?.title ?? "",
      slug: article?.slug ?? "",
      excerpt: article?.excerpt ?? "",
      content: article?.content ?? "",
      category: categoryIdOf(article),
      cover: article?.cover ?? "",
      isPublished: article?.isPublished ?? false,
    },
  });

  const cover = watch("cover") as string | null | undefined;
  const upload = useUploadImages();
  const save = useSaveArticle(article?._id ? String(article._id) : undefined);
  const busy = upload.isPending || save.isPending;

  useEffect(
    () => () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    },
    [coverPreview]
  );

  const onCover = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    setCoverError("");
    if (!file) return;
    if (file.size > COVER_MAX_BYTES) return setCoverError("Cover must be smaller than 5 MB");
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setValue("cover", "", { shouldDirty: true });
  };

  const onSubmit = async (values: FormOutput) => {
    let coverPath = values.cover;
    if (coverFile) {
      const result = await upload.mutateAsync(imagesFormData([coverFile])).catch(() => null);
      if (!result) return;
      coverPath = result.data?.[0] ?? null;
    }

    const payload: ArticlePayload = { ...values, cover: coverPath ?? null, category: values.category ?? null };
    save.mutate(payload, {
      onSuccess: () => {
        setCoverFile(null);
        setCoverPreview(null);
        if (isEdit)
          reset({ ...values, cover: coverPath ?? "", slug: values.slug ?? "", category: values.category ?? "" });
      },
    });
  };

  const error = (name: keyof FormInput) =>
    errors[name]?.message ? <span className="field-error">{String(errors[name]?.message)}</span> : null;

  const shownCover = coverPreview || cover || null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid items-start gap-6 xl:grid-cols-3">
      <section className="card xl:col-span-2">
        <div className="card-body space-y-5">
          <div>
            <label htmlFor="article-title" className="label">
              Title
            </label>
            <input id="article-title" {...register("title")} className={`input ${errors.title ? "input-error" : ""}`} />
            {error("title")}
          </div>

          <div>
            <label htmlFor="article-excerpt" className="label">
              Short description
            </label>
            <textarea
              id="article-excerpt"
              rows={3}
              {...register("excerpt")}
              className={`input ${errors.excerpt ? "input-error" : ""}`}
            />
            {error("excerpt") ?? <span className="field-hint">Shown on article cards and in search results.</span>}
          </div>

          <div>
            <span className="label">Content</span>
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <RichEditor value={field.value ?? ""} onChange={field.onChange} invalid={Boolean(errors.content)} />
              )}
            />
            {error("content")}
          </div>
        </div>
      </section>

      <aside className="flex flex-col gap-6">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Publishing</h2>
          </div>
          <div className="card-body space-y-5">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Published</span>
                <span className="block text-xs text-gray-700 dark:text-gray-500">Off = saved as a draft</span>
              </span>
              <input type="checkbox" {...register("isPublished")} className="checkbox" />
            </label>

            <div>
              <label htmlFor="article-category" className="label">
                Category
              </label>
              <select id="article-category" {...register("category")} className="input">
                <option value="">No category</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              {error("category")}
            </div>

            <div>
              <label htmlFor="article-slug" className="label">
                URL slug
              </label>
              <input
                id="article-slug"
                {...register("slug")}
                placeholder="made from the title"
                className={`input ${errors.slug ? "input-error" : ""}`}
              />
              {error("slug")}
            </div>

            <button
              type="submit"
              disabled={busy || (isEdit && !isDirty && !coverFile)}
              className="btn btn-primary w-full"
            >
              <LuSave className="size-4" />
              {upload.isPending
                ? "Uploading cover..."
                : save.isPending
                  ? "Saving..."
                  : isEdit
                    ? "Save changes"
                    : "Create article"}
            </button>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Cover image</h2>
          </div>
          <div className="card-body">
            {shownCover ? (
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                <Image
                  src={shownCover}
                  alt=""
                  fill
                  sizes="400px"
                  unoptimized={Boolean(coverPreview)}
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute top-2 right-2 rounded-full bg-ink-950/60 p-1 text-white hover:bg-ink-950/80"
                  aria-label="Remove cover"
                >
                  <LuX className="size-4" />
                </button>
              </div>
            ) : (
              <label className="flex aspect-[16/10] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-600 transition-colors hover:border-brand-400 hover:text-brand-700 dark:border-white/15">
                <LuImagePlus className="size-6" />
                Choose an image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  onChange={onCover}
                  className="sr-only"
                />
              </label>
            )}
            {coverError ? (
              <span className="field-error">{coverError}</span>
            ) : (
              <span className="field-hint">JPG, PNG, WEBP or AVIF, up to 5 MB.</span>
            )}
          </div>
        </section>
      </aside>
    </form>
  );
}
