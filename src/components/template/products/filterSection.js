"use client"
import React, { useCallback, useEffect, useState } from 'react'
import styles from "./filterSection.module.css"
import Link from 'next/link'

const materials = ["Catton", "Leather", "Wool", "Velvet", "Suede", "Linen", "Chashmere", "Polyester"]
const colors = ["Blue", "Red", "Brown", "Gray", "Black", "Pink", "Metalic", "White", "Green", "Cream", "Camel"]

export default function FilterSection({ categories, data, setProducts }) {
    const [sort, setSort] = useState("-1")
    const sortingHandeler = useCallback(() => {
        switch (sort) {
            case ("popularity"):
                setProducts([...data].sort((a, b) => b.score - a.score))
                break;

            case "latest":
                setProducts([...data].reverse())
                break;

            case "price":
                setProducts([...data].sort((a, b) => a.price - b.price))
                break;

        }
    }, [data, setProducts, sort])

    useEffect(() => {
        sortingHandeler()
    }, [sortingHandeler])


    const colorHandeler = async (e) => setProducts([...data].filter(item => item.color === e.target.value))
    const materialHandeler = async (e) => setProducts([...data].filter(item => item.material.includes(e.target.value)))
    const priceHandeler = async (e) => setProducts([...data].filter(item => item.price < e.target.value))

    return (
        <>
            <div className={styles.container_filters}>
                <div className={styles.products_top_bar__selection}>
                    <span className={styles.products_top_bar__selection_title}>
                        <i className={styles.products_top_bar__selection_icon}></i>
                        Price
                    </span>
                    <ul className={styles.products_top_bar__selection_list}>
                        <div>
                            <span>0</span>
                            <input
                                onChange={(e) => priceHandeler(e)}
                                type="range"
                                min="0"
                                max="400"></input>
                            <span>$400</span>
                        </div>
                    </ul>
                </div>
                <div className={styles.products_top_bar__selection}>
                    <select className={styles.products_top_bar__selection_title}
                        onChange={(e) => setSort(e.target.value)}>
                        <option className={styles.products_top_bar__selection_item} value="-1" >Sorting</option>
                        <option className={styles.products_top_bar__selection_item} value="popularity">sort by popularity</option>
                        <option className={styles.products_top_bar__selection_item} value="latest">sort by Latest  </option>
                        <option className={styles.products_top_bar__selection_item} value="price" >sort by Price </option>
                    </select>
                </div>
                <div className={styles.products_top_bar__selection}>
                    <span className={styles.products_top_bar__selection_title}>
                        <i className={styles.products_top_bar__selection_icon}></i>
                        Category
                    </span>
                    <ul className={styles.products_top_bar__selection_list}>
                        {categories.length > 0 && categories.map((item, index) => (
                            !item.parentId &&
                            <Link href={`/products?category=${item.name}`}
                                key={index + 1}
                                className={styles.products_top_bar__selection_item}>
                                {item.name}</Link>
                        ))}
                    </ul>
                </div>
                <div className={styles.products_top_bar__selection}>
                    <select
                        onChange={(e) => materialHandeler(e)}
                        className={styles.products_top_bar__selection_title}>
                        <option
                            className={styles.products_top_bar__selection_item} value={"-1"} >Material</option>
                        {materials.map((item, index) => (
                            <option key={index + 1}
                                className={styles.products_top_bar__selection_item}
                                value={item} >{item}</option>

                        ))}
                    </select>
                </div>
                <div className={styles.products_top_bar__selection}>
                    <select className={styles.products_top_bar__selection_title}
                        onChange={(e) => colorHandeler(e)}>
                        <option
                            className={styles.products_top_bar__selection_item}
                            value={"-1"} >Color</option>

                        {colors.map((item, index) => (
                            <option key={index + 1}
                                className={styles.products_top_bar__selection_item}
                                value={item} >{item}</option>

                        ))}
                    </select>
                </div>
            </div>
        </>
    )
}
