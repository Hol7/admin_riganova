'use client';

import { useNotifications } from '@/app/hooks/useNotifications';

export default function NotificationsPage() {
  const { playNotificationSound, items } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 font-montserrat mt-1">Flux d'événements en temps réel</p>
        </div>
        <button onClick={playNotificationSound} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-montserrat font-semibold">
          Tester le son
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 font-montserrat">Pas de notifications</p>
            <p className="text-sm text-gray-400 font-montserrat mt-1">Elles apparaîtront ici dès qu'un événement sera reçu.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((n, idx) => (
              <li key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="font-montserrat font-semibold text-gray-900">
                    {n.type === 'new_delivery' && 'Nouvelle livraison'}
                    {n.type === 'status_update' && 'Mise à jour de statut'}
                    {n.type === 'assignment' && 'Assignation livreur'}
                  </div>
                  <div className="text-xs font-montserrat text-gray-500">{(n as any).timestamp || ''}</div>
                </div>
                <div className="text-sm font-montserrat text-gray-700 mt-1">{n.message}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

