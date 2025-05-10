import { NextRequest, NextResponse } from 'next/server';
import { FlashcardsCreateCommand } from '@/types';
import { validateFlashcardsCommand } from './flashcards.validation';
import { flashcardsService } from './flashcards.service';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

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
    const validation = validateFlashcardsCommand(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const command = body as FlashcardsCreateCommand;
    const result = await flashcardsService.create(command);

    return NextResponse.json({ flashcards: result }, { status: 201 });
  } catch (error) {
    console.error('Error processing flashcards creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
