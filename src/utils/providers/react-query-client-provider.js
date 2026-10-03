"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

/* toast look = site theme: white card, rounded, soft shadow, colored strip per type */
const TOAST_CLASSES = {
  toast:
    "rounded-2xl! border! border-sage-100! bg-white! px-4! py-3.5! text-gray-800! shadow-float! font-sans! dark:border-y-white/10! dark:border-r-white/10! dark:bg-ink-800! dark:text-gray-100!",
  title: "text-sm! font-semibold!",
  description: "text-xs! text-gray-600! dark:text-gray-400!",
  success: "border-l-4! border-l-mint-400! [&_[data-icon]]:text-mint-500!",
  error: "border-l-4! border-l-coral-400! [&_[data-icon]]:text-coral-500!",
  info: "border-l-4! border-l-sage-400! [&_[data-icon]]:text-sage-500!",
  warning: "border-l-4! border-l-peach-400! [&_[data-icon]]:text-peach-500!",
  closeButton:
    "border-sage-100! bg-white! text-gray-500! hover:text-coral-500! dark:border-white/10! dark:bg-ink-800!",
};

export default function QueryProvider({ children }) {
  // One QueryClient per browser session (not recreated on every render)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* under the fixed navbar; styled with Tailwind classes (! = beat sonner's own CSS) */}
      <Toaster
        position="top-center"
        offset={{ top: 92 }}
        mobileOffset={{ top: 86 }}
        closeButton
        toastOptions={{ duration: 4000, classNames: TOAST_CLASSES }}
      />

      {children}

      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}