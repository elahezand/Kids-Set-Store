import Link from "next/link";

const ClubArt = () => (
  <div className="group relative flex h-full min-h-[300px] w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,var(--color-mint-200),var(--color-sage-300))] p-8">
    <div
      aria-hidden="true"
      className="absolute inset-0 opacity-30 [background-image:radial-gradient(var(--color-sage-600)_1.5px,transparent_1.5px)] [background-size:18px_18px]"
    />
    <div aria-hidden="true" className="absolute -left-10 -top-10 size-40 rounded-full bg-white/40 blur-2xl" />
    <div aria-hidden="true" className="absolute -bottom-12 -right-6 size-48 rounded-full bg-coral-200/50 blur-2xl" />

    <div
      aria-hidden="true"
      className="absolute h-[170px] w-[260px] -rotate-12 rounded-2xl bg-white/50 shadow-float transition-transform duration-500 group-hover:-rotate-[18deg] sm:h-[190px] sm:w-[300px]"
    />
    <div className="relative h-[170px] w-[260px] rotate-6 rounded-2xl bg-[linear-gradient(135deg,var(--color-coral-400),var(--color-coral-600))] p-5 text-white shadow-float transition-transform duration-500 group-hover:rotate-3 sm:h-[190px] sm:w-[300px]">
      <span className="text-xs font-bold tracking-[0.2em] opacity-80">MEMBER CARD</span>
      <p className="mt-1 font-shabnam-bold text-2xl leading-tight">Set Kids Club</p>
      <div className="mt-5 flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-2 w-8 rounded-full bg-white/50" />
        ))}
      </div>
      <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
        <span className="text-sm opacity-90">Royal customer</span>
        <span className="text-2xl">★</span>
      </div>
    </div>

    <span className="absolute left-6 top-8 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-sage-700 shadow-card">
      Free shipping
    </span>
    <span className="absolute right-6 top-20 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-coral-500 shadow-card">
      −10% birthday
    </span>
    <span className="absolute bottom-10 left-10 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-peach-600 shadow-card">
      Early access
    </span>
  </div>
);

const stats = [
  { value: "12k+", label: "Happy families", color: "text-coral-500" },
  { value: "500+", label: "Styles in store", color: "text-sage-600" },
  { value: "4.9", label: "Average rating", color: "text-peach-600" },
  { value: "48h", label: "Fast delivery", color: "text-mint-600" },
];

const StatsArt = () => (
  <div className="relative flex h-full min-h-[300px] w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_70%_30%,var(--color-peach-100),var(--color-coral-200))] p-8">
    <div
      aria-hidden="true"
      className="absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(45deg,var(--color-coral-500)_0_2px,transparent_2px_14px)]"
    />
    <div aria-hidden="true" className="absolute -right-10 -top-10 size-44 rounded-full bg-white/50 blur-2xl" />

    <div className="relative grid w-full max-w-[340px] grid-cols-2 gap-3 sm:gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl bg-white/90 p-4 text-center shadow-card backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 dark:bg-ink-800/90"
        >
          <span className={`block font-shabnam-bold text-3xl leading-none ${s.color}`}>{s.value}</span>
          <span className="mt-1.5 block text-xs text-gray-700 dark:text-gray-500 sm:text-sm">{s.label}</span>
        </div>
      ))}
    </div>
  </div>
);

const Promote = () => {
  return (
    <div className="page-container">
      <div className="flex w-full flex-col gap-6 sm:gap-8">
        <div
          className="flex w-full flex-col items-stretch justify-between gap-0 overflow-hidden rounded-3xl shadow-card md:flex-row-reverse"
          data-aos="fade-up-right"
        >
          <div className="w-full md:w-1/2">
            <ClubArt />
          </div>

          <div className="relative flex h-[260px] w-full items-end bg-mint-200 p-6 text-left sm:h-[320px] sm:p-8 md:h-auto md:w-1/2">
            <div className="w-full max-w-[280px] rounded-2xl bg-white p-4 text-center shadow-float dark:bg-ink-800 sm:p-5">
              <span className="block w-full text-base font-bold text-text dark:text-gray-100 sm:text-lg md:text-xl">
                Set Kids Club
              </span>
              <p className="mt-2 w-full text-sm text-text dark:text-gray-100 sm:text-base">
                Royal Customers Of Set Kids
              </p>
            </div>
          </div>
        </div>

        {/* ───── چرا ما ───── */}
        <div
          className="flex w-full flex-col items-stretch justify-between gap-0 overflow-hidden rounded-3xl shadow-card md:flex-row-reverse"
          data-aos="fade-up-left"
        >
          <div className="flex w-full flex-col justify-center gap-4 bg-peach-200 p-6 sm:p-8 md:w-1/2">
            <div className="rounded-2xl bg-white p-4 dark:bg-ink-800 sm:p-5">
              <p className="text-lg font-bold text-text dark:text-gray-100 sm:text-xl md:text-2xl">Why Set Kids ?</p>
            </div>
            <div className="max-h-[220px] overflow-y-auto rounded-2xl bg-white p-4 text-sm leading-7 text-text dark:bg-ink-800 dark:text-gray-100 sm:p-5 sm:text-base">
              With years of experience and feedback from parents Set kids offer a wide range of stylish and comfortable
              childrens clothing. Our mission is to make shopping easier for families by providing trendy, high quality
              outfits at affordable prices.
            </div>
            <div className="flex gap-3">
              <Link href="/about-us" className="btn btn-secondary">
                About US
              </Link>
              <Link href="/category" className="btn btn-secondary">
                Store
              </Link>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <StatsArt />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promote;