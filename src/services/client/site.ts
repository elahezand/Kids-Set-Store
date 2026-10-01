"use client";

import { toast } from "sonner";
import type { ApiSuccess, ContactPayload, NewsletterPayload } from "@/types";
import { usePost } from "./query";

/* Contact form + newsletter (API: /api/contacts, /api/newsletters) */

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
