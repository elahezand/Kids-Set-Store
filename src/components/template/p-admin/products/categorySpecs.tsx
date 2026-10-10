"use client";

import { Controller, type FieldErrors, type UseFormReturn } from "react-hook-form";
import type { ProductFormOutput, ProductFormValues } from "@/utils/productForm";
import type { CategoryFilter } from "@/types";

interface CategorySpecsProps {
  form: UseFormReturn<ProductFormValues, unknown, ProductFormOutput>;
  filters: CategoryFilter[];
  categoryName?: string;
  isLoading?: boolean;
}

export default function CategorySpecs({ form, filters, categoryName, isLoading = false }: CategorySpecsProps) {
  const { register, control } = form;
  const errors = (form.formState.errors as FieldErrors<ProductFormValues>).specs as
    | Record<string, { message?: string }>
    | undefined;

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Specifications</h2>
          <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">
            {categoryName
              ? `The filters of ${categoryName} and its parent categories. Customers filter the shop by these.`
              : "Choose a category: its filters become the specification fields."}
          </p>
        </div>
      </div>

      <div className="card-body">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
          </div>
        ) : !categoryName ? (
          <p className="text-sm text-gray-600">No category chosen yet.</p>
        ) : !filters.length ? (
          <p className="text-sm text-gray-600">{categoryName} has no extra filters.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {filters.map((filter) => {
              const id = `spec-${filter.slug}`;
              const name = `specs.${filter.slug}` as const;
              const error = errors?.[filter.slug]?.message;
              const label = (
                <>
                  {filter.name}
                  {filter.required && <span className="text-danger-500"> *</span>}
                </>
              );

              if (filter.type === "boolean") {
                return (
                  <Controller
                    key={filter.slug}
                    control={control}
                    name={name}
                    render={({ field }) => (
                      <label className="flex cursor-pointer items-center gap-3 self-end py-2.5">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={field.value === "true"}
                          onChange={(event) => field.onChange(event.target.checked ? "true" : "")}
                          onBlur={field.onBlur}
                        />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-300">{label}</span>
                        {error && <span className="field-error">{error}</span>}
                      </label>
                    )}
                  />
                );
              }

              return (
                <div key={filter.slug}>
                  <label htmlFor={id} className="label">
                    {label}
                  </label>
                  {filter.options?.length ? (
                    <select id={id} {...register(name)} className={`input ${error ? "input-error" : ""}`}>
                      <option value="">{filter.required ? "Choose" : "Not set"}</option>
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input id={id} {...register(name)} className={`input ${error ? "input-error" : ""}`} />
                  )}
                  {error && <span className="field-error">{error}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
