import Link from "next/link";
import Image from "next/image";

const Promote = () => {
    return (
        <div className="page-container">
            <div className="flex w-full flex-col gap-6 sm:gap-8">
                <div className="flex w-full flex-col items-center justify-between gap-4 overflow-hidden rounded-3xl shadow-card md:flex-row-reverse md:gap-0" data-aos="fade-up-right">
                    <div className="hidden w-full overflow-hidden md:block md:w-1/2">
                        <Image width={400} height={450} data-aos="fade-left" src="/images/kid-store-boys-summer.png" alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="relative flex h-[260px] w-full items-end bg-mint-200 p-6 text-left text-white sm:h-[320px] sm:p-8 md:h-[380px] md:w-1/2">
                        <div className="w-full max-w-[280px] rounded-2xl bg-white p-4 text-center shadow-float dark:bg-gray-800 sm:p-5">
                            <span className="block w-full text-base font-bold text-text dark:text-gray-100 sm:text-lg md:text-xl">Set Kids Club</span>
                            <p className="mt-2 w-full text-sm text-text dark:text-gray-100 sm:text-base">Royal Customers Of Set Kids</p>
                        </div>
                    </div>
                </div>

                <div className="flex w-full flex-col items-center justify-between gap-4 overflow-hidden rounded-3xl shadow-card md:flex-row-reverse md:gap-0" data-aos="fade-up-left">
                    <div className="flex w-full flex-col justify-center gap-4 bg-peach-200 p-6 sm:p-8 md:w-1/2">
                        <div className="rounded-2xl bg-white p-4 dark:bg-gray-800 sm:p-5">
                            <p className="text-lg font-bold text-text dark:text-gray-100 sm:text-xl md:text-2xl">Why Set Kids ?</p>
                        </div>
                        <div className="max-h-[220px] overflow-y-auto rounded-2xl bg-white p-4 text-sm leading-7 text-text dark:bg-gray-800 dark:text-gray-100 sm:p-5 sm:text-base">
                            With years of experience and feedback from parents Set kids offer a wide range of stylish and comfortable childrens clothing
                            .our mission is to make shopping easier for families by provoding trendy,high quality outfits at affordable prices
                        </div>
                        <div className="hidden gap-3 md:flex">
                            <Link href="/about-us" className="btn btn-secondary">
                                About US
                            </Link>
                            <Link href="/category" className="btn btn-secondary">
                                Store
                            </Link>
                        </div>
                    </div>
                    <div className="hidden w-full overflow-hidden md:block md:w-1/2">
                        <Image width={400} height={450} src="/images/kid-store-girls-winter.png" alt="" className="h-full w-full object-cover" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Promote;
