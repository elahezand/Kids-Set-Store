import { LuRefreshCw, LuRuler, LuShieldCheck, LuTruck } from "react-icons/lu";

const PROMISES = [
  { icon: LuTruck, title: "Free shipping", text: "On every order over $50" },
  { icon: LuRefreshCw, title: "30-day returns", text: "Kids grow fast, we get it" },
  { icon: LuShieldCheck, title: "Kid-safe fabrics", text: "Soft, tested, skin-friendly" },
  { icon: LuRuler, title: "Sizes 0–14", text: "From first steps to teens" },
];

export default function TrustStrip() {
  return (
    <section aria-label="Why shop with us" className="border-y border-gray-200 dark:border-white/10">
      <ul className="container-x grid grid-cols-2 gap-x-4 gap-y-6 py-6 lg:grid-cols-4 lg:py-8">
        {PROMISES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <Icon className="mt-0.5 size-6 shrink-0 text-sage-600 dark:text-sage-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-text-dark dark:text-gray-100 sm:text-base">{title}</p>
              <p className="text-xs text-gray-700 dark:text-gray-500 sm:text-sm">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
