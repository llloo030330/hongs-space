import type { Metadata } from "next";
import { BrainGarden } from "@/components/experiments/brain-garden/BrainGarden";

export const metadata: Metadata = {
  title: "Brain Garden | Hong's Space",
  description:
    "A small daily brain training experiment with short focus, memory, and attention games.",
};

export default function BrainGardenPage() {
  return <BrainGarden />;
}
