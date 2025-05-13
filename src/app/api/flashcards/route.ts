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

export const PUT = async () => {
  return new NextResponse('Method not allowed', { status: 405 });
};

export const DELETE = async () => {
  return new NextResponse('Method not allowed', { status: 405 });
};

export const PATCH = async () => {
  return new NextResponse('Method not allowed', { status: 405 });
};

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
