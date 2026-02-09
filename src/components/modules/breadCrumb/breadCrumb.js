import React from "react";
import Link from "next/link";
import styles from "./breadCrumb.module.css"
const Breadcrumb = ({ title, route }) => {
    return (
        <section className={styles.breadcrumb}>
            <Link href="/">Home </Link>
            <span>/</span>
            <Link href={route}> {route} </Link>
            <span>/</span>
            <p>{title}</p>
        </section>
    );
};

export default Breadcrumb;
