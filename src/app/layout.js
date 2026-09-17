import "./globals.css";
import ScrollToTop from "@/components/modules/ui/scrollToTop";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import PageLoader from "@/components/modules/ui/pageLoader";
import QueryProvider from "@/utils/react-query-client-provider";

export const metadata = {
  title: "Set Kids",
  description: "Set-Kids Project",
};

const themeInitScript = `(function () {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored ? stored === 'dark' : prefersDark;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();`;

export default function RootLayout({ children }) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Toaster position="top-center" />
        <QueryProvider>
          <div className="min-h-screen">
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
