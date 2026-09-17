"use client";
// Reusable UI for Next.js `error.js` boundaries
export default function ErrorFallback({ error, reset }) {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
            <span className="badge badge-danger">Error</span>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Oops! Something went wrong.</h1>
            <p className="max-w-md text-sm text-gray-700 dark:text-gray-500">
                {error?.message || "An unexpected error occurred."}
            </p>
            <button type="button" onClick={() => reset?.()} className="btn btn-primary">
                Try again
            </button>
        </div>
    );
}
