import fs from "node:fs";
import path from "node:path";
import {
  manualPhotoMetadata,
  seriesConfig,
  type GalleryPhoto,
  type PhotoSeries,
} from "@/components/sections/photoData";

const PHOTO_ROOT = path.join(process.cwd(), "public", "photos");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const COVER_FILENAMES = new Set([
  "cover.jpg",
  "cover.jpeg",
  "cover.png",
  "cover.webp",
]);
const ignoredFiles = new Set([".ds_store", "thumbs.db"]);
const naturalCollator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

function toPublicPhotoPath(seriesId: string, fileName: string) {
  return `/photos/${seriesId}/${fileName}`;
}

function isSupportedImage(fileName: string) {
  return IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

function isIgnoredFile(fileName: string) {
  const lowerName = fileName.toLowerCase();

  return (
    fileName.startsWith(".") ||
    ignoredFiles.has(lowerName) ||
    !isSupportedImage(fileName)
  );
}

function isCoverFile(fileName: string) {
  return COVER_FILENAMES.has(fileName.toLowerCase());
}

function hasUnsafeFileName(fileName: string) {
  return /[^\w.-]/.test(fileName) || /[A-Z]/.test(fileName);
}

function warnUnsafeFileName(seriesId: string, fileName: string) {
  if (!hasUnsafeFileName(fileName)) return;

  console.warn(
    `[gallery] Consider renaming public/photos/${seriesId}/${fileName}. ` +
      `Recommended format: ${seriesId}-01.jpg, ${seriesId}-02.jpg.`,
  );
}

function getSeriesFiles(seriesId: string) {
  const seriesDirectory = path.join(PHOTO_ROOT, seriesId);

  if (!fs.existsSync(seriesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(seriesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => !isIgnoredFile(fileName))
    .sort((a, b) => naturalCollator.compare(a, b));
}

function getDefaultTitle(index: number) {
  return `Untitled ${String(index + 1).padStart(2, "0")}`;
}

function createPhoto(
  seriesId: string,
  seriesTitle: string,
  fileName: string,
  index: number,
): GalleryPhoto {
  const src = toPublicPhotoPath(seriesId, fileName);
  const metadata = manualPhotoMetadata[src] ?? {};

  return {
    src,
    alt:
      metadata.alt ??
      `Photography work from the ${seriesTitle} series`,
    title: metadata.title ?? getDefaultTitle(index),
    location: metadata.location ?? "",
    year: metadata.year ?? "",
    thumbSrc: metadata.thumbSrc,
  };
}

export function getPhotoSeries(): PhotoSeries[] {
  return seriesConfig.map((series) => {
    const files = getSeriesFiles(series.id);

    files.forEach((fileName) => warnUnsafeFileName(series.id, fileName));

    const coverFile = files.find(isCoverFile);
    const photoFiles = files.filter((fileName) => !isCoverFile(fileName));
    const photos = photoFiles.map((fileName, index) =>
      createPhoto(series.id, series.title, fileName, index),
    );
    const cover = coverFile
      ? toPublicPhotoPath(series.id, coverFile)
      : photos[0]?.src;

    return {
      ...series,
      cover,
      photos,
    };
  });
}
