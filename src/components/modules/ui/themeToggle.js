"use client"
import { useEffect, useState } from "react";
import { IoSunny, IoMoon } from "react-icons/io5";

// Light / dark theme switch (toggles the `dark` class on <html>)
export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle("dark", next);
        try {
            localStorage.setItem("theme", next ? "dark" : "light");
        } catch (e) { }
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title="حالت شب/روز"
            className="relative flex h-7 w-[52px] shrink-0 items-center rounded-full bg-black/15 px-1 transition-colors duration-300 dark:bg-white/20"
        >
            <span
                className={`flex h-5 w-5 items-center justify-center rounded-full bg-white text-coral-300 shadow transition-transform duration-300 ${isDark ? "translate-x-[24px]" : "translate-x-0"
                    }`}
            >
                {isDark ? <IoMoon className="text-xs" /> : <IoSunny className="text-xs" />}
            </span>
        </button>
    );
}
