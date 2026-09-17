import Link from 'next/link'
import Image from 'next/image'

export default function Categories() {
    return (
        <div className="page-container">
            <div
                className="mx-auto flex w-full max-w-[700px] flex-col items-center justify-center gap-4 rounded-3xl bg-mint-200 p-4 shadow-card sm:flex-row sm:gap-8 sm:p-6"
                data-aos="fade-left"
            >
                <div className="size-[140px] shrink-0 overflow-hidden rounded-full ring-4 ring-white/60 transition-transform duration-500 ease-in-out hover:rotate-180 sm:size-[180px] md:size-[220px]">
                    <Image
                        width={220}
                        height={220}
                        src="/images/490a40bb19dac47739156dbe7ac0ceb6.jpg"
                        alt=""
                        className="h-full w-full object-cover"
                    />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-[42px]">Categorie</h2>
            </div>

            <div
                className="mt-6 grid grid-cols-2 gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-4"
                data-aos="fade-right"
            >
                {[
                    { small: "Kids", category: "Kids", img: "/images/3d13c0c692c13e3a2b23ec4aada83643.jpg" },
                    { small: "Toddlers", category: "Toddelers", img: "/images/be27ba179f604eecc99ae2e18cb2c1d0.jpg" },
                    { small: "Shoes", category: "Shoes", img: "/images/58a9656fc91cd2625e04e78334ee367c.jpg" },
                    { small: "Baby", category: "Baby", img: "/images/e7b713eecc952b345214d544b8da1ad1.jpg" },
                ].map((cat) => (
                    <div key={cat.category} className="group relative aspect-square w-full overflow-hidden rounded-2xl border-4 border-sage-400 bg-white p-4 shadow-card transition-shadow duration-300 hover:shadow-float dark:bg-gray-800">
                        <div>
                            <small className="text-text dark:text-gray-100">{cat.small}</small>
                            <h3 className="text-base font-bold text-text dark:text-gray-100 sm:text-xl md:text-[22px]">Girls & Boys</h3>
                        </div>
                        <div className="absolute left-[30%] top-[70%] flex h-[60%] w-[70%] -translate-x-2/5 -translate-y-1/2 rotate-45 items-center justify-center rounded-2xl bg-mint-200 transition-all duration-500 ease-in-out group-hover:top-[65%] group-hover:h-[60%] group-hover:w-[75%] group-hover:-translate-x-[20%] group-hover:rotate-0">
                            <Link href={`/products?category=${cat.category}`} className="block h-[90%] w-[90%] overflow-hidden rounded-xl">
                                <Image
                                    width={200}
                                    height={200}
                                    src={cat.img}
                                    className="h-full w-full object-cover"
                                    alt=""
                                />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
