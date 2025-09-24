import { NextRequest } from 'next/server';
import { addClient, removeClient } from '@/app/lib/api';

export const runtime = 'edge';

export async function GET(_req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      addClient(controller);

      // Optional welcome event
      try {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'hello', message: 'stream connected' })}\n\n`));
      } catch {}

      // Keep-alive comments every 15s
      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`: keep-alive\n\n`));
        } catch {}
      }, 15000);

      const cleanup = () => {
        clearInterval(interval);
        removeClient(controller);
      };

      // @ts-ignore: controller may not expose signal in all runtimes
      controller.signal?.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
