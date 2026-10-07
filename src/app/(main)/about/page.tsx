import Link from "next/link";
import { LuHeart, LuRuler, LuShieldCheck, LuSparkles } from "react-icons/lu";
import Breadcrumb from "@/components/modules/main/breadcrumb";
import { ROUTES } from "@/utils/constants";
import type { Metadata } from "next";
import type { IconType } from "react-icons";

export const metadata: Metadata = {
  title: "About Us | SET KIDS",
  description: "Our story, mission and values.",
  openGraph: {
    title: "About Us | SET KIDS",
    description: "Our story, mission and values.",
    type: "website",
  },
};

interface Value {
  Icon: IconType;
  title: string;
  text: string;
  tone: string;
}

const VALUES: Value[] = [
  {
    Icon: LuHeart,
    title: "Comfort first",
    text: "Soft fabrics, flat seams and easy fastenings, so kids can run, climb and nap in the same outfit.",
    tone: "bg-coral-50 text-coral-500 dark:bg-coral-500/10 dark:text-coral-400",
  },
  {
    Icon: LuShieldCheck,
    title: "Made to last",
    text: "Strong stitching and colors that survive the washing machine, ready to be handed down.",
    tone: "bg-sage-50 text-sage-600 dark:bg-sage-500/10 dark:text-sage-300",
  },
  {
    Icon: LuRuler,
    title: "Sizes that fit",
    text: "Clear size charts from first steps to fourteen, so ordering online is no guesswork.",
    tone: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  },
  {
    Icon: LuSparkles,
    title: "Fun to wear",
    text: "Bright colors and playful details that kids actually want to put on in the morning.",
    tone: "bg-sun-50 text-sun-700 dark:bg-sun-500/10 dark:text-sun-400",
  },
];

export default function AboutPage() {
  return (
    <div className="page-container text-text dark:text-gray-100">
      <Breadcrumb route="about" title="About Us" />

      <section className="max-w-3xl">
        <span className="text-sm font-semibold text-coral-500 dark:text-coral-400">About Us</span>
        <h1 className="my-2.5 text-2xl font-bold sm:text-3xl">Clothes made for the way kids really play</h1>
        <p className="leading-8 text-gray-700 dark:text-gray-300">
          Set Kids is a children&apos;s clothing store for every stage, from first steps to fourteen. We pick each piece
          with parents in mind and test it against what children do all day: running, rolling on the floor and growing
          out of everything far too fast.
        </p>
      </section>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:mt-14 md:grid-cols-2 md:gap-12 lg:mt-16">
        <section>
          <h2 className="text-xl font-bold sm:text-2xl">Our story</h2>
          <div className="mt-4 space-y-4 leading-8 text-gray-700 dark:text-gray-300">
            <p>
              Set Kids started with a simple frustration: kids&apos; clothes that looked great in the shop but lost
              their shape after two washes, or were too stiff for a child to move in. We wanted clothes that could keep
              up with real days, not just photos.
            </p>
            <p>
              So we focus on a small set of things and do them carefully: breathable fabrics, honest sizes, prices that
              make sense for something a child will outgrow, and a shop that is easy to use on a busy evening. Feedback
              from parents shapes what we add next.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-coral-500 p-6 text-white shadow-card sm:p-10 dark:bg-coral-600">
          <span className="text-sm font-semibold text-white/85">Our mission</span>
          <h2 className="my-2.5 text-2xl font-bold sm:text-3xl">Happy kids, calm parents</h2>
          <p className="mt-4 leading-8 text-white/95">
            We want getting dressed to be the easy part of the day. That means clothes kids are comfortable in and proud
            to wear, and a shopping experience parents can trust: clear details on every product, real photos, and
            support that answers when you have a question.
          </p>
          <Link
            href={ROUTES.products}
            className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-coral-600 transition-colors hover:bg-coral-50"
          >
            Browse the collection
          </Link>
        </section>
      </div>

      <section className="mt-14 sm:mt-16 lg:mt-20">
        <h2 className="text-xl font-bold sm:text-2xl">What we care about</h2>
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ Icon, title, text, tone }) => (
            <li
              key={title}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card dark:border-white/10 dark:bg-ink-800"
            >
              <span className={`flex size-11 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1.5 text-sm leading-7 text-gray-700 dark:text-gray-400">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl bg-sage-50 p-6 sm:mt-16 sm:flex-row sm:items-center sm:p-8 dark:bg-ink-950">
        <div>
          <h2 className="text-lg font-bold sm:text-xl">Have a question about a size or an order?</h2>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-400">We read every message and reply as soon as we can.</p>
        </div>
        <Link href={ROUTES.contact} className="btn btn-primary shrink-0">
          Contact us
        </Link>
      </section>
    </div>
  );
}