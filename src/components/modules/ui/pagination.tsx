"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  pageCount?: number;
  limit?: number;
}

export default function Pagination({ pageCount = 1, limit }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = Math.min(Math.max(Number(searchParams.get("page")) || 1, 1), pageCount);

  if (pageCount <= 1) return null;

  const hrefFor = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    return `${pathname}?${params.toString()}`;
  };

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (page) => page === 1 || page === pageCount || Math.abs(page - current) <= 2
  );

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {current > 1 && (
        <Link href={hrefFor(current - 1)} className="btn btn-secondary btn-sm">
          Prev
        </Link>
      )}
      {pages.map((page, index) => (
        <span key={page} className="flex items-center gap-2">
          {index > 0 && page - pages[index - 1] > 1 && <span className="text-ink-400">…</span>}
          <Link
            href={hrefFor(page)}
            aria-current={page === current ? "page" : undefined}
            className={`btn btn-sm ${page === current ? "btn-primary" : "btn-secondary"}`}
          >
            {page}
          </Link>
        </span>
      ))}
      {current < pageCount && (
        <Link href={hrefFor(current + 1)} className="btn btn-secondary btn-sm">
          Next
        </Link>
      )}
    </nav>
  );
}
