"use client";

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { LuImagePlus, LuSave, LuX } from "react-icons/lu";
import { type FieldErrors, type Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CategorySpecs from "@/components/template/p-admin/products/categorySpecs";
import VariantsEditor from "@/components/template/p-admin/products/variantsEditor";
import { imagesFormData, useCategoryFilters, useSaveProduct, useUploadImages } from "@/services/client/admin";
import { PRODUCT_STATUS } from "@/utils/panelView";
import {
  buildProductPayload,
  productToFormValues,
  type ProductFormOutput,
  type ProductFormValues,
  sizeErrors,
  specErrors,
  specFiltersOf,
  variantRulesOf,
} from "@/utils/productForm";
import { productFormSchema } from "@/validators/product";
import type { AdminProduct, CategoryFilter, CategoryNode, ProductStatus } from "@/types";

interface ProductFormProps {
  product?: AdminProduct | null;
  categories: CategoryNode[];
}

const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const levelsOf = (tree: CategoryNode[], path: string[]) => {
  const levels: CategoryNode[][] = [tree];
  path.forEach((id, index) => {
    const children = levels[index]?.find((node) => node.id === id)?.children ?? [];
    if (children.length) levels.push(children);
  });
  return levels;
};

const nodeAt = (tree: CategoryNode[], path: string[]) => {
  let level = tree;
  let node: CategoryNode | undefined;
  for (const id of path) {
    node = level.find((item) => item.id === id);
    if (!node) break;
    level = node.children ?? [];
  }
  return node;
};

const initialPath = (product?: AdminProduct | null) =>
  (product?.categoryPath ?? []).map((c) => String(typeof c === "object" ? c._id : c));

export default function ProductForm({ product, categories }: ProductFormProps) {
  const productId = product?._id ? String(product._id) : undefined;
  const isEdit = Boolean(productId);

  const [path, setPath] = useState<string[]>(() => initialPath(product));
  const [kept, setKept] = useState<string[]>(product?.images ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState("");
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const categoryRules = useRef<{ rules: ReturnType<typeof variantRulesOf>; specFilters: CategoryFilter[] }>({
    rules: new Map(),
    specFilters: [],
  });

  const resolver: Resolver<ProductFormValues, unknown, ProductFormOutput> = async (values, context, options) => {
    const zod = zodResolver(productFormSchema) as unknown as Resolver<ProductFormValues, unknown, ProductFormOutput>;
    const result = await zod(values, context, options);
    const errors = { ...(result.errors as FieldErrors<ProductFormValues>) } as Record<string, unknown>;
    const listError = errors.variants && !Array.isArray(errors.variants) ? errors.variants : null;
    const variantErrors = (Array.isArray(errors.variants) ? [...errors.variants] : []) as Array<
      Record<string, unknown> | undefined
    >;
    const specErrorMap = { ...((errors.specs as Record<string, unknown>) ?? {}) };
    const { rules, specFilters } = categoryRules.current;

    sizeErrors(values.variants, rules).forEach(({ index, message }) => {
      variantErrors[index] = { ...variantErrors[index], size: { type: "category", message } };
    });
    specErrors(values.specs ?? {}, specFilters).forEach(({ slug, message }) => {
      specErrorMap[slug] = { type: "category", message };
    });

    if (!listError && variantErrors.some(Boolean)) errors.variants = variantErrors;
    if (Object.keys(specErrorMap).length) errors.specs = specErrorMap;
    return Object.keys(errors).length ? { values: {}, errors: errors as never } : result;
  };

  const form = useForm<ProductFormValues, unknown, ProductFormOutput>({
    resolver,
    defaultValues: productToFormValues(product),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  const upload = useUploadImages();
  const save = useSaveProduct(productId);
  const busy = upload.isPending || save.isPending;
  const mediaChanged = files.length > 0 || kept.length !== (product?.images?.length ?? 0);
  const pathChanged = path.join() !== initialPath(product).join();

  const levels = levelsOf(categories, path);

  const category = nodeAt(categories, path.filter(Boolean));
  const categoryQuery = useCategoryFilters(category?.slug);
  const filters = category ? categoryQuery.data?.data?.filters : undefined;
  const rules = useMemo(() => variantRulesOf(filters ?? []), [filters]);
  const specFilters = useMemo(() => specFiltersOf(filters ?? []), [filters]);
  categoryRules.current = { rules, specFilters };

  const selectLevel = (level: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const next = path.slice(0, level);
    if (event.target.value) next[level] = event.target.value;
    setPath(next);
  };

  const onFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    setImageError("");

    const tooBig = picked.find((file) => file.size > MAX_IMAGE_BYTES);
    if (tooBig) return setImageError(`${tooBig.name} is larger than 5 MB`);
    if (kept.length + files.length + picked.length > MAX_IMAGES) return setImageError(`At most ${MAX_IMAGES} images`);

    setFiles((current) => [...current, ...picked]);
  };

  const onSubmit = async (values: ProductFormOutput) => {
    let uploaded: string[] = [];
    if (files.length) {
      const result = await upload.mutateAsync(imagesFormData(files)).catch(() => null);
      if (!result) return;
      uploaded = result.data ?? [];
    }

    const images = [...kept, ...uploaded];
    save.mutate(buildProductPayload(values, { categoryPath: path.filter(Boolean), images, specFilters }), {
      onSuccess: () => {
        if (!isEdit) return;
        setFiles([]);
        setKept(images);
        form.reset(form.getValues());
      },
    });
  };

  const error = (message?: unknown) => (message ? <span className="field-error">{String(message)}</span> : null);

  const imagesSection = (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Images</h2>
          <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">
            Up to {MAX_IMAGES} images, 5 MB each. The first one is the cover.
          </p>
        </div>
      </div>
      <div className="card-body">
        <div className="flex flex-wrap gap-3">
          {kept.map((src) => (
            <Thumb key={src} src={src} onRemove={() => setKept((list) => list.filter((item) => item !== src))} />
          ))}
          {previews.map((src, index) => (
            <Thumb key={src} src={src} isNew onRemove={() => setFiles((list) => list.filter((_, i) => i !== index))} />
          ))}
          {kept.length + files.length < MAX_IMAGES && (
            <label className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-xs text-gray-600 transition-colors hover:border-sage-400 hover:text-sage-700 dark:border-white/15">
              <LuImagePlus className="size-5" />
              Add images
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                multiple
                onChange={onFiles}
                className="sr-only"
              />
            </label>
          )}
        </div>
        {imageError && <span className="field-error">{imageError}</span>}
      </div>
    </section>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex min-w-0 flex-col gap-6">
      <section className="card">
        <div className="card-body space-y-5">
          <div>
            <label htmlFor="product-title" className="label">
              Title
            </label>
            <input id="product-title" {...register("title")} className={`input ${errors.title ? "input-error" : ""}`} />
            {error(errors.title?.message)}
          </div>
          <div>
            <label htmlFor="product-description" className="label">
              Description
            </label>
            <textarea
              id="product-description"
              rows={5}
              {...register("description")}
              className={`input ${errors.description ? "input-error" : ""}`}
            />
            {error(errors.description?.message)}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Category</h2>
            <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">
              {!category
                ? "Choose it first: the sizes and specifications below come from it."
                : categoryQuery.isLoading
                  ? "Loading the category filters..."
                  : `Sizes${rules.get("color") ? ", color suggestions" : ""} and specifications come from ${category.title}${
                      path.filter(Boolean).length > 1 ? " and its parent categories" : ""
                    }.`}
            </p>
          </div>
        </div>
        <div className="card-body grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((options, level) => (
            <div key={level}>
              <label htmlFor={`product-category-${level}`} className="label">
                {level === 0 ? "Category" : level === 1 ? "Sub-category" : "Detail category"}
              </label>
              <select
                id={`product-category-${level}`}
                value={path[level] ?? ""}
                onChange={selectLevel(level)}
                className="input"
              >
                <option value="">{level === 0 ? "No category" : "Any"}</option>
                {options.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.title}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      <VariantsEditor form={form} rules={rules} categoryName={category?.title} />

      {imagesSection}

      <CategorySpecs
        form={form}
        filters={specFilters}
        categoryName={category?.title}
        isLoading={Boolean(category) && categoryQuery.isLoading}
      />

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Publishing</h2>
        </div>
        <div className="card-body grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="product-status" className="label">
              Status
            </label>
            <select id="product-status" {...register("status")} className="input">
              {(Object.keys(PRODUCT_STATUS) as ProductStatus[]).map((status) => (
                <option key={status} value={status}>
                  {PRODUCT_STATUS[status].label}
                </option>
              ))}
            </select>
            <span className="field-hint">Only active products are visible in the store.</span>
          </div>

          <div>
            <label htmlFor="product-tags" className="label">
              Tags
            </label>
            <input id="product-tags" {...register("tags")} placeholder="boy, summer, cotton" className="input" />
            <span className="field-hint">Comma separated, used by the store search.</span>
          </div>
        </div>
        <div className="flex justify-end border-t border-gray-200 px-5 py-4 dark:border-white/10">
          <button
            type="submit"
            disabled={busy || (isEdit && !isDirty && !mediaChanged && !pathChanged)}
            className="btn btn-primary btn-lg w-full sm:w-auto"
          >
            <LuSave className="size-4" />
            {upload.isPending
              ? "Uploading images..."
              : save.isPending
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create product"}
          </button>
        </div>
      </section>
    </form>
  );
}

function Thumb({ src, isNew = false, onRemove }: { src: string; isNew?: boolean; onRemove: () => void }) {
  return (
    <div className="relative size-24 overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
      <Image src={src} alt="" fill sizes="96px" unoptimized={isNew} className="object-cover" />
      {isNew && <span className="badge badge-accent absolute bottom-1 left-1 py-0 text-[10px]">New</span>}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 rounded-full bg-ink-950/60 p-0.5 text-white hover:bg-ink-950/80"
        aria-label="Remove image"
      >
        <LuX className="size-3.5" />
      </button>
    </div>
  );
}
