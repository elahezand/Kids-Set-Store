"use client"
import { useState } from 'react'
import useShop from '@/utils/hooks/useShop'

export default function AddToBasket({ name, price, img, id }) {
    const { addTocard, increaseCount, decreaseCount } = useShop()
    const [count, setCount] = useState(1)

    return (
        <div className="mb-5 flex flex-row-reverse flex-wrap items-center justify-end gap-2.5 text-center">
            <button
                onClick={() => addTocard(name, price, img, id, count)}
                className="btn btn-primary"
            >
                Add To Card
            </button>
            <div className="flex w-20 items-center justify-between rounded-lg border-2 border-coral-300">
                <span
                    onClick={() => { setCount(prev => prev - 1); decreaseCount(id) }}
                    className="w-[30%] cursor-pointer border-r-[3px] border-coral-300 py-2.5"
                >
                    -
                </span>
                {count}
                <span
                    onClick={() => { setCount(prev => prev + 1); increaseCount(id) }}
                    className="w-[30%] cursor-pointer border-l-[3px] border-coral-300 py-2.5"
                >
                    +
                </span>
            </div>
        </div>
    )
}
