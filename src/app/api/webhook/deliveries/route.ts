import { NextRequest, NextResponse } from 'next/server';
import { broadcastToClients } from '@/app/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the webhook payload
    if (!body.delivery) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { delivery, action } = body;
    
    let message = '';
    let type = '';

    switch (action) {
      case 'created':
        type = 'new_delivery';
        message = `Nouvelle livraison créée: ${delivery.description || 'Livraison #' + delivery.id}`;
        break;
      case 'status_updated':
        type = 'status_update';
        message = `Statut mis à jour: ${delivery.statut} pour la livraison #${delivery.id}`;
        break;
      case 'assigned':
        type = 'assignment';
        message = `Livraison #${delivery.id} assignée à un livreur`;
        break;
      default:
        type = 'info';
        message = `Mise à jour pour la livraison #${delivery.id}`;
    }

    // Broadcast to all connected clients
    const notification = {
      type,
      delivery,
      message,
      timestamp: new Date().toISOString(),
    };

    // Send notification to all connected SSE clients
    broadcastToClients(notification);

    return NextResponse.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}