import ShowFooter from "@/app/(main)/showFooter";
import Navbar from "@/components/modules/main/navbar/navbar";
import connectToDB from "@/configs/db";
import { getInfo } from "@/services/server/public/info";
import { toPlain } from "@/utils/format";
import type { ReactNode } from "react";
import type { SiteInfo } from "@/types";

// site contact info (model/info, same service as GET /api/info); the footer works without it
const loadInfo = async (): Promise<SiteInfo | null> => {
    try {
        await connectToDB();
        return toPlain((await getInfo()) as SiteInfo | null);
    } catch (error) {
        console.error("[layout] could not load site info:", error);
        return null;
    }
};

export default async function ClientLayout({ children }: { children: ReactNode }) {
    const info = await loadInfo();

    return (
        <>
            <a href="#main-content" className="skip-link">
                Skip to content
            </a>
            <Navbar />
            <main id="main-content" className="min-h-[60vh] pt-[86px]">
                {children}
            </main>
            <ShowFooter info={info} />
        </>
    );
}
