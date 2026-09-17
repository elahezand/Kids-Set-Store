"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

/**
 * URL based pagination (?page=N).
 * Accepts either `pageCount` or `totalCount` + `pageSize`.
 */
export default function Pagination({ pageCount, totalCount, pageSize = 10, limit, className = "" }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const size = limit || pageSize;
    const totalPages = pageCount ?? Math.ceil((totalCount || 0) / size);
    const currentPage = Number(searchParams.get("page")) || 1;

    if (!totalPages || totalPages <= 1) return null;

    const goTo = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        const params = new URLSearchParams(searchParams.toString());
        if (!params.get("limit")) params.set("limit", String(size));
        page > 1 ? params.set("page", String(page)) : params.delete("page");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Compact page list: 1 … 4 5 6 … 10
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) pages.push(i);
        else if (pages[pages.length - 1] !== "…") pages.push("…");
    }

    const base = "flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors";

    return (
        <nav aria-label="Pagination" className={`my-8 flex items-center justify-center gap-1.5 ${className}`}>
            <button type="button" onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}
                className={`${base} text-gray-700 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-white/5`} aria-label="Previous page">
                <LuChevronLeft className="size-4" />
            </button>
            {pages.map((page, i) =>
                page === "…" ? (
                    <span key={`gap-${i}`} className="px-1 text-gray-600">…</span>
                ) : (
                    <button key={page} type="button" onClick={() => goTo(page)} aria-current={page === currentPage ? "page" : undefined}
                        className={`${base} ${page === currentPage
                            ? "bg-coral-400 text-white shadow-card"
                            : "text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"}`}>
                        {page}
                    </button>
                )
            )}
            <button type="button" onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages}
                className={`${base} text-gray-700 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-white/5`} aria-label="Next page">
                <LuChevronRight className="size-4" />
            </button>
        </nav>
    );
}
