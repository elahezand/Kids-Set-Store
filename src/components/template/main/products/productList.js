"use client"
import Product from '@/components/modules/main/product'

export default function ProductsList({ data }) {
    return (
        <div data-aos="fade-up" className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 xl:grid-cols-5">
            {(data?.data.map((item) => (
                <Product {...item} key={item._id} />
            )))}
        </div>
    )
}
