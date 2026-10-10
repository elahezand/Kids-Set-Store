"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/services/client/keys";
import { useCursorList, useDelete, useGet, usePatch, usePost } from "@/services/client/query";
import { ROUTES } from "@/utils/constants";
import { formatPrice } from "@/utils/format";
import type {
  ApiSuccess,
  CommentStatusFilter,
  CreateTicketPayload,
  Department,
  MyComment,
  OrderListItem,
  OrderStatusFilter,
  Paginated,
  PanelNotification,
  SessionUser,
  TicketReplyPayload,
  TicketStatusFilter,
  TicketSummary,
} from "@/types";

const statusParams = (limit: number, status: string) => (status === "all" ? { limit } : { limit, status });

export const useMyOrders = (
  initialPage: Paginated<OrderListItem>,
  limit: number,
  status: OrderStatusFilter = "all"
) => {
  const params = statusParams(limit, status);
  return useCursorList("/user/order", queryKeys.myOrders(params), params, initialPage, "Could not load orders");
};

export const useCancelMyOrder = ({ onDone }: { onDone?: () => void } = {}) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return usePatch<ApiSuccess<OrderListItem>, string>((id) => `/user/order/${id}/cancel`, {
    errorFallback: "Could not cancel the order",
    onSuccess: (response) => {
      const refund = response.data?.refundAmount;
      toast.success(
        refund ? `Order cancelled - ${formatPrice(refund)} was refunded to your wallet` : "Order cancelled"
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.myOrders() });
      onDone?.();
      router.refresh();
    },
  });
};

export const useConfirmDelivery = ({ onDone }: { onDone?: () => void } = {}) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return usePatch<ApiSuccess, string>((id) => `/user/order/${id}/confirm-delivery`, {
    errorFallback: "Could not confirm the delivery",
    onSuccess: (response) => {
      toast.success(response.message || "Thanks! Your order is marked as completed.");
      queryClient.invalidateQueries({ queryKey: queryKeys.myOrders() });
      onDone?.();
      router.refresh();
    },
  });
};

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

export const useNotifications = (limit = 8) =>
  useGet<Paginated<PanelNotification>>(
    "/user/notification",
    { limit },
    {
      queryKey: queryKeys.notifications,
      silentError: true,
      staleTime: 60 * 1000,
      axiosConfig: { silentAuth: true },
    }
  );

export const useMarkNotificationSeen = () => {
  const queryClient = useQueryClient();

  return usePatch<ApiSuccess, string>((id) => `/user/notification/${id}`, {
    onError: () => undefined,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return usePost<ApiSuccess, void>("/auth/logout", {
    axiosConfig: { skipRefresh: true },
    errorFallback: "Logout failed",
    onSuccess: () => {
      queryClient.clear();
      toast.success("Logged out");
      router.replace(ROUTES.login);
      router.refresh();
    },
  });
};
