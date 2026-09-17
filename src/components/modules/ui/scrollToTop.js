"use client";
import { useEffect, useState } from "react";
import { MdKeyboardArrowUp } from "react-icons/md";

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 120);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <button
            type="button"
            aria-label="Scroll to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`fixed bottom-6 left-4 z-40 flex size-12 items-center justify-center rounded-full bg-coral-300 text-3xl text-white shadow-float transition-all duration-200 hover:bg-coral-400 ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
        >
            <MdKeyboardArrowUp />
        </button>
    );
}
