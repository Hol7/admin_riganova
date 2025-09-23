'use client';

import { useQuery } from '@tanstack/react-query';
import { statsApi, deliveriesApi } from '@/app/lib/api';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function StatsPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.getStats,
  });

  const { data: deliveries, isLoading: deliveriesLoading } = useQuery({
    queryKey: ['all-deliveries'],
    queryFn: deliveriesApi.getAllDeliveries,
  });

  const isLoading = statsLoading || deliveriesLoading;

  // Calculate additional stats from deliveries data
  const deliveryStats = deliveries ? {
    total: deliveries.length,
    pending: deliveries.filter((d: any) => d.statut === 'en_attente').length,
    inProgress: deliveries.filter((d: any) => ['assigne', 'en_route_pickup', 'en_route_livraison'].includes(d.statut)).length,
    completed: deliveries.filter((d: any) => d.statut === 'livre').length,
    cancelled: deliveries.filter((d: any) => d.statut === 'annule').length,
  } : null;

  const statCards = [
    {
      title: 'Livraisons Totales',
      value: deliveryStats?.total || 0,
      icon: Package,
      color: 'bg-blue-500',
      description: 'Toutes les livraisons',
    },
    {
      title: 'En Attente',
      value: deliveryStats?.pending || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      description: 'Livraisons en attente',
    },
    {
      title: 'En Cours',
      value: deliveryStats?.inProgress || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      description: 'Livraisons en cours',
    },
    {
      title: 'Terminées',
      value: deliveryStats?.completed || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      description: 'Livraisons terminées',
    },
    {
      title: 'Annulées',
      value: deliveryStats?.cancelled || 0,
      icon: XCircle,
      color: 'bg-red-500',
      description: 'Livraisons annulées',
    },
    {
      title: 'Utilisateurs Actifs',
      value: stats?.active_users || 0,
      icon: Users,
      color: 'bg-purple-500',
      description: 'Utilisateurs actifs',
    },
  ];

  const getSuccessRate = () => {
    if (!deliveryStats || deliveryStats.total === 0) return 0;
    return Math.round((deliveryStats.completed / deliveryStats.total) * 100);
  };

  const getCancellationRate = () => {
    if (!deliveryStats || deliveryStats.total === 0) return 0;
    return Math.round((deliveryStats.cancelled / deliveryStats.total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-gray-900">
            Statistiques
          </h1>
          <p className="text-gray-600 font-montserrat font-medium mt-1">
            Analyse détaillée de votre activité
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-xl">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="text-sm font-montserrat font-medium">
            {new Date().toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
          <p className="text-gray-500 font-montserrat ml-3">Chargement des statistiques...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-xl`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-montserrat font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-sm font-montserrat font-medium text-gray-600">
                        {stat.title}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-montserrat text-gray-500">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Success Rate */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-montserrat font-bold text-gray-900">
                  Taux de Réussite
                </h3>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-2xl font-montserrat font-bold text-green-600">
                    {getSuccessRate()}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-montserrat font-medium text-gray-600">
                    Livraisons réussies
                  </span>
                  <span className="font-montserrat font-semibold text-gray-900">
                    {deliveryStats?.completed || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getSuccessRate()}%` }}
                  ></div>
                </div>
                <p className="text-xs font-montserrat text-gray-500">
                  {deliveryStats?.completed || 0} sur {deliveryStats?.total || 0} livraisons terminées avec succès
                </p>
              </div>
            </div>

            {/* Cancellation Rate */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-montserrat font-bold text-gray-900">
                  Taux d'Annulation
                </h3>
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-2xl font-montserrat font-bold text-red-600">
                    {getCancellationRate()}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-montserrat font-medium text-gray-600">
                    Livraisons annulées
                  </span>
                  <span className="font-montserrat font-semibold text-gray-900">
                    {deliveryStats?.cancelled || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getCancellationRate()}%` }}
                  ></div>
                </div>
                <p className="text-xs font-montserrat text-gray-500">
                  {deliveryStats?.cancelled || 0} sur {deliveryStats?.total || 0} livraisons ont été annulées
                </p>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-montserrat font-bold text-gray-900 mb-6">
              Distribution des Statuts
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-montserrat font-bold text-yellow-600 mb-1">
                  {deliveryStats?.pending || 0}
                </p>
                <p className="text-sm font-montserrat font-medium text-yellow-700">
                  En Attente
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="w-12 h-12 bg-orange-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-montserrat font-bold text-orange-600 mb-1">
                  {deliveryStats?.inProgress || 0}
                </p>
                <p className="text-sm font-montserrat font-medium text-orange-700">
                  En Cours
                </p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="w-12 h-12 bg-green-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-montserrat font-bold text-green-600 mb-1">
                  {deliveryStats?.completed || 0}
                </p>
                <p className="text-sm font-montserrat font-medium text-green-700">
                  Terminées
                </p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="w-12 h-12 bg-red-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-montserrat font-bold text-red-600 mb-1">
                  {deliveryStats?.cancelled || 0}
                </p>
                <p className="text-sm font-montserrat font-medium text-red-700">
                  Annulées
                </p>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-montserrat font-bold text-gray-900 mb-6">
              Métriques Additionnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-primary-600" />
                </div>
                <p className="text-2xl font-montserrat font-bold text-gray-900 mb-1">
                  {stats?.monthly_revenue || 0}FCFA
                </p>
                <p className="text-sm font-montserrat font-medium text-gray-600">
                  Revenus du Mois
                </p>
                <p className="text-xs font-montserrat text-gray-500 mt-1">
                  +15% vs mois dernier
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-8 h-8 text-accent-600" />
                </div>
                <p className="text-2xl font-montserrat font-bold text-gray-900 mb-1">
                  {deliveryStats ? Math.round((deliveryStats.completed / Math.max(deliveryStats.total, 1)) * 100) : 0}%
                </p>
                <p className="text-sm font-montserrat font-medium text-gray-600">
                  Taux de Complétion
                </p>
                <p className="text-xs font-montserrat text-gray-500 mt-1">
                  Livraisons terminées avec succès
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-2xl font-montserrat font-bold text-gray-900 mb-1">
                  {stats?.active_zones || 0}
                </p>
                <p className="text-sm font-montserrat font-medium text-gray-600">
                  Zones Actives
                </p>
                <p className="text-xs font-montserrat text-gray-500 mt-1">
                  Zones de livraison configurées
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}