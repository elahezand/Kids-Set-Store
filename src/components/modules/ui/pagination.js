"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/** Page-number pagination driven by the `?page=` search param. */
export default function Pagination({ pageCount = 1, limit }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const current = Math.min(Math.max(Number(searchParams.get("page")) || 1, 1), pageCount);

    if (pageCount <= 1) return null;

    const hrefFor = (page) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(page));
        if (limit) params.set("limit", String(limit));
        return `${pathname}?${params.toString()}`;
    };

    const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
        (p) => p === 1 || p === pageCount || Math.abs(p - current) <= 2
    );

    return (
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
            {current > 1 && (
                <Link href={hrefFor(current - 1)} className="btn btn-secondary btn-sm">
                    Prev
                </Link>
            )}
            {pages.map((p, i) => (
                <span key={p} className="flex items-center gap-2">
                    {i > 0 && p - pages[i - 1] > 1 && <span className="text-ink-400">…</span>}
                    <Link
                        href={hrefFor(p)}
                        aria-current={p === current ? "page" : undefined}
                        className={`btn btn-sm ${p === current ? "btn-primary" : "btn-secondary"}`}
                    >
                        {p}
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
