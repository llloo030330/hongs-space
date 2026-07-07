"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { PhotoLightbox } from "@/components/sections/PhotoLightbox";
import {
  expectedPhotoPaths,
  formatPhotoMeta,
  galleryPhotos,
  type GalleryPhoto,
} from "@/components/sections/photoData";

const stackStyles = [
  { rotate: -2.8, x: 0, y: 0, scale: 1, zIndex: 50 },
  { rotate: 2.2, x: 18, y: 10, scale: 0.985, zIndex: 40 },
  { rotate: -1.3, x: -20, y: 18, scale: 0.97, zIndex: 30 },
  { rotate: 3.4, x: 10, y: 28, scale: 0.955, zIndex: 20 },
  { rotate: -3.2, x: 28, y: 24, scale: 0.94, zIndex: 10 },
];

const stackTransition = {
  duration: 0.66,
  ease: [0.22, 1, 0.36, 1] as const,
};

type StackDirection = "next" | "previous";

function getPreviewSrc(photo: GalleryPhoto) {
  return photo.thumbSrc ?? photo.src;
}

function StackPhotoImage({
  photo,
  loading = "lazy",
}: {
  photo: GalleryPhoto;
  loading?: "eager" | "lazy";
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center px-8 text-center text-xs font-medium tracking-[0.12em] text-black/32">
        Image unavailable.
      </div>
    );
  }

  return (
    <Image
      src={getPreviewSrc(photo)}
      alt={photo.alt}
      fill
      sizes="(max-width: 640px) 82vw, 420px"
      className="object-cover object-center"
      loading={loading}
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
}

function PhotoCaption({ photo }: { photo: GalleryPhoto }) {
  const meta = formatPhotoMeta(photo);

  return (
    <div className="mt-9 text-center">
      <p className="text-sm font-medium tracking-[0.08em] text-black/62">
        {photo.title}
      </p>
      {meta ? (
        <p className="mt-2 text-xs tracking-[0.16em] text-black/36">
          {meta}
        </p>
      ) : null}
    </div>
  );
}

function EmptyPhotoStack() {
  return (
    <div className="mx-auto mt-16 w-full max-w-[420px]">
      <div className="relative mx-auto aspect-[4/5] w-[82vw] max-w-[360px]">
        {stackStyles.slice(0, 4).map((style, index) => (
          <div
            key={`${style.rotate}-${style.x}`}
            className="absolute inset-0 rounded-[18px] border border-black/[0.065] bg-white/[0.42] shadow-[0_22px_70px_rgba(36,36,30,0.08)] backdrop-blur-xl"
            style={{
              zIndex: style.zIndex,
              transform: `translate3d(${style.x}px, ${style.y}px, 0) rotate(${style.rotate}deg) scale(${style.scale})`,
            }}
          >
            <div className="absolute inset-3 rounded-[13px] border border-black/[0.035] bg-[linear-gradient(145deg,rgba(255,255,255,0.58),rgba(255,255,255,0.18))]" />
            {index === 0 ? (
              <div className="absolute inset-x-8 bottom-8 text-center">
                <p className="text-sm font-medium tracking-[0.08em] text-black/52">
                  Photography archive coming soon.
                </p>
                <p className="mt-3 text-xs leading-6 text-black/34">
                  Add images to public/photos to populate this section.
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-xs text-center text-xs leading-6 text-black/32">
        Expected paths: {expectedPhotoPaths.slice(0, 2).join(", ")}
      </p>
    </div>
  );
}

function PhotoStack() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<StackDirection>("next");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const activeStackIndex = incomingIndex ?? activeIndex;
  const stackPhotos = useMemo(() => {
    if (galleryPhotos.length === 0) return [];

    const startStyleIndex = incomingIndex === null ? 0 : 1;

    return stackStyles
      .slice(startStyleIndex, galleryPhotos.length)
      .map((style, offset) => {
        const styleIndex = startStyleIndex + offset;

        return {
          photo: galleryPhotos[
            (activeStackIndex + styleIndex) % galleryPhotos.length
          ],
          style,
          styleIndex,
        };
      });
  }, [activeStackIndex, incomingIndex]);

  if (galleryPhotos.length === 0) {
    return <EmptyPhotoStack />;
  }

  const activePhoto = galleryPhotos[activeIndex];
  const incomingPhoto =
    incomingIndex === null ? null : galleryPhotos[incomingIndex];
  const captionPhoto = incomingPhoto ?? activePhoto;
  const completeTransition = useCallback(() => {
    if (incomingIndex === null) return;

    setActiveIndex(incomingIndex);
    setIncomingIndex(null);
    setIsTransitioning(false);
  }, [incomingIndex]);
  const startTransition = useCallback(
    (nextDirection: StackDirection) => {
      if (galleryPhotos.length < 2 || isTransitioning) return;

      const nextIndex =
        nextDirection === "next"
          ? (activeIndex + 1) % galleryPhotos.length
          : (activeIndex - 1 + galleryPhotos.length) % galleryPhotos.length;

      if (shouldReduceMotion) {
        setActiveIndex(nextIndex);
        return;
      }

      setDirection(nextDirection);
      setIncomingIndex(nextIndex);
      setIsTransitioning(true);
    },
    [activeIndex, isTransitioning, shouldReduceMotion],
  );
  const showNext = useCallback(() => {
    startTransition("next");
  }, [startTransition]);
  const showPrevious = useCallback(() => {
    startTransition("previous");
  }, [startTransition]);
  const openLightbox = useCallback(() => {
    if (isTransitioning) return;

    setLightboxIndex(activeIndex);
  }, [activeIndex, isTransitioning]);
  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);
  const showNextLightbox = useCallback(() => {
    setLightboxIndex((index) =>
      index === null ? null : (index + 1) % galleryPhotos.length,
    );
  }, []);
  const showPreviousLightbox = useCallback(() => {
    setLightboxIndex((index) =>
      index === null
        ? null
        : (index - 1 + galleryPhotos.length) % galleryPhotos.length,
    );
  }, []);

  return (
    <div className="mx-auto mt-16 w-full max-w-[520px]">
      <div className="relative mx-auto aspect-[4/5] w-[82vw] max-w-[380px] sm:w-[420px]">
        {stackPhotos.map(({ photo, style, styleIndex }) => {
          return (
            <figure
              key={`${photo.src}-${styleIndex}`}
              className="absolute inset-0 overflow-hidden rounded-[18px] border border-white/65 bg-[#ecece7] shadow-[0_24px_80px_rgba(36,36,30,0.13)] transition duration-500 ease-out"
              style={{
                zIndex: style.zIndex,
                opacity: 1,
                transform: `translate3d(${style.x}px, ${style.y}px, 0) rotate(${style.rotate}deg) scale(${style.scale})`,
                transition:
                  "transform 660ms cubic-bezier(0.22, 1, 0.36, 1), opacity 520ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <StackPhotoImage
                photo={photo}
                loading={styleIndex === 0 ? "eager" : "lazy"}
              />
            </figure>
          );
        })}

        {incomingPhoto ? (
          <motion.figure
            key={`outgoing-${activePhoto.src}-${incomingIndex}`}
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[18px] border border-white/65 bg-[#ecece7] shadow-[0_24px_80px_rgba(36,36,30,0.13)]"
            style={{ zIndex: 55 }}
            initial={{
              y: stackStyles[0].y,
              rotate: stackStyles[0].rotate,
              opacity: 1,
              scale: stackStyles[0].scale,
            }}
            animate={{
              y: -8,
              rotate: stackStyles[0].rotate,
              opacity: 0.78,
              scale: 0.988,
            }}
            transition={stackTransition}
          >
            <StackPhotoImage photo={activePhoto} loading="eager" />
          </motion.figure>
        ) : null}

        {incomingPhoto ? (
          <motion.figure
            key={`incoming-${direction}-${incomingPhoto.src}`}
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[18px] border border-white/70 bg-[#ecece7] shadow-[0_26px_86px_rgba(36,36,30,0.15)]"
            style={{ zIndex: 70 }}
            initial={{
              y: direction === "next" ? 96 : -72,
              rotate:
                stackStyles[0].rotate + (direction === "next" ? 3.2 : -2.6),
              opacity: direction === "next" ? 0.92 : 0.9,
              scale: 0.992,
            }}
            animate={{
              y: stackStyles[0].y,
              rotate: stackStyles[0].rotate,
              opacity: 1,
              scale: stackStyles[0].scale,
            }}
            transition={stackTransition}
            onAnimationComplete={completeTransition}
          >
            <StackPhotoImage photo={incomingPhoto} loading="eager" />
          </motion.figure>
        ) : null}

        <button
          type="button"
          disabled={isTransitioning}
          onClick={openLightbox}
          className="absolute inset-0 z-[60] rounded-[20px] outline-none transition duration-500 hover:-translate-y-1 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-black/16 disabled:cursor-default"
          aria-label="Open current photo"
        />
      </div>

      <PhotoCaption photo={captionPhoto} />

      {galleryPhotos.length > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={showPrevious}
            disabled={isTransitioning}
            aria-label="Show previous photo"
            className="min-h-11 rounded-full border border-black/[0.08] px-5 text-xs tracking-[0.16em] text-black/44 transition duration-300 hover:border-black/[0.14] hover:text-black/62 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/16 disabled:cursor-default disabled:opacity-45"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={showNext}
            disabled={isTransitioning}
            aria-label="Show next photo"
            className="min-h-11 rounded-full border border-black/[0.08] px-5 text-xs tracking-[0.16em] text-black/44 transition duration-300 hover:border-black/[0.14] hover:text-black/62 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/16 disabled:cursor-default disabled:opacity-45"
          >
            Next
          </button>
        </div>
      ) : null}

      <PhotoLightbox
        photos={galleryPhotos}
        activeIndex={lightboxIndex}
        onClose={closeLightbox}
        onNext={showNextLightbox}
        onPrevious={showPreviousLightbox}
      />
    </div>
  );
}

export function GallerySection() {
  return (
    <motion.section
      id="gallery"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-28 px-6 py-28 pt-16 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-medium tracking-[0.01em] text-black/78 sm:text-5xl">
            Gallery
          </h2>
        </div>

        <PhotoStack />
      </div>
    </motion.section>
  );
}
