'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/app/lib/api';
import { 
  Users, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin,
  User,
  Truck
} from 'lucide-react';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: allUsers, isLoading: loadingAll } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAllUsers,
    enabled: activeTab === 'all',
  });

  const { data: clients, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: usersApi.getClients,
    enabled: activeTab === 'clients',
  });

  const { data: livreurs, isLoading: loadingLivreurs } = useQuery({
    queryKey: ['livreurs'],
    queryFn: usersApi.getLivreurs,
    enabled: activeTab === 'livreurs',
  });

  const getCurrentUsers = () => {
    switch (activeTab) {
      case 'clients':
        return clients || [];
      case 'livreurs':
        return livreurs || [];
      default:
        return allUsers || [];
    }
  };

  const isLoading = loadingAll || loadingClients || loadingLivreurs;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      case 'livreur':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'livreur':
        return Truck;
      default:
        return User;
    }
  };

  const filteredUsers = getCurrentUsers().filter((user: any) => {
    const matchesSearch = 
      user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telephone?.includes(searchTerm);
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const tabs = [
    { id: 'all', name: 'Tous', count: allUsers?.length || 0 },
    { id: 'clients', name: 'Clients', count: clients?.length || 0 },
    { id: 'livreurs', name: 'Livreurs', count: livreurs?.length || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-gray-900">
            Utilisateurs
          </h1>
          <p className="text-gray-600 font-montserrat font-medium mt-1">
            Gérer tous les utilisateurs de la plateforme
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-sm font-montserrat font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.name}
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl font-montserrat focus:border-primary-500 focus:outline-none"
              />
            </div>
            {activeTab === 'all' && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl font-montserrat focus:border-primary-500 focus:outline-none appearance-none bg-white"
                >
                  <option value="">Tous les rôles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="livreur">Livreur</option>
                  <option value="client">Client</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-500 font-montserrat mt-2">Chargement...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-hidden">
            {/* Desktop view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-montserrat font-semibold text-gray-700">
                      Utilisateur
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-montserrat font-semibold text-gray-700">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-montserrat font-semibold text-gray-700">
                      Rôle
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-montserrat font-semibold text-gray-700">
                      Adresse
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-montserrat font-semibold text-gray-700">
                      Date d'inscription
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user: any) => {
                    const RoleIcon = getRoleIcon(user.role);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-3">
                              <RoleIcon className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-montserrat font-semibold text-gray-900">
                                {user.nom}
                              </p>
                              <p className="text-sm font-montserrat text-gray-500">
                                ID: {user.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm font-montserrat text-gray-600">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {user.email}
                            </div>
                            <div className="flex items-center text-sm font-montserrat text-gray-600">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {user.telephone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-montserrat font-semibold ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm font-montserrat text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="truncate max-w-xs">
                              {user.adresse || 'Non renseignée'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-montserrat text-gray-600">
                            {user.created_at ? 
                              new Date(user.created_at).toLocaleDateString('fr-FR') : 
                              'N/A'
                            }
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile view */}
            <div className="md:hidden space-y-4 p-4">
              {filteredUsers.map((user: any) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <div key={user.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mr-3">
                          <RoleIcon className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-montserrat font-bold text-gray-900">
                            {user.nom}
                          </p>
                          <p className="text-sm font-montserrat text-gray-500">
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-montserrat font-semibold ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center font-montserrat text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center font-montserrat text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{user.telephone}</span>
                      </div>
                      {user.adresse && (
                        <div className="flex items-start font-montserrat text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                          <span>{user.adresse}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-montserrat font-semibold text-gray-900 mb-2">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-gray-500 font-montserrat">
              {searchTerm || roleFilter
                ? 'Aucun utilisateur ne correspond à vos critères de recherche.'
                : 'Il n\'y a pas encore d\'utilisateurs.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}