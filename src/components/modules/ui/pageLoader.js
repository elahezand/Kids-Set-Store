// Full-height loading state used by route `loading.js` files and Suspense fallbacks
export default function PageLoader({ fullScreen = true, label = "Loading..." }) {
    return (
        <div
            role="status"
            className={`flex w-full flex-col items-center justify-center gap-3 ${fullScreen ? "min-h-screen" : "min-h-[60vh]"}`}
        >
            <span className="spinner" />
            <span className="sr-only">{label}</span>
        </div>
    );
}
