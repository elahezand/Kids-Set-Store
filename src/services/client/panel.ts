"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ApiSuccess,
  MyComment,
  CommentStatusFilter,
  OrderListItem,
  OrderStatusFilter,
  Paginated,
  SessionUser,

} from "@/types";
import { queryKeys } from "./keys";
import { useDelete, useGet, useInfiniteGet, usePatch, usePost } from "./query";
import { CreateTicketPayload, TicketSummary, TicketReplyPayload, TicketStatusFilter } from "@/types/ticket";
import { Department } from "@/types/ticket";
import { PanelNotification } from "@/types/dashboard";



const flattenPages = <TItem>(pages?: Array<Paginated<TItem>>) =>
  pages?.flatMap((page) => page.data ?? []) ?? [];

const useCursorList = <TItem>(
  url: string,
  key: readonly unknown[],
  params: Record<string, unknown>,
  initialPage: Paginated<TItem>,
  errorFallback: string
) => {
  const result = useInfiniteGet<TItem>(url, params, { queryKey: key, initialPage, errorFallback });
  const items = useMemo(() => flattenPages(result.data?.pages), [result.data]);
  return { ...result, items };
};

/* list params: "all" is not sent, the API shows everything when there is no status */
const statusParams = (limit: number, status: string) =>
  status === "all" ? { limit } : { limit, status };

/* ---------- orders: GET /api/user/order (services/server/user/order getMyOrders) ---------- */

export const useMyOrders = (
  initialPage: Paginated<OrderListItem>,
  limit: number,
  status: OrderStatusFilter = "all"
) => {
  const params = statusParams(limit, status);
  return useCursorList("/user/order", queryKeys.myOrders(params), params, initialPage, "Could not load orders");
};

/* ---------- comments: /api/user/comment (services/server/user/comment) ---------- */

export const useMyComments = (
  initialPage: Paginated<MyComment>,
  limit: number,
  status: CommentStatusFilter = "all"
) => {
  const params = statusParams(limit, status);
  return useCursorList("/user/comment", queryKeys.myComments(params), params, initialPage, "Could not load comments");
};

export const useDeleteMyComment = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useDelete<ApiSuccess, string>((id) => `/user/comment/${id}`, {
    errorFallback: "Could not delete the comment",
    onSuccess: () => {
      toast.success("Comment deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.myComments() });
      router.refresh();
    },
  });
};

/* ---------- tickets: /api/user/tickets (services/server/user/ticket) ---------- */

export const useMyTickets = (
  initialPage: Paginated<TicketSummary>,
  limit: number,
  status: TicketStatusFilter = "all"
) => {
  const params = statusParams(limit, status);
  return useCursorList("/user/tickets", queryKeys.myTickets(params), params, initialPage, "Could not load tickets");
};

export const useDepartments = () =>
  useGet<ApiSuccess<Department[]>>("/user/departments", undefined, {
    queryKey: queryKeys.departments,
    errorFallback: "Could not load departments",
    staleTime: 30 * 60 * 1000,
  });

export const useCreateTicket = ({ onCreated }: { onCreated?: () => void } = {}) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return usePost<ApiSuccess<TicketSummary>, CreateTicketPayload>("/user/tickets", {
    errorFallback: "Failed to send ticket",
    onSuccess: () => {
      toast.success("Ticket sent. We'll get back to you soon.");
      queryClient.invalidateQueries({ queryKey: queryKeys.myTickets() });
      onCreated?.();
      router.refresh();
    },
  });
};

export const useTicketReply = (ticketId: string, { onSent }: { onSent?: () => void } = {}) => {
  const router = useRouter();

  return usePost<ApiSuccess, TicketReplyPayload>(`/user/tickets/${ticketId}/answer`, {
    errorFallback: "Failed to send reply",
    onSuccess: () => {
      toast.success("Reply sent");
      onSent?.();
      router.refresh();
    },
  });
};

/* ---------- profile: PATCH /api/user/profile (services/server/user/profile) ---------- */

export const useUpdateProfile = ({ onSaved }: { onSaved?: () => void } = {}) => {
  const router = useRouter();

  return usePatch<ApiSuccess<SessionUser>, FormData>("/user/profile", {
    errorFallback: "Could not update the profile",
    onSuccess: () => {
      toast.success("Profile updated");
      onSaved?.();
      router.refresh();
    },
  });
};

/* ---------- notifications: /api/user/notification (topbar bell) ---------- */

export const useNotifications = (limit = 8) =>
  useGet<Paginated<PanelNotification>>("/user/notification", { limit }, {
    queryKey: queryKeys.notifications,
    silentError: true,
    staleTime: 60 * 1000,
    axiosConfig: { silentAuth: true },
  });

export const useMarkNotificationSeen = () => {
  const queryClient = useQueryClient();

  return usePatch<ApiSuccess, string>((id) => `/user/notification/${id}`, {
    onError: () => undefined, // background action, no toast
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
};

/* ---------- session: POST /api/auth/logout ---------- */

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return usePost<ApiSuccess, void>("/auth/logout", {
    axiosConfig: { skipRefresh: true },
    errorFallback: "Logout failed",
    onSuccess: () => {
      queryClient.clear();
      toast.success("Logged out");
      router.replace("/login-register");
      router.refresh();
    },
  });
};
