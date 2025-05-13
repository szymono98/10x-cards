import { NextRequest, NextResponse } from 'next/server';
import { flashcardsService } from './flashcards.service';
import { validateFlashcardsCommand } from './flashcards.validation';

// Configure route for standard Node.js runtime
export const runtime = 'edge';

export async function GET() {
  try {
    const flashcards = await flashcardsService.getAll();
    return NextResponse.json({ data: flashcards, pagination: { page: 1, limit: 100, total: flashcards.length } });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error during flashcards fetch', details: message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    if (!id || typeof id !== 'number') {
      return NextResponse.json({ error: 'Invalid flashcard ID' }, { status: 400 });
    }

    const flashcard = await flashcardsService.update(id, updates);
    return NextResponse.json(flashcard);
  } catch (error) {
    console.error('Error updating flashcard:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error during flashcard update', details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== 'number') {
      return NextResponse.json({ error: 'Invalid flashcard ID' }, { status: 400 });
    }

    await flashcardsService.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error during flashcard deletion', details: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = validateFlashcardsCommand(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const flashcards = await flashcardsService.create(body);
    return NextResponse.json({ flashcards }, { status: 201 });
  } catch (error) {
    console.error('Error processing flashcards creation:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error during flashcards creation', details: message },
      { status: 500 }
    );
  }
}
