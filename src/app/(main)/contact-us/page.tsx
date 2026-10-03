import Image from "next/image";
import { LuMail, LuMapPin, LuPhone } from "react-icons/lu";
import Breadcrumb from "@/components/modules/main/breadcrumb";
import ContactForm from "@/components/template/main/contact-us/contactForm";
import MapLoader from "@/components/template/main/contact-us/mapLoader";
import connectToDB from "@/configs/db";
import infoService from "@/services/server/public/info";
import type { Metadata } from "next";
import type { IconType } from "react-icons";
import type { SiteInfo } from "@/types";

export const metadata: Metadata = {
  title: "Contact Us | SET KIDS",
  description: "Get in touch with Set Kids for questions, feedback or support.",
  openGraph: {
    title: "Contact Us | SET KIDS",
    description: "Get in touch with Set Kids for questions, feedback or support.",
    type: "website",
  },
};

interface ContactLine {
  Icon: IconType;
  text: string;
  href?: string;
}

export default async function ContactPage() {
  await connectToDB();
  const info = (await infoService.getInfo().catch(() => null)) as SiteInfo | null;

  const details = [
    info?.address && { Icon: LuMapPin, text: info.address },
    info?.phone && { Icon: LuPhone, text: info.phone, href: `tel:${info.phone.replace(/[^\d+]/g, "")}` },
    info?.email && { Icon: LuMail, text: info.email, href: `mailto:${info.email}` },
  ].filter((line): line is ContactLine => Boolean(line));

  return (
    <div className="page-container text-text dark:text-gray-100">
      <Breadcrumb route="contact-us" title="Contact Us" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col items-center justify-center gap-6">
          <Image
            width={200}
            height={200}
            alt=""
            priority
            src="/images/59aa50c82c33be2762280e2c0939bde3.jpg"
            className="h-[140px] w-full object-contain sm:h-[180px]"
          />

          {details.length > 0 && (
            <ul className="flex w-full flex-col gap-3 rounded-2xl bg-mint-200/60 p-5 text-sm dark:bg-ink-800">
              {details.map(({ Icon, text, href }) => (
                <li key={text} className="flex items-center gap-3">
                  <Icon className="size-4 shrink-0 text-sage-600" />
                  {href ? (
                    <a href={href} className="hover:text-coral-400">
                      {text}
                    </a>
                  ) : (
                    <span>{text}</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <ContactForm />
        </div>
        <div className="h-[350px] overflow-hidden rounded-2xl shadow-card sm:h-[450px] md:h-full">
          <MapLoader />
        </div>
      </div>
    </div>
  );
}
