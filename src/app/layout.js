import "./globals.css";
import { Inter } from "next/font/google";
import ScrollToUp from "@/utils/ScrollToUp";
import AosInit from "@/utils/aos";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Set Kids",
  description: "Set-Kids Project",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body className={inter.className}>
        <ScrollToUp />
        <AosInit />
        {children}
      </body>
    </html>
  );
}
