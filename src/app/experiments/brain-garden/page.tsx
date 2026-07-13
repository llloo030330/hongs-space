import type { Metadata } from "next";
import { BrainGarden } from "@/components/experiments/brain-garden/BrainGarden";

export const metadata: Metadata = {
  title: "Brain Garden — Hong's Space",
  description:
    "A small daily experiment for focus, memory, attention, and rule switching.",
};

export default function BrainGardenPage() {
  return <BrainGarden />;
}
