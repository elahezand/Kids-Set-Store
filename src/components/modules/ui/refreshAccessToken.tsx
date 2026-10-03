"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageLoader from "@/components/modules/ui/pageLoader";
import { http } from "@/services/client/http";

interface RefreshAccessTokenProps {
  shouldRefresh: boolean;
  children: ReactNode;
}

export default function RefreshAccessToken({ shouldRefresh, children }: RefreshAccessTokenProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(shouldRefresh);

  useEffect(() => {
    if (!shouldRefresh) {
      setLoading(false);
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;

    http
      .post("/auth/refresh", {}, { skipRefresh: true })
      .then(() => {
        router.refresh();
        timer = setTimeout(() => setLoading(false), 1000);
      })
      .catch(() => {
        window.location.href = "/";
      });

    return () => clearTimeout(timer);
  }, [shouldRefresh, router]);

  if (loading) return <PageLoader />;

  return <>{children}</>;
}
