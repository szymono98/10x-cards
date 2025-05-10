import { NextRequest, NextResponse } from 'next/server';
import { flashcardsService } from './flashcards.service';
import { z } from 'zod';

const createFlashcardSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const validateCreateCommand = (data: unknown) => {
  return createFlashcardSchema.safeParse(data);
};

// Configure route for static generation
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Define allowed HTTP methods
export const GET = async () => {
  return new NextResponse('Method not allowed', { status: 405 });
};

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

    const validation = validateCreateCommand(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
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
