"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { PhotoLightbox } from "@/components/sections/PhotoLightbox";
import {
  formatPhotoMeta,
  type GalleryPhoto,
  type PhotoSeries,
  type SeriesPresentation,
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

const transitionPresets = {
  rise: {
    duration: 0.66,
    incomingY: { next: 96, previous: -72 },
    incomingRotate: { next: 3.2, previous: -2.6 },
    incomingOpacity: 0.92,
    incomingScale: 0.992,
    outgoingY: -8,
    outgoingOpacity: 0.78,
    outgoingScale: 0.988,
  },
  fade: {
    duration: 0.72,
    incomingY: { next: 66, previous: -52 },
    incomingRotate: { next: 1.8, previous: -1.6 },
    incomingOpacity: 0.84,
    incomingScale: 0.982,
    outgoingY: -4,
    outgoingOpacity: 0.66,
    outgoingScale: 0.984,
  },
  drift: {
    duration: 0.7,
    incomingY: { next: 72, previous: -42 },
    incomingRotate: { next: 1.2, previous: -1 },
    incomingOpacity: 0.88,
    incomingScale: 0.988,
    outgoingY: -12,
    outgoingOpacity: 0.72,
    outgoingScale: 0.99,
  },
} as const;

type StackDirection = "next" | "previous";

function getSeriesCountLabel(count: number) {
  if (count === 0) return "A new series is waiting.";

  return `${count} ${count === 1 ? "photograph" : "photographs"}`;
}

function scaleStackStyle(
  style: (typeof stackStyles)[number],
  presentation: SeriesPresentation,
) {
  return {
    ...style,
    rotate: style.rotate * presentation.stackRotationScale,
    x: style.x * presentation.stackOffsetScale,
    y: style.y * presentation.stackOffsetScale,
  };
}

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

function EmptyPhotoStack({
  title = "Photography archive coming soon.",
  description = "New photographs will appear here over time.",
  presentation,
}: {
  title?: string;
  description?: string;
  presentation: SeriesPresentation;
}) {
  return (
    <div className="mx-auto mt-12 w-full max-w-[420px] sm:mt-16">
      <div className="relative mx-auto aspect-[4/5] w-[78vw] max-w-[320px] sm:w-[82vw] sm:max-w-[360px]">
        {stackStyles.slice(0, 4).map((baseStyle, index) => {
          const style = scaleStackStyle(baseStyle, presentation);

          return (
            <div
              key={`${style.rotate}-${style.x}`}
              className={`absolute inset-0 ${presentation.imageRadiusClass} border ${presentation.borderClass} ${presentation.backgroundClass} shadow-[0_22px_70px_rgba(36,36,30,0.08)] backdrop-blur-xl`}
              style={{
                zIndex: style.zIndex,
                transform: `translate3d(${style.x}px, ${style.y}px, 0) rotate(${style.rotate}deg) scale(${style.scale})`,
              }}
            >
              <div className="absolute inset-3 rounded-[13px] border border-black/[0.035] bg-[linear-gradient(145deg,rgba(255,255,255,0.58),rgba(255,255,255,0.18))]" />
              {index === 0 ? (
                <div className="absolute inset-x-8 bottom-8 text-center">
                  <p
                    className={`text-sm font-medium tracking-[0.08em] ${presentation.textClass}`}
                  >
                    {title}
                  </p>
                  <p
                    className={`mt-3 text-xs leading-6 ${presentation.mutedTextClass}`}
                  >
                    {description}
                  </p>
                </div>
              ) : null}
              </div>
          );
        })}
      </div>
    </div>
  );
}

function PhotoStack({
  photos,
  emptyTitle,
  emptyDescription,
  presentation,
}: {
  photos: GalleryPhoto[];
  emptyTitle?: string;
  emptyDescription?: string;
  presentation: SeriesPresentation;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<StackDirection>("next");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const activeStackIndex = incomingIndex ?? activeIndex;
  const stackPhotos = useMemo(() => {
    if (photos.length === 0) return [];

    const startStyleIndex = incomingIndex === null ? 0 : 1;

    return stackStyles
      .slice(startStyleIndex, photos.length)
      .map((style, offset) => {
        const styleIndex = startStyleIndex + offset;
        const scaledStyle = scaleStackStyle(style, presentation);

        return {
          photo: photos[(activeStackIndex + styleIndex) % photos.length],
          style: scaledStyle,
          styleIndex,
        };
      });
  }, [activeStackIndex, incomingIndex, photos, presentation]);

  if (photos.length === 0) {
    return (
      <EmptyPhotoStack
        title={emptyTitle}
        description={emptyDescription}
        presentation={presentation}
      />
    );
  }

  const transitionPreset = transitionPresets[presentation.transitionStyle];
  const transition = {
    ...stackTransition,
    duration: transitionPreset.duration,
  };
  const baseTopStyle = scaleStackStyle(stackStyles[0], presentation);
  const activePhoto = photos[activeIndex];
  const incomingPhoto = incomingIndex === null ? null : photos[incomingIndex];
  const captionPhoto = incomingPhoto ?? activePhoto;
  const completeTransition = useCallback(() => {
    if (incomingIndex === null) return;

    setActiveIndex(incomingIndex);
    setIncomingIndex(null);
    setIsTransitioning(false);
  }, [incomingIndex]);
  const startTransition = useCallback(
    (nextDirection: StackDirection) => {
      if (photos.length < 2 || isTransitioning) return;

      const nextIndex =
        nextDirection === "next"
          ? (activeIndex + 1) % photos.length
          : (activeIndex - 1 + photos.length) % photos.length;

      if (shouldReduceMotion) {
        setActiveIndex(nextIndex);
        return;
      }

      setDirection(nextDirection);
      setIncomingIndex(nextIndex);
      setIsTransitioning(true);
    },
    [activeIndex, isTransitioning, photos.length, shouldReduceMotion],
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
      index === null ? null : (index + 1) % photos.length,
    );
  }, [photos.length]);
  const showPreviousLightbox = useCallback(() => {
    setLightboxIndex((index) =>
      index === null
        ? null
        : (index - 1 + photos.length) % photos.length,
    );
  }, [photos.length]);

  return (
    <div className="mx-auto mt-12 w-full max-w-[520px] sm:mt-16">
      <div className="relative mx-auto aspect-[4/5] w-[78vw] max-w-[320px] sm:w-[420px] sm:max-w-[380px]">
        {stackPhotos.map(({ photo, style, styleIndex }) => {
          return (
            <figure
              key={`${photo.src}-${styleIndex}`}
              className={`absolute inset-0 overflow-hidden ${presentation.imageRadiusClass} border ${presentation.borderClass} bg-[#ecece7] shadow-[0_24px_80px_rgba(36,36,30,0.13)] transition duration-500 ease-out`}
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
            className={`pointer-events-none absolute inset-0 overflow-hidden ${presentation.imageRadiusClass} border ${presentation.borderClass} bg-[#ecece7] shadow-[0_24px_80px_rgba(36,36,30,0.13)]`}
            style={{ zIndex: 55 }}
            initial={{
              y: baseTopStyle.y,
              rotate: baseTopStyle.rotate,
              opacity: 1,
              scale: baseTopStyle.scale,
            }}
            animate={{
              y: transitionPreset.outgoingY,
              rotate: baseTopStyle.rotate,
              opacity: transitionPreset.outgoingOpacity,
              scale: transitionPreset.outgoingScale,
            }}
            transition={transition}
          >
            <StackPhotoImage photo={activePhoto} loading="eager" />
          </motion.figure>
        ) : null}

        {incomingPhoto ? (
          <motion.figure
            key={`incoming-${direction}-${incomingPhoto.src}`}
            className={`pointer-events-none absolute inset-0 overflow-hidden ${presentation.imageRadiusClass} border ${presentation.borderClass} bg-[#ecece7] shadow-[0_26px_86px_rgba(36,36,30,0.15)]`}
            style={{ zIndex: 70 }}
            initial={{
              y: transitionPreset.incomingY[direction],
              rotate:
                baseTopStyle.rotate + transitionPreset.incomingRotate[direction],
              opacity: transitionPreset.incomingOpacity,
              scale: transitionPreset.incomingScale,
            }}
            animate={{
              y: baseTopStyle.y,
              rotate: baseTopStyle.rotate,
              opacity: 1,
              scale: baseTopStyle.scale,
            }}
            transition={transition}
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

      {photos.length > 1 ? (
        <div className="mx-auto mt-8 grid w-full max-w-xs grid-cols-2 gap-3">
          <button
            type="button"
            onClick={showPrevious}
            disabled={isTransitioning}
            aria-label="Show previous photo"
            className="min-h-11 rounded-full border border-black/[0.08] px-3 text-xs tracking-[0.11em] text-black/44 transition duration-300 hover:border-black/[0.14] hover:text-black/62 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/16 disabled:cursor-default disabled:opacity-45 sm:px-5 sm:tracking-[0.16em]"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={showNext}
            disabled={isTransitioning}
            aria-label="Show next photo"
            className="min-h-11 rounded-full border border-black/[0.08] px-3 text-xs tracking-[0.11em] text-black/44 transition duration-300 hover:border-black/[0.14] hover:text-black/62 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/16 disabled:cursor-default disabled:opacity-45 sm:px-5 sm:tracking-[0.16em]"
          >
            Next
          </button>
        </div>
      ) : null}

      <PhotoLightbox
        photos={photos}
        activeIndex={lightboxIndex}
        onClose={closeLightbox}
        onNext={showNextLightbox}
        onPrevious={showPreviousLightbox}
      />
    </div>
  );
}

function SeriesCover({ series }: { series: PhotoSeries }) {
  const [coverState, setCoverState] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const hasCover = coverState === "loaded";

  return (
    <span
      className={`relative block aspect-[4/3] overflow-hidden ${series.presentation.imageRadiusClass} border ${series.presentation.borderClass} bg-[#ecece7] ${series.presentation.backgroundClass} transition duration-500 group-hover:scale-[1.015]`}
    >
      {series.cover ? (
        <img
          src={series.cover}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setCoverState("loaded")}
          onError={() => setCoverState("error")}
          className={`h-full w-full object-cover transition duration-500 ${
            hasCover ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
      <span className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.34),rgba(210,210,200,0.16))]" />
      {!hasCover ? (
        <span
          className={`absolute inset-0 grid place-items-center px-6 text-center text-2xl font-medium tracking-[0.02em] text-black/58 sm:text-3xl ${series.presentation.textClass}`}
        >
          {series.title}
        </span>
      ) : null}
      <span
        className={`absolute bottom-4 left-4 text-[10px] font-medium uppercase text-black/36 ${series.presentation.labelClass}`}
      >
        Series
      </span>
    </span>
  );
}

export function SeriesSelector({
  photoSeries,
  className = "",
}: {
  photoSeries: PhotoSeries[];
  className?: string;
}) {
  return (
    <motion.div
      key="series-selector"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={`mx-auto mt-14 grid max-w-4xl gap-3 sm:mt-16 sm:grid-cols-2 sm:gap-4 ${className}`}
    >
      {photoSeries.map((series) => (
        <Link
          key={series.id}
          href={`/gallery/${series.id}`}
          className="group rounded-[18px] border border-black/[0.055] bg-white/[0.11] p-3 text-left transition duration-300 hover:-translate-y-px hover:border-black/[0.12] hover:bg-white/[0.2] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:p-4"
        >
          <SeriesCover series={series} />
          <span className="block px-1.5 pb-2 pt-5 sm:px-2 sm:pb-3 sm:pt-6">
            <span className="block text-2xl font-medium tracking-[0.01em] text-black/72 sm:text-3xl">
              {series.title}
            </span>
            <span className="mt-4 block max-w-sm text-sm leading-7 text-black/44">
              {series.description}
            </span>
            <span className="mt-6 block text-[10px] font-medium uppercase tracking-[0.18em] text-black/30 transition duration-300 group-hover:text-black/45">
              Open series
            </span>
          </span>
        </Link>
      ))}
    </motion.div>
  );
}

export function SeriesGallery({
  series,
  previousSeries,
  nextSeries,
}: {
  series: PhotoSeries;
  previousSeries: PhotoSeries;
  nextSeries: PhotoSeries;
}) {
  const countLabel = getSeriesCountLabel(series.photos.length);

  return (
    <motion.div
      key={series.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className={`mt-8 rounded-[22px] border ${series.presentation.borderClass} ${series.presentation.backgroundClass} px-3 py-7 sm:mt-14 sm:rounded-[28px] sm:px-8 sm:py-10`}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Link
          href="/gallery"
          className={`mb-6 min-h-11 rounded-full border ${series.presentation.borderClass} px-5 text-[11px] font-medium ${series.presentation.labelClass} text-black/42 transition duration-300 hover:border-black/[0.13] hover:bg-white/30 hover:text-black/62 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15`}
        >
          {"<-"} All Series
        </Link>
        <h1
          className={`text-2xl font-medium tracking-[0.01em] sm:text-4xl ${series.presentation.textClass}`}
        >
          {series.title}
        </h1>
        <p
          className={`mt-4 max-w-xl text-sm leading-7 ${series.presentation.mutedTextClass}`}
        >
          {series.description}
        </p>
        <p
          className={`mt-5 text-[10px] font-medium uppercase ${series.presentation.labelClass} ${series.presentation.mutedTextClass}`}
        >
          {countLabel}
        </p>
      </div>

      <PhotoStack
        key={series.id}
        photos={series.photos}
        emptyTitle="A new series is waiting."
        emptyDescription="Photos will appear here soon."
        presentation={series.presentation}
      />

      <div className="mx-auto mt-10 grid max-w-xl grid-cols-2 items-center gap-3 border-t border-black/[0.06] pt-6 text-[10px] font-medium uppercase tracking-[0.1em] text-black/38 sm:mt-14 sm:text-[11px] sm:tracking-[0.14em]">
        <Link
          href={`/gallery/${previousSeries.id}`}
          className="min-h-11 rounded-full px-2 text-left transition duration-300 hover:text-black/62 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:px-3"
        >
          {"<-"} {previousSeries.title}
        </Link>
        <Link
          href={`/gallery/${nextSeries.id}`}
          className="min-h-11 rounded-full px-2 text-right transition duration-300 hover:text-black/62 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:px-3"
        >
          {nextSeries.title} {"->"}
        </Link>
      </div>
    </motion.div>
  );
}

export function GallerySection({
  photoSeries,
}: {
  photoSeries: PhotoSeries[];
}) {
  return (
    <motion.section
      id="gallery"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="scroll-mt-28 bg-[#f6f6f3] px-5 py-20 pt-16 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.18em] text-black/30">
            Photography / 03
          </p>
          <h2 className="text-3xl font-medium tracking-[0.01em] text-black/78 sm:text-5xl">
            Gallery
          </h2>
          <div className="mx-auto mt-8 h-px w-16 bg-black/[0.08]" />
        </div>

        <SeriesSelector photoSeries={photoSeries} />
      </div>
    </motion.section>
  );
}
