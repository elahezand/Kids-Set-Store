import { calcFinalPrice } from "@/utils/pricing";
import { CATEGORY_LOCKED_ATTRIBUTES, VARIANT_FILTER_SLUGS } from "@/validators/product";
import type { AdminProduct, CategoryFilter, ProductPayload, ProductStatus } from "@/types";

/* ---------- form values (validated with productFormSchema in validators/product) ---------- */

export interface ProductVariantValue {
  _id?: string;
  size: string;
  color: string;
  sku?: string;
  price: number | string;
  discount: number | string;
  /** shown and editable in the table; changing it changes the discount */
  finalPrice?: number | string;
  stock: number | string;
}

export interface ProductFormValues {
  title: string;
  description: string;
  status: ProductStatus;
  tags: string;
  /** comma lists used only by "Generate variants" */
  sizes: string;
  colors: string;
  variants: ProductVariantValue[];
  /** { [category filter slug]: value } */
  specs: Record<string, string>;
}

/** what productFormSchema returns after validation */
export interface ProductFormOutput extends Omit<ProductFormValues, "tags" | "variants"> {
  tags: string[];
  variants: Array<
    Omit<ProductVariantValue, "price" | "discount" | "stock" | "finalPrice"> & {
      price: number;
      discount: number;
      finalPrice?: number;
      stock: number;
    }
  >;
}

const STATUSES: ProductStatus[] = ["draft", "active", "inactive"];

/** same formula as the backend (utils/pricing) so the admin sees the price the customer pays */
export const finalPriceOf = (price: number | string, discount: number | string) =>
  price === "" || price === null || price === undefined ? null : calcFinalPrice(Number(price), Number(discount) || 0);

/**
 * Final price typed by the admin -> discount %. Kept with 4 decimals so price - discount%
 * (rounded to cents, like the backend) gives back exactly the typed final price.
 */
export const discountFor = (price: number | string, finalPrice: number | string) => {
  const p = Number(price);
  const f = Number(finalPrice);
  if (!Number.isFinite(p) || !Number.isFinite(f) || p <= 0 || finalPrice === "" || f < 0 || f > p) return null;
  return Math.round(((p - f) / p) * 100 * 10000) / 10000;
};

export const splitList = (text?: string) => [
  ...new Set(
    String(text ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  ),
];

const skuPart = (text: string) =>
  String(text)
    .toUpperCase()
    .replace(/[^A-Z0-9؀-ۿ]+/g, "-")
    .replace(/^-|-$/g, "");

/** "KIDS-HOODIE-2T-BLUE" */
export const makeSku = (title: string, size: string, color: string) =>
  [skuPart(title || "item").slice(0, 24), skuPart(size), skuPart(color)].filter(Boolean).join("-").slice(0, 60);

export const emptyVariant = (defaults: Partial<ProductVariantValue> = {}): ProductVariantValue => ({
  size: "",
  color: "",
  sku: "",
  price: "",
  discount: 0,
  finalPrice: "",
  stock: 0,
  ...defaults,
});

export const variantKey = (variant: Pick<ProductVariantValue, "size" | "color">) =>
  `${variant.size.trim().toLowerCase()}|${variant.color.trim().toLowerCase()}`;

/** every size × color pair of the two comma lists */
export const combinations = (sizes: string, colors: string) =>
  splitList(sizes).flatMap((size) => splitList(colors).map((color) => ({ size, color })));

/* ---------- category ↔ product ---------- */

export interface VariantRule {
  slug: string;
  name: string;
  /** locked = only the category's options; suggest = free text with the options as hints */
  mode: "locked" | "suggest";
  options: Array<{ value: string; label: string }>;
}

const isChoice = (filter: CategoryFilter) => ["select", "radio"].includes(filter.type) && filter.options?.length > 0;
const slugOf = (filter: CategoryFilter) => String(filter.slug).trim().toLowerCase();

/** the category's "size" / "color" filters (its own + its parents') */
export const variantRulesOf = (filters: CategoryFilter[] = []) => {
  const rules = new Map<string, VariantRule>();
  for (const filter of filters) {
    const slug = slugOf(filter);
    if (!VARIANT_FILTER_SLUGS.includes(slug) || !isChoice(filter)) continue;
    rules.set(slug, {
      slug,
      name: filter.name || slug,
      mode: CATEGORY_LOCKED_ATTRIBUTES.includes(slug) ? "locked" : "suggest",
      options: filter.options.map((option) => ({
        value: String(option.value),
        label: String(option.label || option.value),
      })),
    });
  }
  return rules;
};

/** every other filter of the category becomes a specification field */
export const specFiltersOf = (filters: CategoryFilter[] = []) =>
  filters.filter((filter) => !VARIANT_FILTER_SLUGS.includes(slugOf(filter)));

export const allowedValue = (rule: VariantRule, value: string) =>
  rule.options.some((option) => option.value.toLowerCase() === value.trim().toLowerCase());

/** sizes that are not options of the category: [{ index, message }] */
export const sizeErrors = (variants: Array<Pick<ProductVariantValue, "size">>, rules: Map<string, VariantRule>) => {
  const rule = rules.get("size");
  if (rule?.mode !== "locked") return [];
  return variants.flatMap((variant, index) =>
    variant.size && !allowedValue(rule, variant.size)
      ? [{ index, message: `Not a ${rule.name.toLowerCase()} of this category` }]
      : []
  );
};

/** required specs left empty and values that are not options: [{ slug, message }] */
export const specErrors = (specs: Record<string, string>, filters: CategoryFilter[]) =>
  filters.flatMap((filter) => {
    const value = String(specs[filter.slug] ?? "").trim();
    if (!value || value === "false") {
      return filter.required ? [{ slug: filter.slug, message: `${filter.name} is required` }] : [];
    }
    if (isChoice(filter) && !filter.options.some((option) => String(option.value) === value)) {
      return [{ slug: filter.slug, message: `Choose a ${filter.name.toLowerCase()} from the list` }];
    }
    return [];
  });

/* ---------- payload ---------- */

/** Form values -> body for POST / PUT /api/admin/products. Only the category's spec fields are sent. */
export const buildProductPayload = (
  values: ProductFormOutput,
  { categoryPath, images, specFilters }: { categoryPath: string[]; images?: string[]; specFilters: CategoryFilter[] }
): ProductPayload => ({
  title: values.title,
  description: values.description,
  status: values.status,
  categoryPath,
  tags: values.tags,
  specs: Object.fromEntries(
    specFilters
      .map((filter) => [filter.slug, String(values.specs?.[filter.slug] ?? "").trim()] as const)
      // an unticked yes/no filter is simply not stored (the shop filters on "true")
      .filter(([, value]) => value && value !== "false")
  ),
  ...(images ? { images } : {}),
  variants: values.variants.map((variant) => ({
    ...(variant._id ? { _id: variant._id } : {}),
    attributes: { size: variant.size.trim(), color: variant.color.trim() },
    sku: variant.sku?.trim() || makeSku(values.title, variant.size, variant.color),
    price: variant.price,
    discount: variant.discount || 0,
    finalPrice: calcFinalPrice(variant.price, variant.discount),
    stock: variant.stock || 0,
  })),
});

const NEW_PRODUCT: ProductFormValues = {
  title: "",
  description: "",
  status: "draft",
  tags: "",
  sizes: "",
  colors: "",
  variants: [],
  specs: {},
};

/** Product document -> initial form values. */
export const productToFormValues = (product?: AdminProduct | null): ProductFormValues => {
  if (!product) return NEW_PRODUCT;

  const variants = (product.variants ?? []).map((variant) => ({
    _id: variant._id ? String(variant._id) : undefined,
    size: variant.attributes?.size ?? "",
    color: variant.attributes?.color ?? "",
    sku: variant.sku ?? "",
    price: variant.price ?? 0,
    discount: variant.discount ?? 0,
    finalPrice: variant.finalPrice ?? calcFinalPrice(variant.price ?? 0, variant.discount ?? 0),
    stock: variant.stock ?? 0,
  }));

  return {
    title: product.title ?? "",
    description: product.description ?? "",
    status: STATUSES.includes(product.status as ProductStatus) ? (product.status as ProductStatus) : "draft",
    tags: (product.tags ?? []).join(", "),
    sizes: [...new Set(variants.map((v) => v.size).filter(Boolean))].join(", "),
    colors: [...new Set(variants.map((v) => v.color).filter(Boolean))].join(", "),
    variants,
    specs: Object.fromEntries(Object.entries(product.specs ?? {}).map(([key, value]) => [key, String(value)])),
  };
};

export const totalStock = (product: Pick<AdminProduct, "variants">) =>
  (product.variants ?? []).reduce((sum, variant) => sum + (variant.stock || 0), 0);

/* ---------- typed numbers (price / discount / stock inputs) ---------- */

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/**
 * What the admin types -> a clean number string: Persian / Arabic digits become 0-9,
 * "٫" / "," become ".", anything else is dropped. `decimal: false` keeps whole numbers only.
 */
export const cleanNumberInput = (raw: string, { decimal = true }: { decimal?: boolean } = {}) => {
  const latin = raw
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
    .replace(/[٫,]/g, ".");
  if (!decimal) return latin.split(".")[0].replace(/\D/g, "");
  const [whole, ...rest] = latin.replace(/[^\d.]/g, "").split(".");
  return rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole;
};
