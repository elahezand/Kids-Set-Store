import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from "./categories.module.css"

export default function Categories() {
    return (
        <div className="container">
            <div className={styles.category_header}
                data-aos="fade-left">
                <div className={styles.category_header__img}>
                    <Image
                        width={200}
                        height={200}
                        src="/images/490a40bb19dac47739156dbe7ac0ceb6.jpg"
                        alt="" />

                </div>
                <h2 className={styles.category_header__title}>Categorie</h2>
            </div>

            <div className={styles.categories_container}
                data-aos="fade-right">
                <div
                    className={styles.category_box}>
                    <div className={styles.category_box__title}>
                        <small>Kids</small>
                        <h3>Girls & Boys</h3>
                    </div>
                    <div className={styles.category_box__img}>
                        <Link href={`/products/category/Kids?page=1`}>
                            <Image
                                width={200}
                                height={200}
                                src="/images/3d13c0c692c13e3a2b23ec4aada83643.jpg"
                                className="avatar-image img-fluid"
                                alt="" />
                        </Link>
                    </div>
                </div>

                <div
                    className={styles.category_box}>
                    <div className={styles.category_box__title}>
                        <small>Toddlers</small>
                        <h3>Girls & Boys</h3>
                    </div>
                    <div className={styles.category_box__img}>
                        <Link href={`/products/category/Toddelers?page=1`}>
                            <Image
                                width={200}
                                height={200}
                                src="/images/be27ba179f604eecc99ae2e18cb2c1d0.jpg"
                                className="avatar-image img-fluid"
                                alt="" />
                        </Link>
                    </div>
                </div>
                <div
                    className={styles.category_box}>
                    <div className={styles.category_box__title}>
                        <small>Shoes</small>
                        <h3>Girls & Boys</h3>
                    </div>
                    <div className={styles.category_box__img}>
                        <Link href={`/products/category/Shoes?page=1`}>
                            <Image
                                width={200}
                                height={200}
                                src="/images/58a9656fc91cd2625e04e78334ee367c.jpg"
                                className="avatar-image img-fluid"
                                alt="" />
                        </Link>
                    </div>
                </div>
                <div
                    className={styles.category_box}>
                    <div className={styles.category_box__title}>
                        <small>Baby</small>
                        <h3>Girls & Boys</h3>
                    </div>
                    <div className={styles.category_box__img}>
                        <Link href={`/products/category/Baby?page=1`}>
                            <Image
                                width={200}
                                height={200}
                                src="/images/e7b713eecc952b345214d544b8da1ad1.jpg"
                                className="avatar-image img-fluid"
                                alt="" />
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    )
}
