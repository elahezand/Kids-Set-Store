"use client"
import { MdKeyboardArrowUp } from "react-icons/md";
import React, { useEffect, useState } from 'react'

export default function ScrollToUp() {
    const [showScroll, setShowScroll] = useState(false)

    useEffect(() => {
        window.addEventListener("scroll", () => {
            window.scrollY > 120 ? setShowScroll(true) : setShowScroll(false);
        })
    }, [])

    const scrollToTop = () => {
        showScroll &&
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
    }
    return (
        <div>
            <button
             className={showScroll ? "buttonVisible" : "button"}
                onClick={scrollToTop}>
                <MdKeyboardArrowUp />
            </button>
        </div>
    )
}
