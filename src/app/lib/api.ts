import axios from 'axios';
import { useAuthStore } from '@/app/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (telephone: string, mot_de_passe: string) => {
    const response = await api.post('/auth/login', {
      telephone,
      mot_de_passe,
    });
    return response.data;
  },
  
  loginOAuth: async (telephone: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', telephone);
    formData.append('password', password);
    
    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Users API
export const usersApi = {
  getAllUsers: async () => {
    const response = await api.get('/users/');
    return response.data;
  },
  
  getClients: async () => {
    const response = await api.get('/users/clients');
    return response.data;
  },
  
  getLivreurs: async () => {
    const response = await api.get('/users/livreurs');
    return response.data;
  },
};

// Deliveries API
export const deliveriesApi = {
  getAllDeliveries: async () => {
    const response = await api.get('/deliveries/');
    return response.data;
  },
  
  getMyDeliveries: async () => {
    const response = await api.get('/deliveries/my-deliveries');
    return response.data;
  },
  
  createDelivery: async (delivery: {
    type_colis: string;
    description: string;
    adresse_pickup: string;
    adresse_dropoff: string;
  }) => {
    const response = await api.post('/deliveries/create', delivery);
    return response.data;
  },
  
  assignDelivery: async (deliveryId: number, livreurId: number) => {
    const response = await api.post(`/deliveries/${deliveryId}/assign`, {
      livreur_id: livreurId,
    });
    return response.data;
  },
  
  updateStatus: async (deliveryId: number, statut: string) => {
    const response = await api.post(`/deliveries/${deliveryId}/status`, {
      statut,
    });
    return response.data;
  },
  
  getDeliveryStatus: async (deliveryId: number) => {
    const response = await api.get(`/deliveries/${deliveryId}/status`);
    return response.data;
  },
  
  cancelDelivery: async (deliveryId: number) => {
    const response = await api.post(`/deliveries/${deliveryId}/cancel`);
    return response.data;
  },
  
  getHistory: async () => {
    const response = await api.get('/deliveries/history');
    return response.data;
  },
};

// Zones API
export const zonesApi = {
  getAllZones: async () => {
    const response = await api.get('/zones/');
    return response.data;
  },
  
  getZone: async (zoneId: number) => {
    const response = await api.get(`/zones/${zoneId}`);
    return response.data;
  },
  
  createZone: async (zone: { nom_zone: string; area: string; prix: number }) => {
    const response = await api.post('/zones/', zone);
    return response.data;
  },
  
  updateZone: async (zoneId: number, zone: { nom_zone: string; area: string; prix: number }) => {
    const response = await api.put(`/zones/${zoneId}`, zone);
    return response.data;
  },
  
  deleteZone: async (zoneId: number) => {
    const response = await api.delete(`/zones/${zoneId}`);
    return response.data;
  },
};

// Stats API
export const statsApi = {
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },
};

// Health API
export const healthApi = {
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};


const clients = new Set<ReadableStreamDefaultController>();

export function addClient(controller: ReadableStreamDefaultController) {
  clients.add(controller);
}

export function removeClient(controller: ReadableStreamDefaultController) {
  clients.delete(controller);
}

export function broadcastToClients(notification: any) {
  clients.forEach((controller) => {
    try {
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(notification)}\n\n`)
      );
    } catch (error) {
      // Remove disconnected clients
      clients.delete(controller);
    }
  });
}