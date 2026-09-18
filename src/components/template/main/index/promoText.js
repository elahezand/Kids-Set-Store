import Link from "next/link";
import { LuTruck, LuRefreshCw, LuShieldCheck, LuRuler } from "react-icons/lu";

// جایگزین ویدیوی قبلی: یک باند تمام‌عرض کاملاً CSS
// بدون فایل ویدیو (~چند مگابایت کمتر) و بدون افت LCP.
const features = [
    { icon: LuTruck, title: "Free shipping", text: "On every order over $50" },
    { icon: LuRefreshCw, title: "30-day returns", text: "Kids grow fast, we get it" },
    { icon: LuShieldCheck, title: "Kid-safe fabrics", text: "Soft, tested, skin-friendly" },
    { icon: LuRuler, title: "Sizes 0–14", text: "From first steps to teens" },
];

const marqueeWords = ["Hoodies", "Denim", "Dresses", "Jackets", "Shoes", "Knitwear", "Basics", "Accessories"];

export default function PromoText() {
    return (
        <section
            aria-labelledby="promo-heading"
            className="full-bleed section-y overflow-hidden bg-[linear-gradient(135deg,var(--color-sage-400),var(--color-mint-300))] dark:bg-[linear-gradient(135deg,var(--color-sage-800),var(--color-ink-800))]"
        >
            {/* لایه‌های تزئینی */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:22px_22px]"
            />
            <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-white/25 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-16 size-80 rounded-full bg-coral-200/40 blur-3xl" />

            <div className="container-x relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                {/* متن */}
                <div data-aos="fade-right">
                    <h2
                        id="promo-heading"
                        className="max-w-[16ch] font-shabnam-bold text-3xl leading-tight text-white sm:text-4xl lg:text-5xl"
                    >
                        Dress your little ones beautifully, every day.
                    </h2>

                    <p className="mt-4 max-w-[46ch] text-base leading-7 text-white/90 sm:text-lg">
                        Comfortable, durable and playful clothing for kids — picked by parents, tested by children,
                        and priced so a growth spurt is never a problem.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link href="/products" className="btn btn-lg btn-accent rounded-full px-7">
                            Shop the collection
                        </Link>
                        <Link
                            href="/contact-us"
                            className="btn btn-lg rounded-full border-2 border-white/70 bg-transparent px-7 text-white transition-colors hover:bg-white hover:text-sage-700 focus-visible:ring-white/40"
                        >
                            Contact us
                        </Link>
                    </div>

                    <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-white">
                        <div>
                            <dt className="text-sm text-white/80">Happy families</dt>
                            <dd className="font-shabnam-bold text-2xl">12k+</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-white/80">Average rating</dt>
                            <dd className="font-shabnam-bold text-2xl">4.9 / 5</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-white/80">Delivery</dt>
                            <dd className="font-shabnam-bold text-2xl">48h</dd>
                        </div>
                    </dl>
                </div>

                {/* کارت‌های مزیت */}
                <ul className="grid gap-4 sm:grid-cols-2" data-aos="fade-left">
                    {features.map(({ icon: Icon, title, text }) => (
                        <li
                            key={title}
                            className="card-hover rounded-2xl bg-white/95 p-5 shadow-card backdrop-blur-sm dark:bg-ink-800/90"
                        >
                            <span className="flex size-11 items-center justify-center rounded-xl bg-sage-50 text-sage-600 dark:bg-sage-500/15 dark:text-sage-300">
                                <Icon className="size-5" />
                            </span>
                            <h3 className="mt-4 text-base font-bold text-text dark:text-gray-100">{title}</h3>
                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-500">{text}</p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* نوار متحرک دسته‌ها */}
            <div className="relative mt-12 flex overflow-hidden border-y border-white/25 py-4 text-white/90">
                <ul className="marquee-track flex shrink-0 items-center gap-10 pr-10 text-lg font-semibold tracking-wide sm:text-xl">
                    {[...marqueeWords, ...marqueeWords].map((word, i) => (
                        <li key={`${word}-${i}`} className="flex shrink-0 items-center gap-10 whitespace-nowrap">
                            {word}
                            <span aria-hidden="true" className="size-1.5 rounded-full bg-coral-300" />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
