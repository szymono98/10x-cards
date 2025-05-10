import { NextRequest, NextResponse } from 'next/server';
import { GenerateFlashcardsCommand } from '@/types';
import { validateGenerateCommand } from './generations.validation';
import { generationsService } from './generations.service';

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
    const validation = validateGenerateCommand(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const command = body as GenerateFlashcardsCommand;
    const result = await generationsService.generate(command);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error processing generation request:', error);
    return NextResponse.json(
      { error: 'Internal server error during generation' },
      { status: 500 }
    );
  }
}
