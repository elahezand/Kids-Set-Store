"use client"
import { useMemo } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import qs from "qs"

const materials = ["Catton", "Leather", "Wool", "Velvet", "Suede", "Linen", "Chashmere", "Polyester"]
const colors = ["Blue", "Red", "Brown", "Gray", "Black", "Pink", "Metalic", "White", "Green", "Cream", "Camel"]

export default function FilterSection({ categories }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPage = Number(searchParams.get("page")) || 1;
    const currentFilters = useMemo(() => ({
        category: searchParams.get("category") || "",
        min: searchParams.get("min") || "",
        max: searchParams.get("max") || "",
        color: searchParams.get("color") || "",
        material: searchParams.get("material") || "",
        sort: searchParams.get("sort") || "",
        page: currentPage,
        limit: searchParams.get("limit") || 6,
        value: searchParams.get("value") || ""
    }), [searchParams, currentPage]);

    const handleFilterChange = (newFilterParams) => {
        const updatedFilters = { ...currentFilters, ...newFilterParams, page: 1 };
        const cleanParams = Object.fromEntries(
            Object.entries(updatedFilters)
                .filter(([_, v]) => v !== "" && v !== null && v !== undefined && v !== "-1")
        );
        const queryString = qs.stringify(cleanParams, { encode: false });
        router.push(`${pathname}?${queryString}`, { scroll: true });
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        handleFilterChange({ [name]: value === "-1" ? "" : value });
    };

    const boxClass = "group relative w-full cursor-pointer rounded-xl bg-sage-400 px-2";
    const titleClass = "flex w-full items-center justify-center rounded-xl border-2 border-coral-300 bg-white dark:bg-ink-800 px-4 py-3 text-sm text-text dark:text-gray-100 outline-none transition-all duration-300 sm:text-base";
    const listClass = "invisible absolute left-0 top-full z-[999] mt-1.5 flex w-full flex-col rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-ink-800 py-2 text-text dark:text-gray-100 opacity-0 shadow-float transition-all duration-300 group-hover:visible group-hover:opacity-100";

    return (
        <div className="mb-8 grid grid-cols-1 gap-3 rounded-2xl bg-mint-200 p-4 shadow-card sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <div className={boxClass}>
                <span className={titleClass}>Price: ${currentFilters?.max || 400}</span>
                <ul className={listClass}>
                    <div className="flex items-center gap-2.5 p-2">
                        <span>0</span>
                        <input name="max" onChange={handleSelectChange} type="range" min="0" max="400" value={currentFilters?.max || 400} className="w-full" />
                        <span>$400</span>
                    </div>
                </ul>
            </div>

            <div className={boxClass}>
                <select name="sort" className={titleClass} onChange={handleSelectChange}>
                    <option value="-1">Sorting</option>
                    <option value="popularity">sort by popularity</option>
                    <option value="latest">sort by Latest</option>
                    <option value="price">sort by Price</option>
                </select>
            </div>

            <div className={boxClass}>
                <span className={titleClass}>Category</span>
                <ul className={listClass}>
                    {categories.map((item, index) => (
                        !item.parentId &&
                        <button
                            key={index}
                            onClick={() => handleFilterChange({ category: item.name })}
                            className="cursor-pointer border-0 bg-transparent p-2 text-left text-sm text-text dark:text-gray-100 transition-all hover:!bg-blue-600 hover:text-white sm:text-base"
                        >
                            {item.name}
                        </button>
                    ))}
                </ul>
            </div>

            <div className={boxClass}>
                <select name="material" onChange={handleSelectChange} className={titleClass}>
                    <option value="-1">Material</option>
                    {materials.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                </select>
            </div>

            <div className={boxClass}>
                <select name="color" className={titleClass} onChange={handleSelectChange}>
                    <option value="-1">Color</option>
                    {colors.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}
