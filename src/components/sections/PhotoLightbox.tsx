"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  formatPhotoMeta,
  type GalleryPhoto,
} from "@/components/sections/photoData";

type PhotoLightboxProps = {
  photos: GalleryPhoto[];
  activeIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function PhotoLightbox({
  photos,
  activeIndex,
  onClose,
  onNext,
  onPrevious,
}: PhotoLightboxProps) {
  const isOpen = activeIndex !== null && photos.length > 0;
  const activePhoto = isOpen ? photos[activeIndex] : null;
  const activeMeta = activePhoto ? formatPhotoMeta(activePhoto) : "";
  const [imageStatus, setImageStatus] = useState<
    "loading" | "loaded" | "error"
  >("loading");

  useEffect(() => {
    if (!activePhoto) return;

    setImageStatus("loading");
  }, [activePhoto?.src]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight") {
        onNext();
      }

      if (event.key === "ArrowLeft") {
        onPrevious();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, onNext, onPrevious]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {activePhoto ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#f2f2ee]/82 px-3 py-5 backdrop-blur-md sm:px-8 sm:py-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo viewer"
            className="absolute right-4 top-4 min-h-11 rounded-full border border-black/[0.08] bg-white/40 px-5 text-xs tracking-[0.16em] text-black/48 shadow-[0_12px_40px_rgba(36,36,30,0.08)] backdrop-blur-xl transition duration-300 hover:border-black/[0.14] hover:text-black/68 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/16 sm:right-8 sm:top-8"
          >
            Close
          </button>

          <motion.div
            className="flex w-full flex-col items-center"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto flex w-full items-center justify-center">
              <div className="relative flex min-h-48 min-w-48 items-center justify-center">
                {imageStatus !== "error" ? (
                  <img
                    key={activePhoto.src}
                    src={activePhoto.src}
                    alt={activePhoto.alt}
                    loading="eager"
                    decoding="async"
                    onLoad={() => setImageStatus("loaded")}
                    onError={() => setImageStatus("error")}
                    className={`block rounded-[18px] shadow-[0_30px_110px_rgba(36,36,30,0.18)] transition-opacity duration-300 ${
                      imageStatus === "loaded" ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      maxWidth: "min(92vw, 1100px)",
                      maxHeight: "84svh",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                ) : null}

                {imageStatus !== "loaded" ? (
                  <p className="absolute inset-0 grid place-items-center rounded-[18px] border border-black/[0.055] bg-white/[0.2] px-8 text-center text-xs font-medium tracking-[0.14em] text-black/38 backdrop-blur-sm">
                    {imageStatus === "error"
                      ? "Image unavailable."
                      : "Loading image..."}
                  </p>
                ) : null}
              </div>
            </div>

            <div
              className="mx-auto mt-5 flex w-full flex-col items-center gap-4 text-center sm:mt-6 sm:flex-row sm:justify-between sm:text-left"
              style={{ maxWidth: "min(94vw, 1180px)" }}
            >
              <div>
                <p className="text-sm font-medium tracking-[0.08em] text-black/66">
                  {activePhoto.title}
                </p>
                {activeMeta ? (
                  <p className="mt-2 text-xs tracking-[0.16em] text-black/38">
                    {activeMeta}
                  </p>
                ) : null}
              </div>

              {photos.length > 1 ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onPrevious}
                    aria-label="Show previous photo"
                    className="min-h-11 rounded-full border border-black/[0.08] bg-white/35 px-5 text-xs tracking-[0.16em] text-black/46 backdrop-blur-xl transition duration-300 hover:border-black/[0.14] hover:text-black/64 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/16"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    aria-label="Show next photo"
                    className="min-h-11 rounded-full border border-black/[0.08] bg-white/35 px-5 text-xs tracking-[0.16em] text-black/46 backdrop-blur-xl transition duration-300 hover:border-black/[0.14] hover:text-black/64 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/16"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
