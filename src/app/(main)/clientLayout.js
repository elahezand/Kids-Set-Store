import ShowFooter from "./showFooter";
import Navbar from "@/components/modules/main/navbar/navbar";

export default function ClientLayout({ children }) {
    return (
        <>
            <a href="#main-content" className="skip-link">
                Skip to content
            </a>
            <Navbar />
            <main id="main-content" className="min-h-[60vh] pt-[86px]">
                {children}
            </main>
            <ShowFooter />
        </>
    );
}
