"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/services/client/keys";
import { useCursorList, useDelete, useGet, usePatch, usePost, usePut } from "@/services/client/query";
import { ROUTES } from "@/utils/constants";
import { formatPrice } from "@/utils/format";
import type { AdminListParams } from "@/utils/adminFilters";
import type {
  AdminArticle,
  AdminComment,
  AdminOrder,
  AdminProduct,
  AdminStatsSeries,
  AdminTicket,
  AdminUser,
  ApiSuccess,
  ArticlePayload,
  CategoryDetail,
  Coupon,
  CouponPayload,
  Id,
  ModerateCommentPayload,
  Paginated,
  ProductPayload,
  ProductStatus,
  ReplyCommentPayload,
  ShipOrderPayload,
  UpdateOrderPayload,
} from "@/types";

const useAfterChange = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return (message: string | undefined, key: readonly unknown[] = queryKeys.admin.all) => {
    if (message) toast.success(message);
    queryClient.invalidateQueries({ queryKey: key });
    router.refresh();
  };
};

type WithId<T> = T & { id: Id };

export const useAdminStats = (days: number) =>
  useGet<ApiSuccess<AdminStatsSeries>>(
    "/admin/stat",
    { days },
    { queryKey: queryKeys.admin.stats(days), errorFallback: "Could not load the chart", staleTime: 60 * 1000 }
  );

export const useUploadImages = () =>
  usePost<ApiSuccess<string[]>, FormData>("/admin/upload", { errorFallback: "Could not upload the images" });

export const imagesFormData = (files: File[]) => {
  const data = new FormData();
  files.forEach((file) => data.append("files", file));
  return data;
};

export const useAdminOrders = (initialPage: Paginated<AdminOrder>, params: AdminListParams) =>
  useCursorList("/admin/order", queryKeys.admin.orders(params), params, initialPage, "Could not load orders");

export const useUpdateOrder = ({ onDone }: { onDone?: () => void } = {}) => {
  const afterChange = useAfterChange();
  return usePut<ApiSuccess<AdminOrder>, WithId<UpdateOrderPayload>>(({ id }) => `/admin/order/${id}`, {
    errorFallback: "Could not update the order",
    onSuccess: (response) => {
      const order = response.data;
      const message =
        order?.status === "cancelled"
          ? order.refundAmount
            ? `Order cancelled — ${formatPrice(order.refundAmount)} refunded to the customer's wallet (see the Cancelled tab)`
            : "Order cancelled (see the Cancelled tab)"
          : "Order updated";
      afterChange(message, queryKeys.admin.orders());
      onDone?.();
    },
  });
};

export const useShipOrder = ({ onDone }: { onDone?: () => void } = {}) => {
  const afterChange = useAfterChange();
  return usePatch<ApiSuccess<AdminOrder>, ShipOrderPayload>(({ orderId }) => `/admin/order/${orderId}/ship`, {
    errorFallback: "Could not mark the order as shipped",
    onSuccess: () => {
      afterChange("Order shipped — the customer was notified", queryKeys.admin.orders());
      onDone?.();
    },
  });
};

export const useMarkOrderDelivered = ({ onDone }: { onDone?: () => void } = {}) => {
  const afterChange = useAfterChange();
  return usePatch<ApiSuccess<AdminOrder>, Id>((id) => `/admin/order/${id}/delivered`, {
    errorFallback: "Could not mark the order as delivered",
    onSuccess: () => {
      afterChange("Order completed", queryKeys.admin.orders());
      onDone?.();
    },
  });
};

export const useAdminProducts = (initialPage: Paginated<AdminProduct>, params: AdminListParams) =>
  useCursorList("/admin/products", queryKeys.admin.products(params), params, initialPage, "Could not load products");

export const useCategoryFilters = (slug?: string) =>
  useGet<ApiSuccess<CategoryDetail>>(`/categories/${encodeURIComponent(slug ?? "")}`, undefined, {
    queryKey: queryKeys.admin.categoryFilters(slug ?? ""),
    enabled: Boolean(slug),
    errorFallback: "Could not load the category options",
    staleTime: 10 * 60 * 1000,
  });

export const useSaveProduct = (productId?: Id) => {
  const router = useRouter();
  const afterChange = useAfterChange();
  const create = usePost<ApiSuccess<AdminProduct>, ProductPayload>("/admin/products", {
    errorFallback: "Could not create the product",
    onSuccess: () => {
      afterChange("Product created", queryKeys.admin.products());
      router.push(ROUTES.admin.products);
    },
  });
  const update = usePut<ApiSuccess, Partial<ProductPayload>>(`/admin/products/${productId}`, {
    errorFallback: "Could not update the product",
    onSuccess: () => afterChange("Product saved", queryKeys.admin.products()),
  });
  return productId ? update : create;
};

export const useChangeProductStatus = () => {
  const afterChange = useAfterChange();
  return usePatch<ApiSuccess, { id: Id; status: ProductStatus }>(({ id }) => `/admin/products/${id}`, {
    errorFallback: "Could not change the status",
    onSuccess: () => afterChange("Product status updated", queryKeys.admin.products()),
  });
};

export const useDeleteProduct = () => {
  const afterChange = useAfterChange();
  return useDelete<ApiSuccess, Id>((id) => `/admin/products/${id}`, {
    errorFallback: "Could not delete the product",
    onSuccess: () => afterChange("Product deleted", queryKeys.admin.products()),
  });
};

export const useAdminUsers = (initialPage: Paginated<AdminUser>, params: AdminListParams) =>
  useCursorList("/admin/users", queryKeys.admin.users(params), params, initialPage, "Could not load users");

export const useToggleUserRole = () => {
  const afterChange = useAfterChange();
  return usePatch<ApiSuccess, Id>((id) => `/admin/users/${id}/role`, {
    errorFallback: "Could not change the role",
    onSuccess: () => afterChange("Role updated", queryKeys.admin.users()),
  });
};

export const useToggleUserBan = () => {
  const afterChange = useAfterChange();
  return usePatch<ApiSuccess, Id>((id) => `/admin/users/${id}/ban`, {
    errorFallback: "Could not change the ban",
    onSuccess: (response) => afterChange(response.message || "Done", queryKeys.admin.users()),
  });
};

export const useDeleteUser = () => {
  const afterChange = useAfterChange();
  return useDelete<ApiSuccess, Id>((id) => `/admin/users/${id}`, {
    errorFallback: "Could not delete the user",
    onSuccess: () => afterChange("User deleted", queryKeys.admin.users()),
  });
};

export const useAdminComments = (initialPage: Paginated<AdminComment>, params: AdminListParams) =>
  useCursorList("/admin/comments", queryKeys.admin.comments(params), params, initialPage, "Could not load comments");

export const useModerateComment = ({ onDone }: { onDone?: () => void } = {}) => {
  const afterChange = useAfterChange();
  return usePut<ApiSuccess, ModerateCommentPayload>(({ id }) => `/admin/comments/${id}`, {
    errorFallback: "Could not update the comment",
    onSuccess: () => {
      afterChange("Comment status updated", queryKeys.admin.comments());
      onDone?.();
    },
  });
};

export const useReplyComment = ({ onDone }: { onDone?: () => void } = {}) => {
  const afterChange = useAfterChange();
  return usePost<ApiSuccess, ReplyCommentPayload>(({ id }) => `/admin/comments/${id}`, {
    errorFallback: "Could not send the reply",
    onSuccess: () => {
      afterChange("Reply published", queryKeys.admin.comments());
      onDone?.();
    },
  });
};

export const useDeleteComment = () => {
  const afterChange = useAfterChange();
  return useDelete<ApiSuccess, Id>((id) => `/admin/comments/${id}`, {
    errorFallback: "Could not delete the comment",
    onSuccess: () => afterChange("Comment deleted", queryKeys.admin.comments()),
  });
};

export const useAdminArticles = (initialPage: Paginated<AdminArticle>, params: AdminListParams) =>
  useCursorList("/admin/article", queryKeys.admin.articles(params), params, initialPage, "Could not load articles");

export const useSaveArticle = (articleId?: Id) => {
  const router = useRouter();
  const afterChange = useAfterChange();
  const create = usePost<ApiSuccess<AdminArticle>, ArticlePayload>("/admin/article", {
    errorFallback: "Could not create the article",
    onSuccess: () => {
      afterChange("Article created", queryKeys.admin.articles());
      router.push(ROUTES.admin.articles);
    },
  });
  const update = usePut<ApiSuccess<AdminArticle>, Partial<ArticlePayload>>(`/admin/article/${articleId}`, {
    errorFallback: "Could not update the article",
    onSuccess: () => afterChange("Article saved", queryKeys.admin.articles()),
  });
  return articleId ? update : create;
};

export const useToggleArticle = () => {
  const afterChange = useAfterChange();
  return usePut<ApiSuccess, { id: Id; isPublished: boolean }>(({ id }) => `/admin/article/${id}`, {
    errorFallback: "Could not update the article",
    onSuccess: (_response, { isPublished }) =>
      afterChange(isPublished ? "Article published" : "Article moved to drafts", queryKeys.admin.articles()),
  });
};

export const useDeleteArticle = () => {
  const afterChange = useAfterChange();
  return useDelete<ApiSuccess, Id>((id) => `/admin/article/${id}`, {
    errorFallback: "Could not delete the article",
    onSuccess: () => afterChange("Article deleted", queryKeys.admin.articles()),
  });
};

export const useAdminTickets = (initialPage: Paginated<AdminTicket>, params: AdminListParams) =>
  useCursorList("/admin/tickets", queryKeys.admin.tickets(params), params, initialPage, "Could not load tickets");

export const useAdminCoupons = (initialPage: Paginated<Coupon>, params: AdminListParams) =>
  useCursorList("/admin/coupon", queryKeys.admin.coupons(params), params, initialPage, "Could not load discount codes");

export const useCreateCoupon = ({ onCreated }: { onCreated?: () => void } = {}) => {
  const afterChange = useAfterChange();
  return usePost<ApiSuccess<Coupon>, CouponPayload>("/admin/coupon", {
    errorFallback: "Could not create the code",
    onSuccess: () => {
      afterChange("Discount code created", queryKeys.admin.coupons());
      onCreated?.();
    },
  });
};

export const useUpdateCoupon = () => {
  const afterChange = useAfterChange();
  return usePut<ApiSuccess<Coupon>, WithId<Partial<CouponPayload>>>(({ id }) => `/admin/coupon/${id}`, {
    errorFallback: "Could not update the code",
    onSuccess: () => afterChange("Discount code updated", queryKeys.admin.coupons()),
  });
};

export const useDeleteCoupon = () => {
  const afterChange = useAfterChange();
  return useDelete<ApiSuccess, Id>((id) => `/admin/coupon/${id}`, {
    errorFallback: "Could not delete the code",
    onSuccess: () => afterChange("Discount code deleted", queryKeys.admin.coupons()),
  });
};
