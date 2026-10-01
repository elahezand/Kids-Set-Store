"use client";

import { useState } from "react";
import Description from "@/components/template/main/product/description";
import MoreInfoes from "@/components/template/main/product/moreInfos";

const TABS = [
    { id: "description", label: "Explanation" },
    { id: "moreInfoes", label: "More Infos" },
];

const Tabs = ({ longDescription, specs }) => {
    const [activeTab, setActiveTab] = useState(TABS[0].id);

    return (
        <div data-aos="fade-left" className="relative w-full py-10">
            <ul
                role="tablist"
                className="mx-auto mb-2.5 flex w-full max-w-[390px] items-end justify-between gap-2"
            >
                {TABS.map(({ id, label }) => {
                    const isActive = activeTab === id;
                    return (
                        <li key={id} className="flex-1 px-2 text-center">
                            <button
                                type="button"
                                role="tab"
                                id={`tab-${id}`}
                                aria-selected={isActive}
                                aria-controls={`panel-${id}`}
                                onClick={() => setActiveTab(id)}
                                className={`relative block w-full cursor-pointer pt-5 text-sm transition-colors duration-200 sm:text-base
                                    after:absolute after:right-0 after:top-0 after:h-[3px] after:bg-sage-400 after:transition-all
                                    ${
                                        isActive
                                            ? "text-black after:w-full dark:text-white"
                                            : "text-gray-500 after:w-0 dark:text-gray-400"
                                    }`}
                            >
                                {label}
                            </button>
                        </li>
                    );
                })}
            </ul>

            <section
                role="tabpanel"
                id={`panel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
                className="mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-sage-400 [&_p]:mt-5"
            >
                {activeTab === "description" ? (
                    <Description description={longDescription} />
                ) : (
                    <MoreInfoes  specs={specs} />
                )}
            </section>
        </div>
    );
};

export default Tabs;