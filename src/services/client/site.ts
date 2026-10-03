"use client";

import { toast } from "sonner";
import { usePost } from "@/services/client/query";
import type { ApiSuccess, ContactPayload, NewsletterPayload } from "@/types";

export const useSendContact = ({ onSent }: { onSent?: () => void } = {}) =>
  usePost<ApiSuccess, ContactPayload>("/contacts", {
    axiosConfig: { skipRefresh: true },
    errorFallback: "Failed to send message",
    onSuccess: () => {
      toast.success("Your message was sent successfully :)");
      onSent?.();
    },
  });

export const useSubscribeNewsletter = ({ onSubscribed }: { onSubscribed?: () => void } = {}) =>
  usePost<ApiSuccess, NewsletterPayload>("/newsletters", {
    axiosConfig: { skipRefresh: true },
    errorFallback: "Could not subscribe",
    onSuccess: () => {
      toast.success("Thanks for subscribing!");
      onSubscribed?.();
    },
  });
