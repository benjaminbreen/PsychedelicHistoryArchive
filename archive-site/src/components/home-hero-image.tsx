"use client";

import { useEffect, useRef } from "react";

export function HomeHeroImage() {
  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    const section = img.closest(".home-hero") as HTMLElement | null;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      section.style.setProperty("--hero-progress", "0");
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const traveled = Math.min(Math.max(-rect.top, 0), rect.height);
      const progress = rect.height > 0 ? traveled / rect.height : 0;
      const scale = 1 + progress * 0.10;
      const translate = progress * 6;
      img.style.transform = `scale(${scale.toFixed(4)}) translate3d(0, ${translate.toFixed(2)}px, 0)`;
      section.style.setProperty("--hero-progress", progress.toFixed(4));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <img
        alt=""
        aria-hidden="true"
        className="home-hero-image"
        ref={ref}
        src="/images/abramson-fish.jpg"
      />
      <div aria-hidden="true" className="home-hero-halo" />
      <div aria-hidden="true" className="home-hero-vignette" />
    </>
  );
}
