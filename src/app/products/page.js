import React from 'react'
import connectToDB from '../../../db/db'
import ProductModal from '../../../model/product'
import styles from "@/components/template/index/latest/latest.module.css"
import Navbar from '@/components/modules/navbar/navbar'
import Banner from '@/components/template/index/banner/banner'
import Footer from '@/components/modules/footer/footer'
import Product from '@/components/modules/product/product'
import Pagination from '@/components/modules/pageination/pagination'
import { pageinatedData } from '@/utils/helper'
export default async function page({ searchParams }) {
    connectToDB()
    const param = await searchParams
    const { page, value } = param
    let products = []

    if (value === "bestSelling") {
        products = await ProductModal.find({ score: +4 })
    } else {
        products = await ProductModal.find({}).sort({ _id: -1 })
    }

    const [filteredArray, pageCount] = pageinatedData(products, page, 10)

    return (
        <div>
            <Navbar />
            <Banner />
            <div className="container">
                <section className="title">
                    <div>
                        <span>Products</span>
                    </div>
                </section>
                <main data-aos="fade-up" className={styles.products}>
                    {filteredArray.length ? JSON.parse(JSON.stringify(filteredArray))
                        .map((item, index) => (
                            <Product
                                {...item}
                                key={index + 1} />
                        )) : null}
                </main>
                <Pagination
                    pageCount={pageCount}
                    href={`products?value=${value}&`}
                    currentPage={page}
                />
            </div>
            <Footer />
        </div>
    )
}
