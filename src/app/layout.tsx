import { type ReactNode, Suspense } from "react";
import "@/app/globals.css";
import PageLoader from "@/components/modules/ui/pageLoader";
import ScrollToTop from "@/components/modules/ui/scrollToTop";
import QueryProvider from "@/components/providers/queryProvider";
import infoService from "@/services/server/public/info";
import type { Metadata, Viewport } from "next";
import type { SiteInfo } from "@/types";

export const dynamic = "force-dynamic";

const BASE_METADATA: Metadata = {
  title: "Set Kids - Premium Children's Clothing",
  description: "Shop premium and stylish children's clothing for all ages",
  keywords: "kids clothing, children's fashion, online store, Set Kids",
  robots: "index, follow",
};

/** the logo from Admin › Site info is also the browser-tab icon */
export async function generateMetadata(): Promise<Metadata> {
  const logo = ((await infoService.getSiteInfo()) as SiteInfo | null)?.logo?.trim();
  return logo ? { ...BASE_METADATA, icons: { icon: logo, apple: logo } } : BASE_METADATA;
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const themeScript = `
(function() {
  try {
    const stored = localStorage.getItem('theme');
    const dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} suppressHydrationWarning />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>

      <body className="bg-white transition-colors duration-300 dark:bg-ink-900">
        <QueryProvider>
          <div className="flex min-h-screen flex-col">
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>{children}</Suspense>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
