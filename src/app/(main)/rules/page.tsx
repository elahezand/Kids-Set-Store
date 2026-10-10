import Image from "next/image";
import Link from "next/link";
import { LuMail, LuPhone } from "react-icons/lu";
import Breadcrumb from "@/components/modules/main/breadcrumb";
import infoService from "@/services/server/public/info";
import { ROUTES } from "@/utils/constants";
import type { Metadata } from "next";
import type { SiteInfo } from "@/types";

export const metadata: Metadata = {
  title: "Terms & Rules | SET KIDS",
  description: "Shopping rules, delivery and return policy of Set Kids.",
};

interface Rule {
  title: string;
  points: string[];
}

const RULES: Rule[] = [
  {
    title: "Orders",
    points: [
      "You need an account to place an order, so you can follow it from your dashboard.",
      "Prices and stock are checked again when you pay. If an item runs out in the meantime, it is removed from the cart before payment.",
      "You can cancel an order yourself from your dashboard until it has been shipped.",
    ],
  },
  {
    title: "Payment",
    points: [
      "You can pay online through the secure payment gateway, with your Set Kids wallet, or in cash on delivery.",
      "Discount codes are applied in the cart. Each code has its own conditions, such as an end date or a limited number of uses.",
      "If a paid order is cancelled, the amount is returned to your Set Kids wallet, ready for your next purchase.",
    ],
  },
  {
    title: "Shipping & delivery",
    points: [
      "Most items are prepared and shipped within 3 days. You will see the tracking code in your dashboard once the order is on its way.",
      "When the parcel arrives, please confirm the delivery in your dashboard. If you don't, the order is completed automatically a few days after its delivery date.",
      "For cash orders, please have the amount ready when the parcel is delivered.",
    ],
  },
  {
    title: "Returns & exchanges",
    points: [
      "If an item doesn't fit or arrives damaged, open a support ticket within 7 days of delivery and we will help with an exchange or a return.",
      "Returned items should be unworn and unwashed, with their original tags and packaging.",
      "Refunds for returned items are paid to your Set Kids wallet once the item has been checked.",
    ],
  },
  {
    title: "Reviews & your account",
    points: [
      "Product reviews are checked before they appear in the store. Reviews that are offensive or off-topic are not published.",
      "Keep your login details private. You are responsible for orders placed from your account.",
      "Your contact details are used only to process your orders and answer your messages.",
    ],
  },
];

export default async function RulesPage() {
  const info = (await infoService.getSiteInfo()) as SiteInfo | null;

  return (
    <div className="page-container text-text dark:text-gray-100">
      <Breadcrumb route="rules" title="Terms & Rules" />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[40%_1fr] md:gap-12">
        <div className="md:sticky md:top-28 md:self-start">
          <Image
            width={600}
            height={600}
            alt=""
            src="/images/c9da3b64fef2bc7cccf83bf5b420afdc.jpg"
            className="h-[260px] w-full rounded-2xl object-cover shadow-card sm:h-[380px] md:h-[520px]"
          />
        </div>

        <div data-aos="fade-up">
          <span className="text-sm font-semibold text-coral-500 dark:text-coral-400">Terms & Rules</span>
          <h1 className="my-2.5 text-2xl font-bold sm:text-3xl">Shopping at Set Kids</h1>
          <p className="leading-8 text-gray-700 dark:text-gray-300">
            These rules explain how ordering, payment, delivery and returns work in our store. By placing an order you
            agree to them. If something is unclear, we are happy to help.
          </p>

          <ol className="mt-8 space-y-8">
            {RULES.map((rule, index) => (
              <li key={rule.title}>
                <h2 className="flex items-center gap-3 text-lg font-bold sm:text-xl">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                    {index + 1}
                  </span>
                  {rule.title}
                </h2>
                <ul className="mt-3 space-y-2 pl-11">
                  {rule.points.map((point) => (
                    <li
                      key={point}
                      className="relative leading-7 text-gray-700 before:absolute before:top-3 before:-left-4 before:size-1.5 before:rounded-full before:bg-coral-400 dark:text-gray-300"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <section className="mt-10 rounded-2xl bg-brand-50 p-6 dark:bg-ink-950">
            <h2 className="font-bold">Questions?</h2>
            <p className="mt-1 text-sm leading-7 text-gray-700 dark:text-gray-400">
              We answer during business hours. Write to us from the{" "}
              <Link
                href={ROUTES.contact}
                className="font-medium text-brand-700 underline-offset-4 hover:underline dark:text-brand-300"
              >
                contact page
              </Link>{" "}
              or reach us directly:
            </p>
            {(info?.phone || info?.email) && (
              <ul className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:gap-6">
                {info?.phone && (
                  <li className="flex items-center gap-2">
                    <LuPhone className="size-4 text-brand-600 dark:text-brand-400" />
                    <a href={`tel:${info.phone.replace(/[^\d+]/g, "")}`} className="hover:text-coral-500">
                      {info.phone}
                    </a>
                  </li>
                )}
                {info?.email && (
                  <li className="flex items-center gap-2">
                    <LuMail className="size-4 text-brand-600 dark:text-brand-400" />
                    <a href={`mailto:${info.email}`} className="hover:text-coral-500">
                      {info.email}
                    </a>
                  </li>
                )}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
