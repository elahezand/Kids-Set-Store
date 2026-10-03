"use client";

import ErrorFallback from "@/components/modules/ui/errorFallback";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  return <ErrorFallback error={error} reset={reset} />;
}
