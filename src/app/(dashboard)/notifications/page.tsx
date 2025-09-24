'use client';

import { useNotifications } from '@/app/hooks/useNotifications';

export default function NotificationsPage() {
  const { playNotificationSound } = useNotifications();

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
        <p className="text-sm text-gray-600 font-montserrat">
          Les nouvelles demandes de livraison déclencheront une alerte sonore si votre navigateur l'autorise.
          Assurez-vous d'avoir interagi au moins une fois avec la page (bouton "Tester le son").
        </p>
      </div>
    </div>
  );
}
