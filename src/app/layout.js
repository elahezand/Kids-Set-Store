// ✅ app/layout.js - Optimized
import "./globals.css";
import { Suspense } from "react";
import { Toaster } from "sonner";
import ScrollToTop from "@/components/modules/ui/scrollToTop";
import PageLoader from "@/components/modules/ui/pageLoader";
import QueryProvider from "@/utils/providers/react-query-client-provider";

export const metadata = {
  title: "Set Kids - Premium Children's Clothing",
  description: "Shop premium and stylish children's clothing for all ages",
  keywords: "kids clothing, children's fashion, online store, Set Kids",
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// Theme initialization script
const themeScript = `
(function() {
  try {
    const stored = localStorage.getItem('theme');
    const dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
          suppressHydrationWarning
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>

      <body className="bg-white dark:bg-gray-900 transition-colors duration-300">
        <Toaster
          position="top-center"
          offset={20}
          theme="light"
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />

        <QueryProvider>
          <div className="min-h-screen flex flex-col">
            <ScrollToTop />

            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}