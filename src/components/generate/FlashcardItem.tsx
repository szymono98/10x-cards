import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Edit2 } from "lucide-react";
import type { FlashcardProposalDto } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FlashcardItemProps {
  proposal: FlashcardProposalDto;
  onAccept: () => void;
  onReject: () => void;
  onEdit: (front: string, back: string) => void;
}

export function FlashcardItem({
  proposal,
  onAccept,
  onReject,
  onEdit,
}: FlashcardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(proposal.front);
  const [back, setBack] = useState(proposal.back);

  const handleEdit = useCallback(() => {
    if (isEditing) {
      onEdit(front, back);
    }
    setIsEditing(!isEditing);
  }, [isEditing, front, back, onEdit]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 space-y-4">
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="Przód fiszki"
                  maxLength={200}
                />
                <Textarea
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="Tył fiszki"
                  maxLength={500}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-medium">{front}</p>
                <p className="text-gray-600 dark:text-gray-400">{back}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edytuj fiszkę</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onReject}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Odrzuć fiszkę</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={onAccept}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zaakceptuj fiszkę</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
