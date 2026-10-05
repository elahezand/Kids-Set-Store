"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LuArrowUpRight, LuPlay } from "react-icons/lu";
import SectionHeader from "@/components/modules/main/sectionHeader";
import { ROUTES } from "@/utils/constants";

const VIDEO_SRC = "/setkids-ad-wide.mp4";
const POSTER_SRC = "/setkids-ad-poster.jpg";

export default function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);

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
          // AbortError = a pause()/new load interrupted play(): not a refusal, the next event retries
          if (error.name === "AbortError") return;
          // NotSupportedError = the file can't be loaded (wrong path / missing file / codec)
          if (error.name === "NotSupportedError") {
            console.warn(`[VideoShowcase] cannot play ${VIDEO_SRC} — is it in public/videos?`, error);
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
      </div>

      <div className="relative w-full overflow-hidden bg-sage-50 dark:bg-ink-800">
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
          className="aspect-video w-full object-cover object-[50%_30%] sm:aspect-[21/9] lg:aspect-[24/9]"
        />

        {blocked && (
          <button
            type="button"
            onClick={playNow}
            aria-label="Play the video"
            className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-white/90 text-sage-700 shadow-float transition hover:scale-105 sm:size-20"
          >
            <LuPlay className="size-7 translate-x-0.5 sm:size-8" aria-hidden="true" />
          </button>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-black/45 to-transparent sm:block" />
        <div className="absolute bottom-8 left-8 hidden flex-wrap items-end gap-3 sm:flex lg:left-18">
          <p className="max-w-[18ch] text-3xl leading-tight font-bold text-white drop-shadow">
            Play-ready clothes for every age
          </p>
          <Link href={ROUTES.products} className="btn btn-accent">
            Shop now <LuArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 px-8 sm:hidden">
        <p className="text-lg leading-tight font-bold text-text-dark dark:text-white">
          Play-ready clothes for every age
        </p>
        <Link href={ROUTES.products} className="btn btn-accent shrink-0">
          Shop now <LuArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
