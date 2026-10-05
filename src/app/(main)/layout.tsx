import ShowFooter from "@/components/modules/main/footer/showFooter";
import Navbar from "@/components/modules/main/navbar/navbar";
import AosInit from "@/components/modules/ui/aosInit";
import connectToDB from "@/configs/db";
import infoService from "@/services/server/public/info";
import { toPlain } from "@/utils/format";
import type { ReactNode } from "react";
import type { SiteInfo } from "@/types";

const loadSiteInfo = async (): Promise<SiteInfo | null> => {
  try {
    await connectToDB();
    return toPlain((await infoService.getInfo()) as SiteInfo | null);
  } catch (error) {
    console.error("[layout] could not load site info:", error);
    return null;
  }
};

export default async function MainLayout({ children }: { children: ReactNode }) {
  const info = await loadSiteInfo();

  return (
    <>
      <AosInit />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="min-h-[60vh] pt-24">
        {children}
      </main>
      <ShowFooter info={info} />
    </>
  );
}
