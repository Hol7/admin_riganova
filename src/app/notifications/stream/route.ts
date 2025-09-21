import { NextRequest } from 'next/server';
import { addClient, removeClient } from '@/app/lib/api';

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Add client to the set
      addClient(controller);

      // Send initial connection message
      controller.enqueue(
        new TextEncoder().encode(`data: {"type":"connected","message":"Connected to notifications"}\n\n`)
      );

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        removeClient(controller);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}