import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import type { FlashcardDto } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FlashcardItemViewProps {
  flashcard: FlashcardDto;
  onDelete: (id: number) => void;
  onEdit: (id: number, front: string, back: string) => void;
  'data-testid'?: string;
}

export function FlashcardItemView({
  flashcard,
  onDelete,
  onEdit,
  'data-testid': testId,
}: FlashcardItemViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(flashcard.front);
  const [editedBack, setEditedBack] = useState(flashcard.back);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
  }, [flashcard.front, flashcard.back]);

  const handleSaveEdit = useCallback(() => {
    onEdit(flashcard.id, editedFront, editedBack);
    setIsEditing(false);
  }, [flashcard.id, editedFront, editedBack, onEdit]);

  const handleCancelEdit = useCallback(() => {
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
    setIsEditing(false);
  }, [flashcard.front, flashcard.back]);

  const handleDelete = useCallback(() => {
    onDelete(flashcard.id);
  }, [flashcard.id, onDelete]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        data-testid={testId}
      >
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Textarea
                    value={editedFront}
                    onChange={(e) => setEditedFront(e.target.value)}
                    placeholder="Front of the flashcard"
                    maxLength={200}
                    data-testid={`${testId}-front-edit`}
                  />
                  <Textarea
                    value={editedBack}
                    onChange={(e) => setEditedBack(e.target.value)}
                    placeholder="Back of the flashcard"
                    maxLength={500}
                    data-testid={`${testId}-back-edit`}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`${testId}-cancel-edit-button`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cancel edit</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-700"
                          data-testid={`${testId}-save-edit-button`}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save changes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="font-medium" data-testid={`${testId}-front`}>
                    {flashcard.front}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400" data-testid={`${testId}-back`}>
                    {flashcard.back}
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStartEdit}
                          data-testid={`${testId}-edit-button`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit flashcard</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDelete}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`${testId}-delete-button`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete flashcard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}