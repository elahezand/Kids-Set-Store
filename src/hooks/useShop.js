"use client"
import { useEffect, useState } from 'react';


export default function useShop() {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        if (typeof window === "undefined")
            return;
        const savedBasket = JSON.parse(localStorage.getItem("cart")) || [];
        if (savedBasket) setCart(savedBasket)
    }, [])

    const decreaseCount = (id) => {
        const savedBasket = JSON.parse(localStorage.getItem("cart")) || [];
        const newBasket = savedBasket.map(item => item._id === id ? { ...item, count: item.count - 1 } : item)
        localStorage.setItem("cart", JSON.stringify(newBasket));
        setCart(newBasket)
    }

    const increaseCount = (id) => {
        const savedBasket = JSON.parse(localStorage.getItem("cart")) || [];
        const newBasket = savedBasket.map(item => item._id === id ? { ...item, count: item.count + 1 } : item)
        localStorage.setItem("cart", JSON.stringify(newBasket));
        setCart(newBasket)
    }

    const addTocard = (name, price, img, _id, count) => {
        let cardBox = JSON.parse(localStorage.getItem("cart")) || []
        const isProductExist = cardBox.some(item => item._id === _id)

        if (!isProductExist) {
            cardBox.push(
                {
                    _id,
                    name,
                    price,
                    img,
                    count: count ? count : 1
                })

            localStorage.setItem("cart", JSON.stringify(cardBox))
            setCart(cardBox)
        }
        else {
            cardBox.forEach(item => {
                if (item._id === _id) {
                    return item.count = count
                }
            })
            localStorage.setItem("cart", JSON.stringify(cardBox))
            setCart(cardBox)

        }
        window.dispatchEvent(new Event("cartUpdated"))
    }

    const removeFromCart = (id) => {
        let cardBox = JSON.parse(localStorage.getItem("cart")) || []
        const filteredCart = cardBox.filter(item => item._id !== id)

        setCart(filteredCart)
        localStorage.setItem("cart", JSON.stringify(filteredCart))
    }

    return { addTocard, increaseCount, decreaseCount, removeFromCart, cart }

}
