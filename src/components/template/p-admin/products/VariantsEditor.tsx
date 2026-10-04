"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { LuCheck, LuLock, LuSparkles, LuTrash2, LuWandSparkles } from "react-icons/lu";
import { type FieldErrors, type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";
import { formatPrice } from "@/utils/format";
import {
  allowedValue,
  cleanNumberInput,
  combinations,
  emptyVariant,
  finalPriceOf,
  makeSku,
  splitList,
  type ProductFormOutput,
  type ProductFormValues,
  type VariantRule,
  variantKey,
} from "@/utils/productForm";

interface VariantsEditorProps {
  form: UseFormReturn<ProductFormValues, unknown, ProductFormOutput>;
  /** the category's size / color options */
  rules: Map<string, VariantRule>;
  categoryName?: string;
}

const errorText = (message?: unknown) => (message ? <span className="field-error">{String(message)}</span> : null);

/**
 * Every variant is size + color, with its own price, discount and stock.
 * Sizes come from the category (when it has a size filter), colors are free.
 * "Generate" builds every size × color pair and keeps the rows that already exist (same id, price, stock).
 */
export default function VariantsEditor({ form, rules, categoryName }: VariantsEditorProps) {
  const { control, register, getValues, setValue, formState } = form;
  const errors = formState.errors as FieldErrors<ProductFormValues>;

  /** typed number field: no spinner arrows, no mouse-wheel changes, Persian digits allowed */
  const numberField = (name: `variants.${number}.${"price" | "discount" | "stock"}`, decimal = true) => {
    const field = register(name);
    return {
      ...field,
      type: "text",
      inputMode: decimal ? ("decimal" as const) : ("numeric" as const),
      autoComplete: "off",
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        event.target.value = cleanNumberInput(event.target.value, { decimal });
        return field.onChange(event);
      },
    };
  };

  const variants = useFieldArray({ control, name: "variants" });
  const rows = useWatch({ control, name: "variants" }) ?? [];
  const pickedSizes = splitList(useWatch({ control, name: "sizes" }));

  const sizeRule = rules.get("size");
  const colorRule = rules.get("color");
  const sizesLocked = sizeRule?.mode === "locked";

  const [bulk, setBulk] = useState({ price: "", discount: "", stock: "" });
  const [notice, setNotice] = useState("");

  /* a new category with sizes: keep the picked sizes it has, or start with all of them */
  const sizeKey = sizeRule?.options.map((option) => option.value).join("|") ?? "";
  useEffect(() => {
    if (!sizeRule || !sizesLocked) return;
    const kept = splitList(getValues("sizes")).filter((size) => allowedValue(sizeRule, size));
    setValue("sizes", (kept.length ? kept : sizeRule.options.map((option) => option.value)).join(", "));
    // only when the category's sizes change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeKey]);

  const toggleSize = (value: string) => {
    const next = pickedSizes.includes(value) ? pickedSizes.filter((item) => item !== value) : [...pickedSizes, value];
    const order = sizeRule?.options.map((option) => option.value) ?? [];
    next.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    setValue("sizes", next.join(", "), { shouldDirty: true });
  };

  const bulkDefaults = () => ({ price: bulk.price, discount: bulk.discount || 0, stock: bulk.stock || 0 });

  const generate = () => {
    const pairs = combinations(getValues("sizes"), getValues("colors"));
    if (!pairs.length) {
      setNotice("Pick at least one size and write at least one color first");
      return;
    }

    const current = new Map(getValues("variants").map((variant) => [variantKey(variant), variant]));
    const title = getValues("title");
    const next = pairs.map(
      (pair) =>
        current.get(variantKey(pair)) ?? {
          ...emptyVariant(bulkDefaults()),
          ...pair,
          sku: makeSku(title, pair.size, pair.color),
        }
    );

    const kept = next.filter((row) => current.has(variantKey(row))).length;
    variants.replace(next);
    setNotice(`${next.length} variants · ${next.length - kept} new, ${kept} kept`);
  };

  const applyToAll = () => {
    getValues("variants").forEach((_, i) => {
      if (bulk.price !== "") setValue(`variants.${i}.price`, bulk.price, { shouldDirty: true });
      if (bulk.discount !== "") setValue(`variants.${i}.discount`, bulk.discount, { shouldDirty: true });
      if (bulk.stock !== "") setValue(`variants.${i}.stock`, bulk.stock, { shouldDirty: true });
    });
  };

  const fillSkus = () => {
    const title = getValues("title");
    getValues("variants").forEach((variant, i) => {
      if (!variant.sku?.trim()) {
        setValue(`variants.${i}.sku`, makeSku(title, variant.size, variant.color), { shouldDirty: true });
      }
    });
  };

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Variants</h2>
          <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">
            Every size &amp; color customers can buy, with its own price and stock.
          </p>
        </div>
      </div>

      <div className="card-body space-y-6">
        {/* 1. sizes & colors */}
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-[6rem_1fr] sm:items-start">
            <span className="label sm:mt-2.5 sm:mb-0">Sizes</span>
            {sizesLocked && sizeRule ? (
              <div>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sizes">
                  {sizeRule.options.map((option) => {
                    const on = pickedSizes.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleSize(option.value)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          on
                            ? "border-sage-500 bg-sage-50 text-sage-700 dark:bg-sage-500/10 dark:text-sage-300"
                            : "border-gray-300 text-gray-700 hover:border-gray-400 dark:border-white/15 dark:text-gray-400"
                        }`}
                      >
                        {on && <LuCheck className="size-3" />}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-600">
                  <LuLock className="size-3" /> Sizes of {categoryName || "the category"} — pick the ones you sell
                </p>
              </div>
            ) : (
              <div>
                <input {...register("sizes")} placeholder="2T, 3T, 4T" aria-label="Sizes" className="input" />
                <p className="field-hint">
                  {categoryName
                    ? `${categoryName} has no size list, write the sizes.`
                    : "Choose a category to use its sizes."}
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-[6rem_1fr] sm:items-start">
            <label htmlFor="product-colors" className="label sm:mt-2.5 sm:mb-0">
              Colors
            </label>
            <div>
              <input
                id="product-colors"
                {...register("colors")}
                placeholder="white, pink, mint"
                list={colorRule ? "suggest-color" : undefined}
                className="input"
              />
              <p className="field-hint">
                Any color you like
                {colorRule ? ` — suggested: ${colorRule.options.map((option) => option.label).join(", ")}` : ""}.
              </p>
            </div>
          </div>

          {colorRule && (
            <datalist id="suggest-color">
              {colorRule.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </datalist>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:pl-[6.5rem]">
            <button type="button" onClick={generate} className="btn btn-soft-primary btn-sm">
              <LuWandSparkles className="size-3.5" /> Generate variants
            </button>
            {notice && <span className="text-xs text-gray-700 dark:text-gray-400">{notice}</span>}
          </div>
        </div>

        {/* 2. bulk values */}
        <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5">
          <p className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-400">
            Same values for many variants? Fill them here and apply (also used for new rows).
          </p>
          <div className="flex flex-wrap items-end gap-2">
            {(
              [
                ["price", "Price"],
                ["discount", "Discount %"],
                ["stock", "Stock"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="w-28">
                <span className="mb-1 block text-xs text-gray-700 dark:text-gray-400">{label}</span>
                <input
                  type="text"
                  inputMode={key === "stock" ? "numeric" : "decimal"}
                  autoComplete="off"
                  value={bulk[key]}
                  onChange={(event) =>
                    setBulk((current) => ({
                      ...current,
                      [key]: cleanNumberInput(event.target.value, { decimal: key !== "stock" }),
                    }))
                  }
                  className="input py-2"
                />
              </label>
            ))}
            <button type="button" onClick={applyToAll} className="btn btn-secondary btn-sm">
              Apply to all
            </button>
          </div>
        </div>

        {/* 3. variant rows */}
        <div>
          <div className="table-wrap rounded-xl border border-gray-200 dark:border-white/10">
            <table className="data-table min-w-[820px] [&_td]:px-2 [&_td:first-child]:pl-4 [&_th]:px-2 [&_th:first-child]:pl-4">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Color</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Disc. %</th>
                  <th className="whitespace-nowrap">Final price</th>
                  <th>Stock</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {variants.fields.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-sm text-gray-600">
                      No variants yet — pick the sizes, write the colors and press{" "}
                      <span className="font-medium text-gray-800 dark:text-gray-300">Generate variants</span>.
                    </td>
                  </tr>
                )}
                {variants.fields.map((field, index) => {
                  const rowErrors = errors.variants?.[index];
                  const row = rows[index];
                  const size = row?.size ?? "";
                  const final = row ? finalPriceOf(row.price, row.discount) : null;
                  const discounted = final !== null && Number(row?.discount) > 0;
                  return (
                    <tr key={field.id} className="align-top">
                      <td>
                        {sizesLocked && sizeRule ? (
                          <select
                            {...register(`variants.${index}.size`)}
                            aria-label={`Variant ${index + 1} size`}
                            className={`input min-w-28 py-2 ${rowErrors?.size ? "input-error" : ""}`}
                          >
                            <option value="">Choose</option>
                            {sizeRule.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                            {size && !allowedValue(sizeRule, size) && (
                              <option value={size}>{size} (not in category)</option>
                            )}
                          </select>
                        ) : (
                          <input
                            {...register(`variants.${index}.size`)}
                            aria-label={`Variant ${index + 1} size`}
                            className={`input min-w-20 py-2 ${rowErrors?.size ? "input-error" : ""}`}
                          />
                        )}
                        {errorText(rowErrors?.size?.message)}
                      </td>
                      <td>
                        <input
                          {...register(`variants.${index}.color`)}
                          aria-label={`Variant ${index + 1} color`}
                          list={colorRule ? "suggest-color" : undefined}
                          className={`input min-w-20 py-2 ${rowErrors?.color ? "input-error" : ""}`}
                        />
                        {errorText(rowErrors?.color?.message)}
                      </td>
                      <td>
                        <input
                          {...register(`variants.${index}.sku`)}
                          placeholder="auto"
                          aria-label={`Variant ${index + 1} SKU`}
                          className={`input min-w-32 py-2 font-mono text-xs uppercase ${rowErrors?.sku ? "input-error" : ""}`}
                        />
                        {errorText(rowErrors?.sku?.message)}
                      </td>
                      <td>
                        <input
                          {...numberField(`variants.${index}.price`)}
                          placeholder="0"
                          aria-label={`Variant ${index + 1} price`}
                          className={`input min-w-20 py-2 ${rowErrors?.price ? "input-error" : ""}`}
                        />
                        {errorText(rowErrors?.price?.message)}
                      </td>
                      <td>
                        <input
                          {...numberField(`variants.${index}.discount`)}
                          aria-label={`Variant ${index + 1} discount`}
                          className={`input min-w-16 py-2 ${rowErrors?.discount ? "input-error" : ""}`}
                        />
                        {errorText(rowErrors?.discount?.message)}
                      </td>
                      <td className="pt-5 whitespace-nowrap" aria-live="polite">
                        {final === null ? (
                          <span className="text-gray-500">—</span>
                        ) : (
                          <span
                            className={`font-semibold tabular-nums ${discounted ? "text-sage-700 dark:text-sage-300" : "text-gray-900 dark:text-gray-100"}`}
                          >
                            {formatPrice(final)}
                          </span>
                        )}
                      </td>
                      <td>
                        <input
                          {...numberField(`variants.${index}.stock`, false)}
                          aria-label={`Variant ${index + 1} stock`}
                          className={`input min-w-16 py-2 ${rowErrors?.stock ? "input-error" : ""}`}
                        />
                        {errorText(rowErrors?.stock?.message)}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => variants.remove(index)}
                          className="btn btn-soft-danger btn-icon size-9"
                          aria-label={`Remove variant ${index + 1}`}
                          title="Remove variant"
                        >
                          <LuTrash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {errorText(errors.variants?.root?.message ?? errors.variants?.message)}

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={fillSkus} className="btn btn-ghost btn-sm">
              <LuSparkles className="size-3.5" /> Fill empty SKUs
            </button>
            <span className="self-center text-xs text-gray-600">
              {variants.fields.length} variant{variants.fields.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
