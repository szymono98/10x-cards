import { NextRequest, NextResponse } from 'next/server';
import { GenerateFlashcardsCommand } from '@/types';
import { validateGenerateCommand } from './generations.validation';
import { generationsService } from './generations.service';

export const runtime = 'edge';

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
