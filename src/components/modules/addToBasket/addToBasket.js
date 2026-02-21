"use client"
import React, { useState } from 'react'
import useShop from '@/utils/hooks/useShop'

export default function AddToBasket({ name, price, img, id }) {
    const { addTocard, increaseCount, decreaseCount } = useShop()
    const [count, setCount] = useState(1)

    return (
        <div className="cart">
            <button onClick={() =>
                addTocard(name, price, img, id, count)}>
                Add To Card  </button>
            <div>
                <span onClick={() => {
                    setCount(prev => prev - 1)
                    decreaseCount(product.id)
                }}> -</span>
                {count}
                <span onClick={() => {
                    setCount(prev => prev + 1)
                    increaseCount(product.id)
                }}> +</span>
            </div>
        </div>
    )
}
