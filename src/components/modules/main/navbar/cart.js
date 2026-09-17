"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaShoppingCart } from "react-icons/fa";
export default function CartCount() {
    const [cartCount, setCartCount] = useState(0)

    const updateCartCount = () => {
        const saved = JSON.parse(localStorage.getItem("cart"))
        if (saved) setCartCount(saved.length)
    }

    useEffect(() => {
        updateCartCount()
        window.addEventListener("cartUpdated", updateCartCount)
        return () => window.removeEventListener("cartUpdated", updateCartCount)
    }, [cartCount])

    return (
        <Link href="/cart" className="relative">
            <FaShoppingCart />
            <span className="absolute -left-[9px] -top-[7px] flex h-4 w-4 items-center justify-center rounded-full bg-coral-300 text-[10px] leading-none text-white">
                {cartCount ? cartCount : "0"}
            </span>
        </Link>
    )
}
