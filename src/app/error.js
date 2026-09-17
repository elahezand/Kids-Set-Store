"use client";
import ErrorFallback from "@/components/modules/ui/errorFallback";

export default function Error({ error, reset }) {
    return <ErrorFallback error={error} reset={reset} />;
}
