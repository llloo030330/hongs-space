export type GalleryPhoto = {
  src: string;
  alt: string;
  title: string;
  location: string;
  year: string;
};

export const galleryPhotos: GalleryPhoto[] = [
  {
    src: "/photos/deadfish.jpg",
    alt: "Untitled photography work from Hong's archive",
    title: "Untitled 01",
    location: "",
    year: "2026",
  },
  {
    src: "/photos/running.jpg",
    alt: "Untitled photography work from Hong's archive",
    title: "Untitled 02",
    location: "",
    year: "2026",
  },
];

export const expectedPhotoPaths = [
  "/photos/deadfish.jpg",
  "/photos/running.jpg",
];

export function formatPhotoMeta(photo: GalleryPhoto) {
  return [photo.location, photo.year].filter(Boolean).join(" \u00b7 ");
}
