'use client';

import { useQuery } from '@tanstack/react-query';
import { statsApi, deliveriesApi } from '@/app/lib/api';
import { useNotifications } from '@/app/hooks/useNotifications';
import { Package, Users, MapPin, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  useNotifications(); // Initialize notifications

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.getStats,
  });

  const { data: recentDeliveries } = useQuery({
    queryKey: ['recent-deliveries'],
    queryFn: deliveriesApi.getAllDeliveries,
    select: (data) => data?.slice(0, 5) || [],
  });

  const statsCards = [
    {
      title: 'Total Livraisons',
      value: stats?.total_deliveries || 0,
      icon: Package,
      color: 'bg-primary-500',
      change: '+12%',
    },
    {
      title: 'Utilisateurs Actifs',
      value: stats?.active_users || 0,
      icon: Users,
      color: 'bg-accent-500',
      change: '+8%',
    },
    {
      title: 'Zones Actives',
      value: stats?.active_zones || 0,
      icon: MapPin,
      color: 'bg-green-500',
      change: '+3%',
    },
    {
      title: 'Revenus du Mois',
      value: `${stats?.monthly_revenue || 0}FCFA`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+15%',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigne':
        return 'bg-blue-100 text-blue-800';
      case 'en_route_pickup':
      case 'en_route_livraison':
        return 'bg-orange-100 text-orange-800';
      case 'livre':
        return 'bg-green-100 text-green-800';
      case 'annule':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en_attente':
        return Clock;
      case 'livre':
        return CheckCircle;
      default:
        return Package;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 font-montserrat font-medium mt-1">
            Vue d'ensemble de votre activité
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-montserrat font-medium">En ligne</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-montserrat font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-montserrat font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm font-montserrat font-semibold text-green-600">
                  {stat.change}
                </span>
                <span className="text-sm font-montserrat text-gray-500 ml-1">
                  vs mois dernier
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Deliveries */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-montserrat font-bold text-gray-900">
            Livraisons Récentes
          </h2>
        </div>
        <div className="p-6">
          {recentDeliveries && recentDeliveries.length > 0 ? (
            <div className="space-y-4">
              {recentDeliveries.map((delivery: any) => {
                const StatusIcon = getStatusIcon(delivery.statut);
                return (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                        <StatusIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-montserrat font-semibold text-gray-900">
                          Livraison #{delivery.id}
                        </p>
                        <p className="text-sm font-montserrat text-gray-600">
                          {delivery.description || 'Aucune description'}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500 font-montserrat">
                            De: {delivery.adresse_pickup}
                          </span>
                          <span className="text-xs text-gray-500 font-montserrat ml-2">
                            Vers: {delivery.adresse_dropoff}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-montserrat font-semibold ${getStatusColor(
                          delivery.statut
                        )}`}
                      >
                        {delivery.statut.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-sm font-montserrat font-semibold text-gray-900">
                        {delivery.prix}FCFA
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-montserrat">
                Aucune livraison récente
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
          <h3 className="font-montserrat font-bold text-lg mb-2">
            Nouvelle Livraison
          </h3>
          <p className="font-montserrat font-medium text-primary-100 mb-4">
            Créer une nouvelle livraison
          </p>
          <button className="bg-white text-primary-600 font-montserrat font-semibold px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors">
            Créer
          </button>
        </div>

        <div className="bg-gradient-to-br from-accent-400 to-accent-500 rounded-2xl p-6 text-white">
          <h3 className="font-montserrat font-bold text-lg mb-2">
            Gérer les Zones
          </h3>
          <p className="font-montserrat font-medium text-accent-100 mb-4">
            Configurer les zones de livraison
          </p>
          <button className="bg-white text-accent-600 font-montserrat font-semibold px-4 py-2 rounded-xl hover:bg-accent-50 transition-colors">
            Gérer
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <h3 className="font-montserrat font-bold text-lg mb-2">
            Rapports
          </h3>
          <p className="font-montserrat font-medium text-green-100 mb-4">
            Consulter les statistiques détaillées
          </p>
          <button className="bg-white text-green-600 font-montserrat font-semibold px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">
            Voir
          </button>
        </div>
      </div>
    </div>
  );
}