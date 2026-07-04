"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), {
  ssr: false,
});

type HeroVisualProps = {
  mode?: "default" | "preview";
  subtitle?: string;
  enterTargetId?: string;
};

export default function HeroVisual({
  mode = "default",
  subtitle = "Robotics / Creation / Film / Life",
  enterTargetId = "about",
}: HeroVisualProps) {
  const handleEnter = () => {
    const target = document.getElementById(enterTargetId);

    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      return;
    }

    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section
      id="home"
      data-mode={mode}
      className="relative isolate min-h-[100dvh] overflow-hidden bg-[#f3f3ef] text-[#151515]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.99),rgba(248,248,244,0.93)_36%,rgba(226,226,219,0.7)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_64%,transparent_0%,transparent_45%,rgba(88,88,80,0.065)_100%)]" />
      <HeroCanvas />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="select-none whitespace-nowrap text-balance text-[clamp(2.34rem,7.3vw,5.85rem)] font-medium leading-[1.02] tracking-[0.032em] text-black/[0.82] drop-shadow-[0_1px_18px_rgba(255,255,255,0.38)] sm:tracking-[0.052em]"
        >
          Hong&apos;s Space
        </motion.h1>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[calc(50%+4.78rem)] z-10 flex justify-center px-6 text-center sm:top-[calc(50%+5.95rem)]">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[20rem] text-[9px] font-medium uppercase leading-[1.72] tracking-[0.2em] text-black/31 sm:max-w-none sm:text-[10.5px] sm:tracking-[0.3em]"
        >
          {subtitle}
        </motion.p>
      </div>

      <div className="absolute bottom-7 left-0 right-0 z-10 flex justify-center px-6 sm:bottom-10">
        <motion.button
          type="button"
          onClick={handleEnter}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-11 rounded-full border border-black/[0.085] bg-white/[0.2] px-6 text-[9.5px] font-medium uppercase tracking-[0.24em] text-black/52 shadow-[0_10px_34px_rgba(74,74,66,0.04)] backdrop-blur-2xl transition-[transform,border-color,background-color,color,box-shadow] duration-500 ease-out hover:-translate-y-0.5 hover:border-black/14 hover:bg-white/34 hover:text-black/70 active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-black/18 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3f3ef] sm:px-7 sm:text-[10px] sm:tracking-[0.27em]"
        >
          Enter
        </motion.button>
      </div>
    </section>
  );
}
