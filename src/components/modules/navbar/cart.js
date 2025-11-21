"use client"
import React, { useEffect, useState } from 'react'
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

        return () => {
            window.removeEventListener("cartUpdated", updateCartCount)
        }
    }, [cartCount])

    return (
        <Link href="/cart">
            <FaShoppingCart />
            <span>{cartCount ? cartCount : "0"}</span>
        </Link>
    )
}
