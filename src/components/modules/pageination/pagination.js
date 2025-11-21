import React from 'react'
import styles from "./pagination.module.css"
import Link from 'next/link'

export default function Pagination({ pageCount, href, currentPage }) {
    console.log(currentPage);

    return (
        <ul className={styles.pagination_container}>
            {new Array(pageCount).fill(0).map((item, index) => (
                <li className={`${styles.page} ${Number(currentPage) === index + 1 ?
                    `${styles.active}` : null}`}
                    key={index + 1}>
                    <Link href={`${href}page=${index + 1}`}>
                        {index + 1}</Link>
                </li>
            ))}
        </ul>
    )
}

