import { NextRequest, NextResponse } from 'next/server';
import { generationsService } from './generations.service';
import { validateGenerateCommand } from './generations.validation';

export const runtime = 'edge';

// Configure route for static generation
export const dynamic = 'force-dynamic';

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

    const response = await generationsService.generate(body);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error processing generation request:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error during generation', details: message },
      { status: 500 }
    );
  }
}
