"use client";

import { useState, useCallback, useTransition } from "react";
import { TextInputArea } from "@/components/generate/TextInputArea";
import { GenerateButton } from "@/components/generate/GenerateButton";
import type { GenerateFlashcardsCommand, FlashcardProposalDto } from "@/types";
import { useGenerateFlashcards } from "@/hooks/useGenerateFlashcards";
import { FlashcardList } from "./FlashcardList";
import { BulkSaveButton } from "@/components/generate/BulkSaveButton";
import { ErrorNotification } from "@/components/common/ErrorNotification";
import { useSaveFlashcards } from "@/hooks/useSaveFlashcards";
import { SuccessNotification } from "@/components/common/SuccessNotification";

interface FlashcardProposalWithStatus extends FlashcardProposalDto {
  accepted: boolean;
  edited: boolean;
}

export function FlashcardGenerationView() {
  const [text, setText] = useState("");
  const { generate, isLoading, error } = useGenerateFlashcards();
  const [proposals, setProposals] = useState<FlashcardProposalWithStatus[]>([]);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const { save, isLoading: isSaving, error: saveError } = useSaveFlashcards();
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = async () => {
    if (!text || text.length < 1000 || text.length > 10000) return;

    const command: GenerateFlashcardsCommand = {
      source_text: text,
    };

    try {
      const result = await generate(command);
      setGenerationId(result.generation_id);
      setProposals(
        result.flashcards_proposals.map((proposal) => ({
          ...proposal,
          accepted: false,
          edited: false,
        }))
      );
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
    }
  };

  const handleAccept = useCallback((index: number) => {
    setProposals((prev) =>
      prev.map((proposal, i) =>
        i === index ? { ...proposal, accepted: !proposal.accepted } : proposal
      )
    );
  }, []);

  const handleReject = useCallback((index: number) => {
    setProposals((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleEdit = useCallback(
    (index: number, front: string, back: string) => {
      setProposals((prev) =>
        prev.map((proposal, i) =>
          i === index ? { ...proposal, front, back, edited: true } : proposal
        )
      );
    },
    []
  );

  const handleSaveAccepted = useCallback(async () => {
    if (!generationId) return;
    setSuccess(null);

    const acceptedFlashcards = proposals
      .filter((p) => p.accepted)
      .map((p) => ({
        front: p.front,
        back: p.back,
        source: p.edited ? ("ai-edited" as const) : ("ai-full" as const),
        generation_id: generationId,
      }));

    try {
      await save({ flashcards: acceptedFlashcards });
      startTransition(() => {
        setSuccess("Flashcards are saved successfully");
        setProposals([]);
        setGenerationId(null);
        setText("");
      });
    } catch (error) {
      console.error("Failed to save flashcards:", error);
    }
  }, [proposals, generationId, save, setText]);

  const handleSaveAll = useCallback(async () => {
    if (!generationId) return;
    setSuccess(null);

    const allFlashcards = proposals.map((p) => ({
      front: p.front,
      back: p.back,
      source: p.edited ? ("ai-edited" as const) : ("ai-full" as const),
      generation_id: generationId,
    }));

    try {
      await save({ flashcards: allFlashcards });
      startTransition(() => {
        setSuccess("All flashcards are saved successfully");
        setProposals([]);
        setGenerationId(null);
        setText("");
      });
    } catch (error) {
      console.error("Failed to save flashcards:", error);
    }
  }, [proposals, generationId, save, setText]);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Flashcards generate</h1>
      <div className="space-y-6">
        <TextInputArea value={text} onChange={setText} />
        <GenerateButton
          onClick={handleGenerate}
          disabled={
            !text || text.length < 1000 || text.length > 10000 || isLoading
          }
          isLoading={isLoading}
        />
        {(error || saveError) && (
          <ErrorNotification message={error || saveError || ""} />
        )}
        {success && <SuccessNotification message={success} />}
        {proposals.length > 0 && (
          <>
            <FlashcardList
              proposals={proposals}
              onAccept={handleAccept}
              onReject={handleReject}
              onEdit={handleEdit}
            />
            <div className="flex gap-4">
              <BulkSaveButton
                onSaveAccepted={handleSaveAccepted}
                hasAcceptedFlashcards={proposals.some((p) => p.accepted)}
                isLoading={isSaving || isPending}
              />
              <BulkSaveButton
                onSaveAccepted={handleSaveAll}
                hasAcceptedFlashcards={proposals.length > 0}
                isLoading={isSaving || isPending}
                label="Zapisz wszystkie"
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
