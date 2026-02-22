"use client"
import React from 'react'
import styles from "./pagination.module.css"
import Link from 'next/link'
import qs from 'qs'

export default function Pagination({ pageCount, href, currentPage }) {

    if (!pageCount || pageCount <= 1) return null;

    return (
        <ul className={styles.pagination_container}>
            {Array.from({ length: pageCount }, (_, index) => {
                const pageNumber = index + 1;
                const hrefWithPage = href + (href.includes('?') ? '&' : '?') + qs.stringify({ page: pageNumber });

                return (
                    <li
                        key={pageNumber}
                        className={`${styles.page} ${currentPage === pageNumber ? styles.active : ''}`}
                    >
                        <Link href={hrefWithPage}>
                            {pageNumber}
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}