// ✅ app/layout.js - Optimized
import "./globals.css";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "@/components/modules/ui/scrollToTop";
import PageLoader from "@/components/modules/ui/pageLoader";
import QueryProvider from "@/utils/react-query-client-provider";

export const metadata = {
  title: "Set Kids - Premium Children's Clothing",
  description: "Shop premium and stylish children's clothing for all ages",
  keywords: "kids clothing, children's fashion, online store, Set Kids",
  viewport: "width=device-width, initial-scale=1.0",
  robots: "index, follow",
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
    <html 
      lang="en"
      suppressHydrationWarning
      className="scroll-smooth"
    >
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
          containerStyle={{ top: 20, zIndex: 9999 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#000',
            },
            dark: {
              style: {
                background: '#1f2937',
                color: '#fff',
              },
            },
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