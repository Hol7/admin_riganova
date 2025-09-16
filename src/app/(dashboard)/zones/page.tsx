'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zonesApi } from '@/app/lib/api';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  X
} from 'lucide-react';

interface ZoneForm {
  nom_zone: string;
  area: string;
  prix: number;
}

export default function ZonesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<ZoneForm>();

  const { data: zones, isLoading } = useQuery({
    queryKey: ['zones'],
    queryFn: zonesApi.getAllZones,
  });

  const createMutation = useMutation({
    mutationFn: zonesApi.createZone,
    onSuccess: () => {
      toast.success('Zone créée avec succès!');
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      setShowCreateModal(false);
      reset();
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ zoneId, ...data }: { zoneId: number } & ZoneForm) =>
      zonesApi.updateZone(zoneId, data),
    onSuccess: () => {
      toast.success('Zone mise à jour avec succès!');
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      setShowEditModal(false);
      setSelectedZone(null);
      reset();
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: zonesApi.deleteZone,
    onSuccess: () => {
      toast.success('Zone supprimée avec succès!');
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const filteredZones = zones?.filter((zone: any) =>
    zone.nom_zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.area?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const onSubmitCreate = (data: ZoneForm) => {
    createMutation.mutate(data);
  };

  const onSubmitEdit = (data: ZoneForm) => {
    if (selectedZone) {
      updateMutation.mutate({ zoneId: selectedZone.id, ...data });
    }
  };

  const handleEdit = (zone: any) => {
    setSelectedZone(zone);
    setValue('nom_zone', zone.nom_zone);
    setValue('area', zone.area);
    setValue('prix', zone.prix);
    setShowEditModal(true);
  };

  const handleDelete = (zoneId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette zone?')) {
      deleteMutation.mutate(zoneId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-gray-900">
            Zones de Livraison
          </h1>
          <p className="text-gray-600 font-montserrat font-medium mt-1">
            Gérer les zones et leurs tarifs
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 bg-primary-500 text-white px-6 py-3 rounded-xl font-montserrat font-semibold flex items-center hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Zone
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom ou zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl font-montserrat focus:border-primary-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Zones List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-500 font-montserrat mt-2">Chargement...</p>
          </div>
        ) : filteredZones.length > 0 ? (
          <div className="overflow-hidden">
            {/* Desktop view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-montserrat font-semibold text-gray-700">
                      Zone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-montserrat font-semibold text-gray-700">
                      Secteur
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
                  {filteredZones.map((zone: any) => (
                    <tr key={zone.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-3">
                            <MapPin className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-montserrat font-semibold text-gray-900">
                              {zone.nom_zone}
                            </p>
                            <p className="text-sm font-montserrat text-gray-500">
                              ID: {zone.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-montserrat text-gray-900">
                          {zone.area}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-montserrat font-semibold text-primary-600">
                          {zone.prix}€
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(zone)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(zone.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view */}
            <div className="md:hidden space-y-4 p-4">
              {filteredZones.map((zone: any) => (
                <div key={zone.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mr-3">
                        <MapPin className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-montserrat font-bold text-gray-900">
                          {zone.nom_zone}
                        </p>
                        <p className="text-sm font-montserrat text-gray-500">
                          ID: {zone.id}
                        </p>
                      </div>
                    </div>
                    <span className="font-montserrat font-bold text-primary-600 text-lg">
                      {zone.prix}€
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-montserrat font-medium text-gray-700 mb-1">
                      Secteur:
                    </p>
                    <p className="font-montserrat text-gray-900">
                      {zone.area}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(zone)}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-xl font-montserrat font-semibold flex items-center justify-center hover:bg-blue-600"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(zone.id)}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-xl font-montserrat font-semibold flex items-center justify-center hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-montserrat font-semibold text-gray-900 mb-2">
              Aucune zone trouvée
            </h3>
            <p className="text-gray-500 font-montserrat">
              {searchTerm
                ? 'Aucune zone ne correspond à vos critères de recherche.'
                : 'Il n\'y a pas encore de zones configurées.'}
            </p>
          </div>
        )}
      </div>

      {/* Create Zone Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-montserrat font-bold text-gray-900">
                Créer une nouvelle zone
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4">
              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                  Nom de la zone
                </label>
                <input
                  {...register('nom_zone', {
                    required: 'Le nom de la zone est requis',
                  })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-montserrat focus:border-primary-500 focus:outline-none"
                  placeholder="Ex: Paris Centre"
                />
                {errors.nom_zone && (
                  <p className="text-red-500 text-sm font-montserrat font-medium mt-1">
                    {errors.nom_zone.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                  Secteur / Description
                </label>
                <textarea
                  {...register('area', {
                    required: 'La description du secteur est requise',
                  })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-montserrat focus:border-primary-500 focus:outline-none resize-none"
                  placeholder="Ex: 1er, 2ème, 3ème, 4ème arrondissements"
                />
                {errors.area && (
                  <p className="text-red-500 text-sm font-montserrat font-medium mt-1">
                    {errors.area.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                  Prix (€)
                </label>
                <input
                  {...register('prix', {
                    required: 'Le prix est requis',
                    min: { value: 0, message: 'Le prix doit être positif' },
                    valueAsNumber: true,
                  })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-montserrat focus:border-primary-500 focus:outline-none"
                  placeholder="15.50"
                />
                {errors.prix && (
                  <p className="text-red-500 text-sm font-montserrat font-medium mt-1">
                    {errors.prix.message}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    reset();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-montserrat font-semibold rounded-xl hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-3 bg-primary-500 text-white font-montserrat font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      {showEditModal && selectedZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-montserrat font-bold text-gray-900">
                Modifier la zone
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedZone(null);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                  Nom de la zone
                </label>
                <input
                  {...register('nom_zone', {
                    required: 'Le nom de la zone est requis',
                  })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-montserrat focus:border-primary-500 focus:outline-none"
                  placeholder="Ex: Paris Centre"
                />
                {errors.nom_zone && (
                  <p className="text-red-500 text-sm font-montserrat font-medium mt-1">
                    {errors.nom_zone.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                  Secteur / Description
                </label>
                <textarea
                  {...register('area', {
                    required: 'La description du secteur est requise',
                  })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-montserrat focus:border-primary-500 focus:outline-none resize-none"
                  placeholder="Ex: 1er, 2ème, 3ème, 4ème arrondissements"
                />
                {errors.area && (
                  <p className="text-red-500 text-sm font-montserrat font-medium mt-1">
                    {errors.area.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                  Prix (€)
                </label>
                <input
                  {...register('prix', {
                    required: 'Le prix est requis',
                    min: { value: 0, message: 'Le prix doit être positif' },
                    valueAsNumber: true,
                  })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-montserrat focus:border-primary-500 focus:outline-none"
                  placeholder="15.50"
                />
                {errors.prix && (
                  <p className="text-red-500 text-sm font-montserrat font-medium mt-1">
                    {errors.prix.message}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedZone(null);
                    reset();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-montserrat font-semibold rounded-xl hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-3 bg-primary-500 text-white font-montserrat font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Mise à jour...' : 'Modifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}