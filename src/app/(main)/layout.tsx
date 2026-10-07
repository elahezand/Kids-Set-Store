import ShowFooter from "@/components/modules/main/footer/showFooter";
import Navbar from "@/components/modules/main/navbar/navbar";
import AosInit from "@/components/modules/ui/aosInit";
import infoService from "@/services/server/public/info";
import type { ReactNode } from "react";
import type { SiteInfo } from "@/types";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const info = (await infoService.getSiteInfo()) as SiteInfo | null;

  return (
    <>
      <AosInit />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar logo={info?.logo} />
      <main id="main-content" className="min-h-[60vh] pt-24">
        {children}
      </main>
      <ShowFooter info={info} />
    </>
  );
}
