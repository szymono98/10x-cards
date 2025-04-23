import { memo } from "react";
import type { FlashcardProposalDto } from "@/types";
import { FlashcardItem } from "@/components/generate/FlashcardItem";

interface FlashcardListProps {
  proposals: FlashcardProposalDto[];
  onAccept: (index: number) => void;
  onReject: (index: number) => void;
  onEdit: (index: number, front: string, back: string) => void;
}

export const FlashcardList = memo(function FlashcardList({
  proposals,
  onAccept,
  onReject,
  onEdit,
}: FlashcardListProps) {
  if (proposals.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {proposals.map((proposal, index) => (
        <FlashcardItem
          key={index}
          proposal={proposal}
          onAccept={() => onAccept(index)}
          onReject={() => onReject(index)}
          onEdit={(front, back) => onEdit(index, front, back)}
        />
      ))}
    </div>
  );
});
