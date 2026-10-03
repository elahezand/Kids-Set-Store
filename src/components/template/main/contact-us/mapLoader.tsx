"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/template/main/contact-us/map"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[350px] w-full animate-pulse bg-gray-100 dark:bg-ink-800" />,
});

export default function MapLoader() {
  return <Map />;
}
