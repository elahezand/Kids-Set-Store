import { type ReactNode, Suspense } from "react";
import "@/app/globals.css";
import PageLoader from "@/components/modules/ui/pageLoader";
import ScrollToTop from "@/components/modules/ui/scrollToTop";
import QueryProvider from "@/utils/providers/queryProvider";
import type { Metadata, Viewport } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set Kids - Premium Children's Clothing",
  description: "Shop premium and stylish children's clothing for all ages",
  keywords: "kids clothing, children's fashion, online store, Set Kids",
  robots: "index, follow",
};

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

      <body className="bg-white transition-colors duration-300 dark:bg-gray-900">
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
