import { GenerateFlashcardsCommand } from '../../src/types';
import { validateGenerateCommand } from '../../src/app/api/generations/generations.validation';
import { generationsService } from '../../src/app/api/generations/generations.service';

export async function onRequestPost({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const validation = validateGenerateCommand(body);

    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const command = body as GenerateFlashcardsCommand;
    const result = await generationsService.generate(command);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing generation request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error during generation' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle other HTTP methods
export async function onRequest({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  return onRequestPost({ request });
}