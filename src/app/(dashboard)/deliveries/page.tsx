'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveriesApi, usersApi } from '@/app/lib/api';
import toast from 'react-hot-toast';
import {
  Package,
  Search,
  Filter,
  MoreVertical,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  User,
} from 'lucide-react';

export default function DeliveriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['deliveries'],
    queryFn: deliveriesApi.getAllDeliveries,
  });

  const { data: livreurs } = useQuery({
    queryKey: ['livreurs'],
    queryFn: usersApi.getLivreurs,
  });

  const assignMutation = useMutation({
    mutationFn: ({ deliveryId, livreurId }: { deliveryId: number; livreurId: number }) =>
      deliveriesApi.assignDelivery(deliveryId, livreurId),
    onSuccess: () => {
      toast.success('Livraison assignée avec succès!');
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      setShowAssignModal(false);
      setSelectedDelivery(null);
    },
    onError: () => {
      toast.error('Erreur lors de l\'assignation');
    },
  });

  const statusUpdateMutation = useMutation({
    mutationFn: ({ deliveryId, status }: { deliveryId: number; status: string }) =>
      deliveriesApi.updateStatus(deliveryId, status),
    onSuccess: () => {
      toast.success('Statut mis à jour!');
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

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
      case 'annule':
        return XCircle;
      default:
        return Package;
    }
  };

  const filteredDeliveries = deliveries?.filter((delivery: any) => {
    const matchesSearch = 
      delivery.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.id.toString().includes(searchTerm);
    const matchesStatus = !statusFilter || delivery.statut === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleAssign = (livreurId: number) => {
    if (selectedDelivery) {
      assignMutation.mutate({
        deliveryId: selectedDelivery.id,
        livreurId: parseInt(livreurId.toString()),
      });
    }
  };

  const handleStatusUpdate = (deliveryId: number, status: string) => {
    statusUpdateMutation.mutate({ deliveryId, status });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-gray-900">
            Livraisons
          </h1>
          <p className="text-gray-600 font-montserrat font-medium mt-1">
            Gérer toutes les livraisons
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par description ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl font-montserrat focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl font-montserrat focus:border-primary-500 focus:outline-none appearance-none bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="assigne">Assigné</option>
              <option value="en_route_pickup">En route (pickup)</option>
              <option value="en_route_livraison">En route (livraison)</option>
              <option value="livre">Livré</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-500 font-montserrat mt-2">Chargement...</p>
          </div>
        ) : filteredDeliveries.length > 0 ? (
          <div className="overflow-hidden">
            {/* Desktop view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-montserrat font-semibold text-gray-700">
                      Livraison
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-montserrat font-semibold text-gray-700">
                      Adresses
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-montserrat font-semibold text-gray-700">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-montserrat font-semibold text-gray-700">
                      Livreur
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-montserrat font-semibold text-gray-700">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-montserrat font-semibold text-gray-700">
                      Prix
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-montserrat font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDeliveries.map((delivery: any) => {
                    const StatusIcon = getStatusIcon(delivery.statut);
                    return (
                      <tr key={delivery.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-3">
                              <StatusIcon className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-montserrat font-semibold text-gray-900">
                                #{delivery.id}
                              </p>
                              <p className="text-sm font-montserrat text-gray-500">
                                {delivery.description || 'Aucune description'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm font-montserrat text-gray-600">
                              <MapPin className="w-4 h-4 mr-1 text-green-500" />
                              {delivery.adresse_pickup}
                            </div>
                            <div className="flex items-center text-sm font-montserrat text-gray-600">
                              <MapPin className="w-4 h-4 mr-1 text-red-500" />
                              {delivery.adresse_dropoff}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-montserrat font-medium text-gray-900">
                            {delivery.client?.nom || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-montserrat font-medium text-gray-900">
                            {delivery.livreur?.nom || 'Non assigné'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-montserrat font-semibold ${getStatusColor(
                              delivery.statut
                            )}`}
                          >
                            {delivery.statut.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-montserrat font-semibold text-gray-900">
                            {delivery.prix}€
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {delivery.statut === 'en_attente' && (
                              <button
                                onClick={() => {
                                  setSelectedDelivery(delivery);
                                  setShowAssignModal(true);
                                }}
                                className="px-3 py-1 bg-primary-500 text-white text-xs font-montserrat font-semibold rounded-lg hover:bg-primary-600"
                              >
                                Assigner
                              </button>
                            )}
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile view */}
            <div className="md:hidden space-y-4 p-4">
              {filteredDeliveries.map((delivery: any) => {
                const StatusIcon = getStatusIcon(delivery.statut);
                return (
                  <div key={delivery.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-3">
                          <StatusIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-montserrat font-bold text-gray-900">
                            #{delivery.id}
                          </p>
                          <p className="text-sm font-montserrat text-gray-500">
                            {delivery.description || 'Aucune description'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-montserrat font-semibold ${getStatusColor(
                          delivery.statut
                        )}`}
                      >
                        {delivery.statut.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center font-montserrat text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-green-500" />
                        <span>De: {delivery.adresse_pickup}</span>
                      </div>
                      <div className="flex items-center font-montserrat text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-red-500" />
                        <span>Vers: {delivery.adresse_dropoff}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-montserrat font-medium text-gray-700">
                          Client: {delivery.client?.nom || 'N/A'}
                        </span>
                        <span className="font-montserrat font-semibold text-primary-600">
                          {delivery.prix}€
                        </span>
                      </div>
                    </div>
                    
                    {delivery.statut === 'en_attente' && (
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setShowAssignModal(true);
                        }}
                        className="w-full mt-3 px-4 py-2 bg-primary-500 text-white font-montserrat font-semibold rounded-xl hover:bg-primary-600"
                      >
                        Assigner un livreur
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-montserrat font-semibold text-gray-900 mb-2">
              Aucune livraison trouvée
            </h3>
            <p className="text-gray-500 font-montserrat">
              {searchTerm || statusFilter
                ? 'Aucune livraison ne correspond à vos critères de recherche.'
                : 'Il n\'y a pas encore de livraisons.'}
            </p>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-montserrat font-bold text-gray-900 mb-4">
              Assigner la livraison #{selectedDelivery.id}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                  Sélectionner un livreur
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-montserrat focus:border-primary-500 focus:outline-none"
                  onChange={(e) => e.target.value && handleAssign(parseInt(e.target.value))}
                  defaultValue=""
                >
                  <option value="" disabled>Choisir un livreur...</option>
                  {livreurs?.map((livreur: any) => (
                    <option key={livreur.id} value={livreur.id}>
                      {livreur.nom} - {livreur.telephone}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-montserrat font-semibold text-gray-900 mb-2">
                  Détails de la livraison
                </h4>
                <p className="text-sm font-montserrat text-gray-600 mb-1">
                  <strong>Description:</strong> {selectedDelivery.description || 'Aucune'}
                </p>
                <p className="text-sm font-montserrat text-gray-600 mb-1">
                  <strong>De:</strong> {selectedDelivery.adresse_pickup}
                </p>
                <p className="text-sm font-montserrat text-gray-600 mb-1">
                  <strong>Vers:</strong> {selectedDelivery.adresse_dropoff}
                </p>
                <p className="text-sm font-montserrat text-gray-600">
                  <strong>Prix:</strong> {selectedDelivery.prix}€
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedDelivery(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-montserrat font-semibold rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}