import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";

const Stepper = ({ step }) => {
    const itemClass = (active) =>
        `mb-1 inline-block text-base uppercase leading-tight opacity-70 sm:text-lg md:text-[22px] ${active ? "!opacity-100" : ""
        }`;

    return (
        <div className="relative mt-16 h-[220px] w-full bg-[url('/images/ba9c3ec47af5f0eb6b5c62469d32e7c5.jpg')] bg-contain bg-center bg-no-repeat p-4 sm:h-[350px] sm:p-8 md:h-[500px] lg:h-[700px]">
            <div className="absolute inset-x-0 -bottom-8 flex flex-wrap items-center justify-center gap-3 bg-sage-400 p-2 text-white sm:gap-[18px]">
                <Link className={itemClass(step === "cart")} href="/cart">
                    Shopping Card
                </Link>
                <FaArrowRightLong className="text-lg opacity-70" />
                {step === "checkout" || step === "complate" ? (
                    <Link className={itemClass(step === "checkout")} href="/checkout">
                        Pay
                    </Link>
                ) : (
                    <p className={itemClass(false)}>Pay</p>
                )}
                <FaArrowRightLong className="text-lg opacity-70" />
                {step === "complate" ? (
                    <Link className={itemClass(true)} href="/complate">
                        Complete Order
                    </Link>
                ) : (
                    <p className={itemClass(false)}>Complete Order</p>
                )}
            </div>
        </div>
    );
};

export default Stepper;