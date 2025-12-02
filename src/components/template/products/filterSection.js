"use client"
import React, { useCallback, useEffect, useState } from 'react'
import styles from "./filterSection.module.css"
import Pagination from '@/components/modules/pageination/pagination'
import { pageinatedData } from '@/utils/helper'
import Product from "../../modules/product/product"
import { useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
export default function FilterSection({ categories, mainProducts }) {
    const params = useParams();
    const searchParams = useSearchParams();

    const slug = params.slug;
    const page = searchParams.get("page");

    const [sort, setSort] = useState("-1")
    const [products, setProducts] = useState([])

    const materials = ["Catton", "Leather", "Wool", "Velvet", "Suede", "Linen", "Chashmere", "Polyester"]
    const colors = ["Blue", "Red", "Brown", "Gray", "Black", "Pink", "Metalic", "White", "Green", "Cream", "Camel"]

    const sortingHandeler = useCallback(() => {
        switch (sort) {
            case ("popularity"):
                setProducts([...mainProducts].sort((a, b) => b.score - a.score))
                break;

            case "latest":
                setProducts([...mainProducts].reverse())
                break;

            case "price":
                setProducts([...mainProducts].sort((a, b) => a.price - b.price))
                break;

            case "-1":
                setProducts([...mainProducts])
                break;;

            default:
                setProducts([...mainProducts])
        }
    }, [sort, mainProducts])

    useEffect(() => {
        sortingHandeler()
    }, [sortingHandeler])


    const colorHandeler = async (e) => {
        setProducts([...mainProducts].filter(item => item.color === e.target.value))
    }

    const materialHandeler = async (e) => {
        setProducts([...mainProducts].filter(item => item.material.includes(e.target.value)))
    }

    const priceHandeler = async (e) => {
        setProducts([...mainProducts].filter(item => item.price < e.target.value))
    }

    const [filteredArray, pageCount] = pageinatedData(products, page, 10)



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
                            <Link href={`/products/category/${item.title}?page=1`} key={index + 1}
                                className={styles.products_top_bar__selection_item}
                                value={item.name}>{item.name}</Link>


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
            <main data-aos="fade-up" className="container">
                <div className={styles.products}>
                    {filteredArray.length ? filteredArray
                        .map((item, index) => (
                            <Product
                                {...item}
                                key={index + 1} />
                        )) : null}
                </div>
            </main>
            <Pagination
                pageCount={pageCount}
                href={`/products/category/${slug}?`}
                currentPage={page}
            />

        </>
    )
}
