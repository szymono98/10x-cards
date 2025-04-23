import { FlashcardGenerationView } from "@/components/generate/FlashcardGenerationView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generowanie fiszek | 10x Cards",
  description: "Generuj fiszki za pomocą sztucznej inteligencji",
};

export default function GeneratePage() {
  return <FlashcardGenerationView />;
}
