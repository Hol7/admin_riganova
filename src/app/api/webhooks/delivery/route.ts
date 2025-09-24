import { NextRequest, NextResponse } from 'next/server';
import { broadcastToClients } from '@/app/lib/api';

export const runtime = 'edge';

// Map backend webhook events to our client notification types/messages
function mapToClientNotification(payload: any) {
  const event = payload?.event as string | undefined;
  const data = payload?.data || {};
  const timestamp = payload?.timestamp || new Date().toISOString();

  if (!event) {
    return { type: 'status_update', message: 'Notification reçue', delivery: data, timestamp };
  }

  switch (event) {
    case 'delivery_created':
      return {
        type: 'new_delivery',
        message: `Nouvelle livraison #${data?.delivery_id ?? ''} créée`,
        delivery: data,
        timestamp,
      };
    case 'delivery_assigned':
      return {
        type: 'assignment',
        message: `Livraison #${data?.delivery_id ?? ''} assignée`,
        delivery: data,
        timestamp,
      };
    case 'delivery_status_changed':
      return {
        type: 'status_update',
        message: `Statut de la livraison #${data?.delivery_id ?? ''} mis à jour: ${data?.status ?? ''}`,
        delivery: data,
        timestamp,
      };
    case 'delivery_cancelled':
      return {
        type: 'status_update',
        message: `Livraison #${data?.delivery_id ?? ''} annulée`,
        delivery: data,
        timestamp,
      };
    default:
      return { type: 'status_update', message: 'Notification reçue', delivery: data, timestamp };
  }
}

export async function POST(req: NextRequest) {
  // If you add HMAC signature validation, prefer using req.text() then JSON.parse for raw body verification
  const body = await req.json().catch(() => null);
  if (!body) {
    return new NextResponse('Invalid JSON', { status: 400 });
  }

  // Transform to the format expected by useNotifications
  const clientNotification = mapToClientNotification(body);

  // Broadcast to all connected SSE clients
  try {
    broadcastToClients(clientNotification);
  } catch (e) {
    // Swallow errors to avoid retries from the webhook sender
  }

  return NextResponse.json({ ok: true });
}
