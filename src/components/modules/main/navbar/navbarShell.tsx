"use client";

import { useEffect, useState, type ReactNode } from "react";

const SCROLL_THRESHOLD = 24;

export default function NavbarShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav
      data-scrolled={scrolled}
      className={`fixed inset-x-0 z-[9999] mx-auto transition-all duration-300 ease-out ${
        scrolled
          ? "top-[5px] h-[70px] rounded-2xl bg-sage-600 text-white shadow-float sm:mx-4 lg:mx-6 dark:bg-sage-800"
          : "top-0 h-24 bg-transparent text-text-dark dark:text-white"
      }`}
    >
      {children}
    </nav>
  );
}