"use client"
import React, { useState } from 'react'
import useShop from '@/utils/hooks/useShop'

export default function AddToBasket({ product }) {
    const { addTocard, increaseCount, decreaseCount } = useShop()
    const [count, setCount] = useState(1)

    return (
        <div className="cart">
            <button onClick={() =>
                addTocard(product.name, product.price, product.img, product._id, count)}>
                Add To Card  </button>
            <div>
                <span onClick={() => {
                    setCount(prev => prev - 1)
                    decreaseCount(product._id)
                }}> -</span>
                {count}
                <span onClick={() => {
                    setCount(prev => prev + 1)
                    increaseCount(product._id)
                }}> +</span>
            </div>
        </div>
    )
}
