import Link from "next/link";
import { PiBackpack, PiDress, PiHoodie, PiPants, PiSneaker, PiTShirt } from "react-icons/pi";
import { ROUTES } from "@/utils/constants";

const items = [
  { icon: PiTShirt, label: "T-shirts", q: "shirt" },
  { icon: PiDress, label: "Dresses", q: "dress" },
  { icon: PiHoodie, label: "Hoodies", q: "hoodie" },
  { icon: PiPants, label: "Pants", q: "pants" },
  { icon: PiSneaker, label: "Shoes", q: "shoe" },
  { icon: PiBackpack, label: "Bags", q: "bag" },
];

const marqueeWords = ["Hoodies", "Denim", "Dresses", "Jackets", "Shoes", "Knitwear", "Basics", "Accessories"];

export default function PromoText() {
  return (
    <section
      aria-labelledby="promo-heading"
      className="full-bleed section-y overflow-hidden bg-[linear-gradient(135deg,var(--color-sage-600),var(--color-sky-500))] dark:bg-[linear-gradient(135deg,var(--color-sage-900),var(--color-sky-900))]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:22px_22px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-white/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -right-16 size-80 rounded-full bg-sky-200/40 blur-3xl"
      />
      <div className="container-x relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div data-aos="fade-right">
          <h2
            id="promo-heading"
            className="max-w-[16ch] font-shabnam-bold text-3xl leading-tight text-white sm:text-4xl lg:text-5xl"
          >
            Dress your little ones beautifully, every day.
          </h2>

          <p className="mt-4 max-w-[46ch] text-base leading-7 text-white/90 sm:text-lg">
            Comfortable, durable and playful clothing for kids — picked by parents, tested by children, and priced so a
            growth spurt is never a problem.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={ROUTES.products} className="btn btn-lg btn-accent rounded-full px-7">
              Shop the collection
            </Link>
            <Link
              href={ROUTES.contact}
              className="btn btn-lg rounded-full border-2 border-white/70 bg-transparent px-7 text-white transition-colors hover:bg-white hover:text-sage-700 focus-visible:ring-white/40"
            >
              Contact us
            </Link>
          </div>
        </div>

        <div data-aos="fade-left">
          <p className="mb-4 text-base font-semibold text-white">Shop by item</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {items.map(({ icon: Icon, label, q }) => (
              <li key={label}>
                <Link
                  href={`/products?q=${encodeURIComponent(q)}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl bg-white/95 px-4 py-5 text-center shadow-card transition-colors hover:bg-white dark:bg-ink-800/90 dark:hover:bg-ink-800"
                >
                  <span className="flex size-14 items-center justify-center rounded-full bg-sage-50 text-sage-600 transition-colors group-hover:bg-coral-500 group-hover:text-white dark:bg-sage-500/15 dark:text-sage-300">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-bold text-text-dark dark:text-gray-100 sm:text-base">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

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
