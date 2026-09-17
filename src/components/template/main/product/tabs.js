"use client";
import { useState } from "react";
import Description from "./description";
import MoreInfoes from "./moreInfos";
const Tabs = ({ longDescription, availableSizes, color, material }) => {
  const [tab, setTab] = useState("description");

  const labelClass = (name) =>
    `relative block cursor-pointer overflow-hidden pt-5 text-sm transition-all duration-200 sm:text-base ${tab === name ? "text-black after:absolute after:right-0 after:top-0 after:h-[3px] after:w-full after:bg-sage-400" : "text-gray-500 dark:text-gray-400 after:absolute after:right-0 after:top-0 after:h-[3px] after:w-0 after:bg-sage-400"
    }`;

  return (
    <div data-aos="fade-left" className="relative w-full py-10">
      <ul className="mx-auto mb-2.5 flex w-full max-w-[390px] flex-wrap items-end justify-between gap-2">
        <li className="box-border flex-1 px-2 text-center" title="Features">
          <button type="button" onClick={() => setTab("description")} className={labelClass("description")}>
            Explnation
          </button>
        </li>
        <li className="box-border flex-1 px-2 text-center" title="Delivery Contents">
          <button type="button" onClick={() => setTab("moreInfoes")} className={labelClass("moreInfoes")}>
            More Infos
          </button>
        </li>
      </ul>
      <div className="mt-8">
        {tab === "description" && (
          <section className="[&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-sage-400 [&_p]:mt-5">
            <Description description={longDescription} />
          </section>
        )}
        {tab === "moreInfoes" && (
          <section className="[&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-sage-400 [&_p]:mt-5">
            <MoreInfoes material={material} availableSizes={availableSizes} color={color} />
          </section>
        )}
      </div>
    </div>
  );
};

export default Tabs;
