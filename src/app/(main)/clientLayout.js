import ShowFooter from "./showFooter";
import Navbar from "@/components/modules/main/navbar/navbar";

export default function ClientLayout({ children }) {
    return (
        <>
            {/* دسترس‌پذیری: اولین چیزی که با Tab دیده می‌شود */}
            <a href="#main-content" className="skip-link">
                Skip to content
            </a>

            <Navbar />

            {/* ناوبار fixed است (ارتفاع 70px + 5px فاصله از بالا)،
                پس فضای بالای صفحه یک‌بار اینجا ساخته می‌شود؛ نه داخل بنر. */}
            <main id="main-content" className="min-h-[60vh] pt-[86px]">
                {children}
            </main>

            <ShowFooter />
        </>
    );
}
