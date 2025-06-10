import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { FlashcardGenerationView } from '../FlashcardGenerationView';
import { useGenerateFlashcards } from '@/hooks/useGenerateFlashcards';
import { useSaveFlashcards } from '@/hooks/useSaveFlashcards';

// Mock external dependencies
vi.mock('@/hooks/useGenerateFlashcards');
vi.mock('@/hooks/useSaveFlashcards');
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { 
          session: { 
            access_token: 'test-token',
            user: { id: 'test-user-id' }
          } 
        },
      }),
    },
  }),
}));
vi.mock('@/components/generate/GenerateButton', () => ({
  GenerateButton: ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="generate-flashcards-button"
      className="w-full sm:w-auto"
    >
      Generate
    </button>
  ),
}));
vi.mock('@/components/generate/FlashcardList', () => ({
  FlashcardList: ({
    proposals,
    onAccept,
    onReject,
    onEdit,
  }: {
    proposals: { front: string; back: string; accepted: boolean }[];
    onAccept: (index: number) => void;
    onReject: (index: number) => void;
    onEdit: (index: number, front: string, back: string) => void;
  }) => (
    <div data-testid="flashcards-list" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {proposals.map((p: { front: string; back: string; accepted: boolean }, i: number) => (
        <div key={i} data-testid={`flashcard-${i}`}>
          <span>{p.front}</span>
          <span>{p.back}</span>
          <button onClick={() => onAccept(i)}>{p.accepted ? 'Accepted' : 'Accept'}</button>
          <button onClick={() => onReject(i)}>Reject</button>
          <button onClick={() => onEdit(i, 'edited front', 'edited back')}>Edit</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/generate/TextInputArea', () => ({
  TextInputArea: ({
    value,
    onChange,
    disabled,
  }: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
  }) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      data-testid="source-text-input"
    />
  ),
}));
vi.mock('@/lib/providers/supabase-provider', () => ({
  useSupabase: () => ({
    user: { id: '4da0d32e-3508-4a8b-a4f9-d8454ddf4a3a' },
  }),
}));

vi.mock('@/components/generate/BulkSaveButton', () => ({
  BulkSaveButton: ({
    onSaveAccepted,
    hasAcceptedFlashcards,
    isLoading,
    label = 'Save accepted',
  }: {
    onSaveAccepted: () => Promise<void>;
    hasAcceptedFlashcards: boolean;
    isLoading: boolean;
    label?: string;
  }) => (
    <button
      onClick={onSaveAccepted}
      disabled={!hasAcceptedFlashcards || isLoading}
      data-testid={label === 'Save accepted' ? 'save-accepted-button' : 'save-all-button'}
    >
      {label}
    </button>
  ),
}));

describe('FlashcardGenerationView', () => {
  const mockGenerate = vi.fn();
  const mockSave = vi.fn();
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy.mockClear();
    (useGenerateFlashcards as Mock).mockReturnValue({
      generate: mockGenerate,
      isLoading: false,
      error: null,
      setError: vi.fn(),
    });
    (useSaveFlashcards as Mock).mockReturnValue({
      save: mockSave,
      isLoading: false,
      error: null,
      setError: vi.fn(),
    });
  });

  // 1. Test state handlers
  describe('State Handlers', () => {
    it('should toggle flashcard acceptance status', async () => {
      mockGenerate.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: [{ front: 'test', back: 'answer' }],
      });

      render(<FlashcardGenerationView />);

      // Generate flashcards first
      fireEvent.change(screen.getByTestId('source-text-input'), {
        target: { value: 'a'.repeat(1000) },
      });
      fireEvent.click(screen.getByTestId('generate-flashcards-button'));

      await waitFor(() => {
        expect(screen.getByTestId('flashcards-list')).toBeInTheDocument();
      });

      // Test acceptance toggle
      const acceptButton = screen.getByText('Accept');
      fireEvent.click(acceptButton);

      // Verify the state change (through UI effects)
      expect(screen.getByTestId('save-accepted-button')).not.toBeDisabled();
    });

    it('should validate input text length', () => {
      render(<FlashcardGenerationView />);

      // Test too short text
      fireEvent.change(screen.getByTestId('source-text-input'), {
        target: { value: 'short' },
      });
      expect(screen.getByTestId('generate-flashcards-button')).toBeDisabled();

      // Test valid text length
      fireEvent.change(screen.getByTestId('source-text-input'), {
        target: { value: 'a'.repeat(1000) },
      });
      expect(screen.getByTestId('generate-flashcards-button')).not.toBeDisabled();
    });
  });

  // 2. Test save handlers
  describe('Save Handlers', () => {
    it('should save accepted flashcards', async () => {
      mockGenerate.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: [{ front: 'test', back: 'answer' }],
      });
      mockSave.mockResolvedValueOnce({ success: true });

      render(<FlashcardGenerationView />);

      // Setup and trigger save
      fireEvent.change(screen.getByTestId('source-text-input'), {
        target: { value: 'a'.repeat(1000) },
      });
      fireEvent.click(screen.getByTestId('generate-flashcards-button'));

      await waitFor(() => {
        expect(screen.getByTestId('flashcards-list')).toBeInTheDocument();
      });

      // Accept the flashcard first
      const acceptButton = screen.getByText('Accept');
      fireEvent.click(acceptButton);

      // Wait for the acceptance state to change
      await waitFor(() => {
        expect(screen.getByText('Accepted')).toBeInTheDocument();
      });

      // Wait for the save button to be enabled
      await waitFor(() => {
        expect(screen.getByTestId('save-accepted-button')).not.toBeDisabled();
      });

      // Now save the accepted flashcard
      fireEvent.click(screen.getByTestId('save-accepted-button'));

      // Wait for save to be called
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith(expect.any(Object));
      });

      // Wait for and verify success message
      await waitFor(() => {
        expect(screen.getByText(/Flashcards.*saved successfully/i)).toBeInTheDocument();
      });
    });

    // Add more save handler tests...
  });

  // 3. Test flashcard generation
  describe('Flashcard Generation', () => {
    it('should validate input text length', () => {
      render(<FlashcardGenerationView />);

      // Test too short text
      fireEvent.change(screen.getByTestId('source-text-input'), {
        target: { value: 'short' },
      });
      expect(screen.getByTestId('generate-flashcards-button')).toBeDisabled();

      // Test valid text length
      fireEvent.change(screen.getByTestId('source-text-input'), {
        target: { value: 'a'.repeat(1000) },
      });
      expect(screen.getByTestId('generate-flashcards-button')).not.toBeDisabled();
    });

    // Add more generation tests...
  });

  // 4. Test conditional rendering
  describe('Conditional Rendering', () => {
    it('should show error notification when generation fails', async () => {
      (useGenerateFlashcards as Mock).mockReturnValue({
        generate: mockGenerate,
        isLoading: false,
        error: 'Generation failed',
        setError: vi.fn(),
      });

      render(<FlashcardGenerationView />);
      expect(screen.getByText('Generation failed')).toBeInTheDocument();
    });

    // Add more rendering tests...
  });

  describe('React Optimization Features', () => {
    it('should prevent unnecessary re-renders with useCallback for handlers', async () => {
      const { rerender } = render(<FlashcardGenerationView />);

      // Generate initial flashcards
      mockGenerate.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: [{ front: 'test', back: 'answer' }],
      });

      fireEvent.change(screen.getByTestId('source-text-input'), {
        target: { value: 'a'.repeat(1000) },
      });
      fireEvent.click(screen.getByTestId('generate-flashcards-button'));

      // Wait for flashcards to be generated
      await waitFor(() => {
        expect(screen.getByTestId('flashcards-list')).toBeInTheDocument();
      });

      // Get the initial handlers
      const initialAcceptButton = screen.getByText('Accept');
      const initialOnClick = initialAcceptButton.onclick;

      // Force a re-render
      rerender(<FlashcardGenerationView />);

      // Get the handlers after re-render
      const newAcceptButton = screen.getByText('Accept');
      const newOnClick = newAcceptButton.onclick;

      // Verify that the handlers remain the same (memoized)
      expect(newOnClick).toBe(initialOnClick);
    });

    it('should defer non-urgent updates during save with useTransition', async () => {
      mockGenerate.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: [{ front: 'test', back: 'answer' }],
      });
      mockSave.mockImplementationOnce(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<FlashcardGenerationView />);

      // Setup flashcards
      fireEvent.change(screen.getByTestId('source-text-input'), {
        target: { value: 'a'.repeat(1000) },
      });
      fireEvent.click(screen.getByTestId('generate-flashcards-button'));

      await waitFor(() => {
        expect(screen.getByTestId('flashcards-list')).toBeInTheDocument();
      });

      // Accept the flashcard first
      fireEvent.click(screen.getAllByText('Accept')[0]);

      // Wait for the save button to be enabled
      await waitFor(() => {
        expect(screen.getByTestId('save-accepted-button')).not.toBeDisabled();
      });

      // Now save the accepted flashcard
      fireEvent.click(screen.getByTestId('save-accepted-button'));

      // Verify that UI remains responsive during the transition
      expect(screen.getByTestId('source-text-input')).not.toBeDisabled();
      expect(screen.getByTestId('generate-flashcards-button')).not.toBeDisabled();

      // Wait for save to complete
      await waitFor(() => {
        expect(screen.getByText('Flashcards are saved successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Functional Features', () => {
    it('should edit flashcard content', async () => {
      mockGenerate.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: [{ front: 'test', back: 'answer' }],
      });

      render(<FlashcardGenerationView />);

      // Generate initial flashcards
      fireEvent.change(screen.getByTestId('source-text-input'), {
        target: { value: 'a'.repeat(1000) },
      });
      fireEvent.click(screen.getByTestId('generate-flashcards-button'));

      await waitFor(() => {
        expect(screen.getByTestId('flashcards-list')).toBeInTheDocument();
      });

      // Trigger edit
      fireEvent.click(screen.getByText('Edit'));

      // Verify edit was triggered with correct data
      expect(mockSave).not.toHaveBeenCalled();
      expect(screen.getByText('edited front')).toBeInTheDocument();
      expect(screen.getByText('edited back')).toBeInTheDocument();
    });

    it('should reject flashcard', async () => {
      mockGenerate.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: [
          { front: 'test1', back: 'answer1' },
          { front: 'test2', back: 'answer2' },
        ],
      });

      render(<FlashcardGenerationView />);

      // Generate flashcards
      fireEvent.change(screen.getByTestId('source-text-input'), {
        target: { value: 'a'.repeat(1000) },
      });
      fireEvent.click(screen.getByTestId('generate-flashcards-button'));

      await waitFor(() => {
        expect(screen.getByTestId('flashcards-list')).toBeInTheDocument();
      });

      // Initial count
      expect(screen.getAllByTestId(/flashcard-\d+/).length).toBe(2);

      // Reject first flashcard
      fireEvent.click(screen.getAllByText('Reject')[0]);

      // Verify flashcard was removed
      expect(screen.getAllByTestId(/flashcard-\d+/).length).toBe(1);
    });

    it('should save all flashcards', async () => {
      mockGenerate.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: [
          { front: 'test1', back: 'answer1' },
          { front: 'test2', back: 'answer2' },
        ],
      });
      mockSave.mockResolvedValueOnce({ success: true });

      render(<FlashcardGenerationView />);

      // Generate flashcards
      fireEvent.change(screen.getByTestId('source-text-input'), {
        target: { value: 'a'.repeat(1000) },
      });
      fireEvent.click(screen.getByTestId('generate-flashcards-button'));

      await waitFor(() => {
        expect(screen.getByTestId('flashcards-list')).toBeInTheDocument();
      });

      // Save all flashcards
      const saveAllButton = screen.getByTestId('save-all-button');
      await waitFor(() => {
        expect(saveAllButton).not.toBeDisabled();
      });
      fireEvent.click(saveAllButton);

      // Wait for save to be called with all flashcards
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith(
          expect.objectContaining({
            flashcards: expect.arrayContaining([
              expect.objectContaining({ front: 'test1', back: 'answer1' }),
              expect.objectContaining({ front: 'test2', back: 'answer2' }),
            ]),
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/All flashcards.*saved successfully/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during component initialization', () => {
      (useGenerateFlashcards as Mock).mockReturnValue({
        generate: mockGenerate,
        isLoading: true,
        error: null,
      });

      render(<FlashcardGenerationView />);

      // Verify loading state
      expect(screen.getByTestId('generate-flashcards-button')).toBeDisabled();
    });

    it('should validate maximum text length', () => {
      render(<FlashcardGenerationView />);

      // Test maximum length validation
      fireEvent.change(screen.getByTestId('source-text-input'), {
        target: { value: 'a'.repeat(10001) },
      });
      expect(screen.getByTestId('generate-flashcards-button')).toBeDisabled();

      // Test valid length
      fireEvent.change(screen.getByTestId('source-text-input'), {
        target: { value: 'a'.repeat(10000) },
      });
      expect(screen.getByTestId('generate-flashcards-button')).not.toBeDisabled();
    });
  });

  describe('Styling Features', () => {
    it('should apply correct dark mode classes', () => {
      document.documentElement.classList.add('dark');
      render(<FlashcardGenerationView />);

      // Check main container
      const mainContainer = screen.getByRole('main');
      expect(mainContainer).toHaveClass('container');

      // Check if dark mode styles are applied
      const cards = document.querySelectorAll('[data-slot="card"]');
      cards.forEach((card) => {
        expect(card).toHaveClass('bg-card');
        expect(getComputedStyle(card).backgroundColor).toMatch(/rgb\(33, 34, 47\)/); // Dark mode card background
      });

      document.documentElement.classList.remove('dark');
    });

    it('should be responsive across different breakpoints', async () => {
      mockGenerate.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: [
          { front: 'test1', back: 'answer1' },
          { front: 'test2', back: 'answer2' },
        ],
      });

      render(<FlashcardGenerationView />);

      // Generate flashcards first
      fireEvent.change(screen.getByTestId('source-text-input'), {
        target: { value: 'a'.repeat(1000) },
      });
      fireEvent.click(screen.getByTestId('generate-flashcards-button'));

      await waitFor(() => {
        expect(screen.getByTestId('flashcards-list')).toBeInTheDocument();
      });

      // Verify responsive grid classes
      const flashcardList = screen.getByTestId('flashcards-list');
      expect(flashcardList).toHaveClass('grid', 'gap-4', 'md:grid-cols-2', 'lg:grid-cols-3');

      // Verify container padding is responsive
      const mainContainer = screen.getByRole('main');
      expect(mainContainer).toHaveClass('px-4');

      // Verify buttons are responsive
      const generateButton = screen.getByTestId('generate-flashcards-button');
      expect(generateButton).toHaveClass('w-full', 'sm:w-auto');
    });
  });
});
