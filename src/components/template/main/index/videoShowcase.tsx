"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { LuArrowUpRight, LuPlay } from "react-icons/lu";
import SectionHeader from "@/components/modules/main/sectionHeader";
import { ROUTES } from "@/utils/constants";

const VIDEO_SRC = "/setkids-ad-wide.mp4";
const POSTER_SRC = "/setkids-ad-poster.jpg";

const BLOB_PATH =
  "M120 60 C220 0 380 30 470 20 C590 8 720 40 770 130 C820 220 760 330 650 360 C540 390 430 350 320 370 C200 392 70 360 35 260 C0 160 40 100 120 60 Z";

const SPARKLE_PATH = "M12 0 C13 7 17 11 24 12 C17 13 13 17 12 24 C11 17 7 13 0 12 C7 11 11 7 12 0 Z";

const SPARKLES = [
  { className: "right-3 top-1 size-5 sm:right-10 sm:size-8", tint: "text-sun-300 dark:text-sun-500/50" },
  { className: "left-1 top-1/3 size-3 sm:left-3 sm:size-4", tint: "text-coral-300 dark:text-coral-500/50" },
  { className: "bottom-2 right-1/4 size-4 sm:size-6", tint: "text-sky-300 dark:text-sky-500/50" },
];

export default function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);
  const clipId = `video-blob-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }

    let inView = false;

    const play = () => {
      if (!inView) return;
      video
        .play()
        .then(() => setBlocked(false))
        .catch((error: DOMException) => {
          if (error.name === "AbortError") return;
          if (error.name === "NotSupportedError") {
            console.warn(`[VideoShowcase] cannot play ${VIDEO_SRC} - is it in public/videos?`, error);
          }
          setBlocked(true);
        });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) play();
        else video.pause();
      },
      { threshold: 0.2 }
    );
    observer.observe(video);
    video.addEventListener("canplay", play);

    return () => {
      observer.disconnect();
      video.removeEventListener("canplay", play);
    };
  }, []);

  const playNow = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video
      .play()
      .then(() => setBlocked(false))
      .catch((error) => console.warn("[VideoShowcase] play failed", error));
  };

  return (
    <section aria-label="SET KIDS in motion">
      <div className="home-container">
        <SectionHeader
          eyebrow="On the move"
          title="Made for play"
          description="Soft, easy outfits that keep up with every jump, spin and giggle."
          href={ROUTES.products}
          linkLabel="Shop all"
        />

        <div className="relative">
          <svg aria-hidden="true" className="absolute size-0">
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d={BLOB_PATH} transform="scale(0.00125 0.0025)" />
            </clipPath>
          </svg>

          <svg
            aria-hidden="true"
            viewBox="0 0 800 400"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 size-full"
          >
            <path
              d={BLOB_PATH}
              transform="rotate(-3 400 200) translate(-6 14)"
              className="fill-sun-50 dark:fill-sun-500/5"
            />
            <path
              d={BLOB_PATH}
              transform="rotate(4 400 200) translate(14 10)"
              className="fill-sky-50 dark:fill-sky-500/5"
            />
          </svg>

          <div className="relative">
            <div
              className="relative overflow-hidden bg-brand-100 dark:bg-ink-800"
              style={{ clipPath: `url(#${clipId})` }}
            >
              <video
                ref={videoRef}
                src={VIDEO_SRC}
                poster={POSTER_SRC}
                muted
                loop
                playsInline
                autoPlay
                preload="auto"
                aria-hidden="true"
                className="aspect-[16/10] w-full object-cover object-[50%_30%] sm:aspect-[2/1] lg:aspect-[12/5]"
              />
            </div>

            <svg
              aria-hidden="true"
              viewBox="0 0 800 400"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 size-full"
            >
              <path
                d={BLOB_PATH}
                fill="none"
                strokeWidth="1.5"
                strokeDasharray="2 7"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                transform="rotate(-2 400 200)"
                className="stroke-brand-500 dark:stroke-brand-400/50"
              />
            </svg>

            {blocked && (
              <button
                type="button"
                onClick={playNow}
                aria-label="Play the video"
                className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow-float ring-4 ring-white/60 transition hover:scale-105 sm:size-20"
              >
                <LuPlay className="size-7 translate-x-0.5 sm:size-8" aria-hidden="true" />
              </button>
            )}

            <div className="absolute bottom-[8%] left-[6%] hidden max-w-sm items-center gap-4 rounded-2xl bg-white/95 py-3 pr-3 pl-5 shadow-float ring-4 ring-white/60 backdrop-blur-sm sm:flex dark:bg-ink-900/90 dark:ring-ink-900/40">
              <p className="text-base leading-snug font-bold text-text-dark lg:text-lg dark:text-white">
                Play-ready clothes for every age
              </p>
              <Link href={ROUTES.products} className="btn btn-accent shrink-0">
                Shop now <LuArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {SPARKLES.map((sparkle, i) => (
            <svg
              key={i}
              aria-hidden="true"
              viewBox="0 0 24 24"
              className={`pointer-events-none absolute ${sparkle.className} ${sparkle.tint}`}
            >
              <path d={SPARKLE_PATH} fill="currentColor" />
            </svg>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 sm:hidden">
          <p className="text-lg leading-tight font-bold text-text-dark dark:text-white">
            Play-ready clothes for every age
          </p>
          <Link href={ROUTES.products} className="btn btn-accent shrink-0">
            Shop now <LuArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
