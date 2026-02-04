import "./globals.css";
import ScrollToUp from "@/utils/ScrollToUp";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import RouteSkeleton from "@/components/feedBack/RouteSkeleton";
import QueryProvider from "@/utils/react-query-client-provider";

export const metadata = {
  title: "Set Kids",
  description: "Set-Kids Project",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" />
        <QueryProvider>
          <main>
            <ScrollToUp />
            <Suspense
              fallback={<RouteSkeleton />}>
              {children}
            </Suspense>
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
