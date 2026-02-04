"use client";
import { createContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(saved);
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    return (
        <CartContext.Provider
            value={{ cart, setCart }}>
            {children}
        </CartContext.Provider>
    );
}

export default CartContext