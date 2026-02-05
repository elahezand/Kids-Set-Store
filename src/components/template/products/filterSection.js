"use client"
import React from 'react'
import styles from "./filterSection.module.css"

const materials = ["Catton", "Leather", "Wool", "Velvet", "Suede", "Linen", "Chashmere", "Polyester"]
const colors = ["Blue", "Red", "Brown", "Gray", "Black", "Pink", "Metalic", "White", "Green", "Cream", "Camel"]

export default function FilterSection({ categories, onFilterChange, currentParams }) {

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ [name]: value === "-1" ? "" : value });
    };

    return (
        <div className={styles.container_filters}>
            <div className={styles.products_top_bar__selection}>
                <span className={styles.products_top_bar__selection_title}>
                    Price: ${currentParams?.max || 400}
                </span>
                <ul className={styles.products_top_bar__selection_list}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>0</span>
                        <input
                            name="max"
                            onChange={handleSelectChange}
                            type="range"
                            min="0"
                            max="400"
                            value={currentParams?.max || 400}
                        />
                        <span>$400</span>
                    </div>
                </ul>
            </div>

            <div className={styles.products_top_bar__selection}>
                <select 
                    name="sort"
                    className={styles.products_top_bar__selection_title}
                    onChange={handleSelectChange} >
                    <option value="-1">Sorting</option>
                    <option value="popularity">sort by popularity</option>
                    <option value="latest">sort by Latest</option>
                    <option value="price">sort by Price</option>
                </select>
            </div>

            <div className={styles.products_top_bar__selection}>
                <span className={styles.products_top_bar__selection_title}>Category</span>
                <ul className={styles.products_top_bar__selection_list}>
                    {categories.map((item, index) => (
                        !item.parentId &&
                        <button 
                            key={index} 
                            onClick={() => onFilterChange({ category: item.name })}
                            className={styles.products_top_bar__selection_item}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        >
                            {item.name}
                        </button>
                    ))}
                </ul>
            </div>

            <div className={styles.products_top_bar__selection}>
                <select
                    name="material"
                    onChange={handleSelectChange}
                    className={styles.products_top_bar__selection_title}>
                    <option value="-1">Material</option>
                    {materials.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                </select>
            </div>

            <div className={styles.products_top_bar__selection}>
                <select 
                    name="color"
                    className={styles.products_top_bar__selection_title}
                    onChange={handleSelectChange}>
                    <option value="-1">Color</option>
                    {colors.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}