export type GalleryPhoto = {
  src: string;
  thumbSrc?: string;
  alt: string;
  title: string;
  location: string;
  year: string;
};

export type PhotoSeriesConfig = {
  id: string;
  title: string;
  description: string;
  presentation: SeriesPresentation;
};

export type SeriesPresentation = {
  backgroundClass: string;
  textClass: string;
  mutedTextClass: string;
  borderClass: string;
  imageRadiusClass: string;
  labelClass: string;
  stackRotationScale: number;
  stackOffsetScale: number;
  transitionStyle: "rise" | "fade" | "drift";
};

export type PhotoSeries = {
  id: string;
  title: string;
  description: string;
  cover?: string;
  photos: GalleryPhoto[];
  presentation: SeriesPresentation;
};

export const seriesConfig: PhotoSeriesConfig[] = [
  {
    id: "life",
    title: "Life",
    description: "People, animals, and traces of everyday life.",
    presentation: {
      backgroundClass:
        "bg-[linear-gradient(145deg,rgba(255,255,250,0.34),rgba(239,234,224,0.2))]",
      textClass: "text-black/76",
      mutedTextClass: "text-black/46",
      borderClass: "border-black/[0.07]",
      imageRadiusClass: "rounded-[18px]",
      labelClass: "tracking-[0.16em]",
      stackRotationScale: 1.08,
      stackOffsetScale: 1.02,
      transitionStyle: "rise",
    },
  },
  {
    id: "moments",
    title: "Moments",
    description: "Small moments captured before they disappear.",
    presentation: {
      backgroundClass:
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.26),rgba(245,245,241,0.16))]",
      textClass: "text-black/72",
      mutedTextClass: "text-black/38",
      borderClass: "border-black/[0.055]",
      imageRadiusClass: "rounded-[18px]",
      labelClass: "tracking-[0.18em]",
      stackRotationScale: 0.76,
      stackOffsetScale: 0.82,
      transitionStyle: "fade",
    },
  },
  {
    id: "my-journey",
    title: "My Journey",
    description:
      "Places I have passed through, moments I remember, and fragments collected along the way.",
    presentation: {
      backgroundClass:
        "bg-[linear-gradient(145deg,rgba(255,255,252,0.32),rgba(238,238,232,0.18))]",
      textClass: "text-black/74",
      mutedTextClass: "text-black/42",
      borderClass: "border-black/[0.06]",
      imageRadiusClass: "rounded-[18px]",
      labelClass: "tracking-[0.18em]",
      stackRotationScale: 0.9,
      stackOffsetScale: 0.9,
      transitionStyle: "rise",
    },
  },
  {
    id: "city-corners",
    title: "City Corners",
    description:
      "Quiet fragments of streets, buildings, light, and everyday city life.",
    presentation: {
      backgroundClass:
        "bg-[linear-gradient(145deg,rgba(250,250,247,0.3),rgba(232,232,226,0.18))]",
      textClass: "text-black/74",
      mutedTextClass: "text-black/42",
      borderClass: "border-black/[0.065]",
      imageRadiusClass: "rounded-[16px]",
      labelClass: "tracking-[0.17em]",
      stackRotationScale: 0.84,
      stackOffsetScale: 0.86,
      transitionStyle: "rise",
    },
  },
  {
    id: "clouds",
    title: "Clouds",
    description: "Light, sky, and changing shapes above us.",
    presentation: {
      backgroundClass:
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(248,248,245,0.18))]",
      textClass: "text-black/68",
      mutedTextClass: "text-black/34",
      borderClass: "border-black/[0.045]",
      imageRadiusClass: "rounded-[20px]",
      labelClass: "tracking-[0.2em]",
      stackRotationScale: 0.52,
      stackOffsetScale: 0.72,
      transitionStyle: "drift",
    },
  },
  {
    id: "olympus",
    title: "Olympus",
    description: "A collection captured through my Olympus camera.",
    presentation: {
      backgroundClass:
        "bg-[linear-gradient(145deg,rgba(250,250,247,0.32),rgba(236,236,230,0.2))]",
      textClass: "text-black/78",
      mutedTextClass: "text-black/45",
      borderClass: "border-black/[0.085]",
      imageRadiusClass: "rounded-[14px]",
      labelClass: "font-mono tracking-[0.14em]",
      stackRotationScale: 0.62,
      stackOffsetScale: 0.68,
      transitionStyle: "rise",
    },
  },
  {
    id: "imagination",
    title: "Imagination",
    description: "Images between reality and imagination.",
    presentation: {
      backgroundClass:
        "bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.46),rgba(241,241,237,0.18)_46%,rgba(232,232,226,0.14)_100%)]",
      textClass: "text-black/72",
      mutedTextClass: "text-black/40",
      borderClass: "border-black/[0.06]",
      imageRadiusClass: "rounded-[19px]",
      labelClass: "tracking-[0.24em]",
      stackRotationScale: 1.18,
      stackOffsetScale: 0.98,
      transitionStyle: "fade",
    },
  },
];

export const manualPhotoMetadata: Record<
  string,
  Partial<Omit<GalleryPhoto, "src">>
> = {};

export function formatPhotoMeta(photo: GalleryPhoto) {
  return [photo.location, photo.year].filter(Boolean).join(" \u00b7 ");
}
