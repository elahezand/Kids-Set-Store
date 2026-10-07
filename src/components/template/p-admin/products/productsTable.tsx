"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuExternalLink, LuPackage, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import CategoryFilter from "@/components/modules/panel/categoryFilter";
import DateRangeFilter from "@/components/modules/panel/dateRangeFilter";
import ListCard from "@/components/modules/panel/listCard";
import SearchBox from "@/components/modules/panel/searchBox";
import StatusTabs from "@/components/modules/panel/statusTabs";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import EmptyState from "@/components/modules/ui/emptyState";
import Stars from "@/components/modules/ui/stars";
import { useAdminProducts, useChangeProductStatus, useDeleteProduct } from "@/services/client/admin";
import { PLACEHOLDER_IMAGE, ROUTES } from "@/utils/constants";
import { formatPrice } from "@/utils/format";
import { PRODUCT_STATUS, PRODUCT_TABS, productState } from "@/utils/panelView";
import { totalStock } from "@/utils/productForm";
import { filteredEmptyText } from "@/utils/adminFilters";
import type { AdminFilters, AdminListParams } from "@/utils/adminFilters";
import type { AdminProduct, Paginated, ProductStatus, ProductStatusFilter } from "@/types";

interface ProductsTableProps {
  initialPage: Paginated<AdminProduct>;
  params: AdminListParams;
  filters: AdminFilters<ProductStatusFilter>;
  limit: number;
  categories: Array<{ id: string; label: string }>;
}

export default function ProductsTable({ initialPage, params, filters, limit, categories }: ProductsTableProps) {
  const { items: products, ...pager } = useAdminProducts(initialPage, params);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);

  const changeStatus = useChangeProductStatus();
  const remove = useDeleteProduct();

  const statusSelect = (product: AdminProduct) => (
    <select
      value={product.status}
      onChange={(event) =>
        changeStatus.mutate({ id: String(product._id), status: event.target.value as ProductStatus })
      }
      disabled={changeStatus.isPending}
      aria-label={`Status of ${product.title}`}
      className="input w-auto py-1.5 text-xs"
    >
      {(Object.keys(PRODUCT_STATUS) as ProductStatus[]).map((status) => (
        <option key={status} value={status}>
          {PRODUCT_STATUS[status].label}
        </option>
      ))}
    </select>
  );

  const actions = (product: AdminProduct) => (
    <div className="flex gap-1.5">
      {product.status === "active" && (
        <Link
          href={ROUTES.product(String(product._id))}
          target="_blank"
          className="btn btn-ghost btn-sm btn-icon"
          aria-label="Open in store"
          title="Open in store"
        >
          <LuExternalLink className="size-3.5" />
        </Link>
      )}
      <Link href={ROUTES.admin.product(String(product._id))} className="btn btn-secondary btn-sm">
        <LuPencil className="size-3.5" /> Edit
      </Link>
      <button
        type="button"
        onClick={() => setDeleting(product)}
        className="btn btn-soft-danger btn-sm btn-icon"
        aria-label={`Delete ${product.title}`}
        title="Delete"
      >
        <LuTrash2 className="size-3.5" />
      </button>
    </div>
  );

  const thumb = (product: AdminProduct) => (
    <Image
      width={44}
      height={44}
      src={product.images?.[0] || PLACEHOLDER_IMAGE}
      alt=""
      className="size-11 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-white/10"
    />
  );

  return (
    <>
      <ListCard
        title="Catalog"
        toolbar={
          <>
            <StatusTabs tabs={PRODUCT_TABS} value={filters.status} />
            <CategoryFilter categories={categories} value={filters.category} />
            <DateRangeFilter value={filters} label="Added" />
            <SearchBox placeholder="Search products…" />
            <Link href={ROUTES.admin.newProduct} className="btn btn-primary btn-sm">
              <LuPlus className="size-4" /> New product
            </Link>
          </>
        }
        isEmpty={products.length === 0}
        empty={
          <EmptyState
            title="No products found"
            description={filteredEmptyText(filters) ?? "Products you add will show up here."}
            icon={LuPackage}
            action={
              <Link href={ROUTES.admin.newProduct} className="btn btn-primary btn-sm">
                <LuPlus className="size-4" /> Add a product
              </Link>
            }
          />
        }
        pager={{ ...pager, count: products.length, limit, noun: "products" }}
      >
        <ul className="divide-y divide-gray-200 md:hidden dark:divide-white/5">
          {products.map((product) => {
            const state = productState(product.status);
            return (
              <li key={String(product._id)} className="space-y-3 px-4 py-4">
                <div className="flex items-center gap-3">
                  {thumb(product)}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{product.title}</p>
                    <p className="text-xs text-gray-700 tabular-nums dark:text-gray-500">
                      {formatPrice(product.minPrice)} · {totalStock(product)} in stock
                    </p>
                  </div>
                  <span className={`badge ${state.badge} shrink-0`}>{state.label}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {statusSelect(product)}
                  {actions(product)}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="table-wrap hidden md:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sold</th>
                <th>Score</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = totalStock(product);
                return (
                  <tr key={String(product._id)}>
                    <td>
                      <div className="flex items-center gap-3">
                        {thumb(product)}
                        <div className="max-w-[240px] min-w-0 leading-tight">
                          <p className="truncate font-medium text-gray-900 dark:text-gray-100">{product.title}</p>
                          <p className="truncate text-xs text-gray-600">
                            {product.variants?.length ?? 0} variant{product.variants?.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap tabular-nums">{formatPrice(product.minPrice)}</td>
                    <td className="tabular-nums">
                      <span className={stock === 0 ? "font-medium text-danger-500" : ""}>{stock}</span>
                    </td>
                    <td className="tabular-nums">{product.metrics?.sold ?? 0}</td>
                    <td>
                      <Stars score={Math.round(product.metrics?.score || 0)} className="text-xs" />
                    </td>
                    <td>{statusSelect(product)}</td>
                    <td>
                      <div className="flex justify-end">{actions(product)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ListCard>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this product?"
        description={`"${deleting?.title}" will disappear from the store. Past orders keep their copy of it.`}
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(String(deleting._id), { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}
