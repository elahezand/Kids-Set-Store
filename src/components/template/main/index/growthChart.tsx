import Link from "next/link";


const MAX_AGE = 14;
const TICKS = Array.from({ length: MAX_AGE * 4 + 1 }, (_, i) => i / 4);

const tickHeight = (age: number) => (age % 1 === 0 ? "h-6 sm:h-8" : age % 0.5 === 0 ? "h-3.5 sm:h-4" : "h-2 sm:h-2.5");

export default function GrowthChart() {
  return (
    <section aria-labelledby="growth-heading" className="w-full bg-sage-50 dark:bg-ink-800">
      <div className="container-x py-12 sm:py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              id="growth-heading"
              className="max-w-[16ch] font-shabnam-bold text-3xl leading-tight tracking-tight text-text-dark dark:text-white sm:text-4xl lg:text-5xl"
            >
              Made for every growth spurt
            </h2>
            <p className="mt-3 max-w-[46ch] text-base leading-7 text-gray-700 dark:text-gray-400">
              Sizes from newborn to 14, cut with room to move. If it doesn&apos;t fit, you have 30 days to send it back.
            </p>
          </div>

          <Link href="/products" className="btn btn-lg btn-primary w-max shrink-0 rounded-full px-7">
            Shop all sizes
          </Link>
        </div>

        {/* the tape */}
        <div className="mt-10 sm:mt-12" aria-hidden="true">
          <div className="relative overflow-hidden rounded-2xl bg-white pb-8 pl-6 pr-5 text-sage-700 shadow-card ring-1 ring-sage-100 dark:bg-ink-900 dark:text-sage-300 dark:ring-white/10 sm:pb-10 sm:pl-8 sm:pr-6">
            {/* soft tab at the start of the tape */}
            <span className="absolute inset-y-0 left-0 w-3 bg-coral-200 dark:bg-coral-400/60 sm:w-4" />

            <div className="flex items-start justify-between">
              {TICKS.map((age) => (
                <span key={age} className="relative flex w-px flex-col items-center">
                  <span className={`w-px rounded-full bg-sage-300 dark:bg-sage-600 ${tickHeight(age)}`} />
                  {age % 2 === 0 && (
                    <span className="absolute top-8 text-sm font-semibold leading-none sm:top-10 sm:text-base">{age}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-2 text-right text-sm text-gray-600 dark:text-gray-500">Age in years</p>
        </div>
      </div>
    </section>
  );
}