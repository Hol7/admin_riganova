'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '@/app/lib/api';
import { useAuthStore } from '@/app/stores/authStore';
import { Eye, EyeOff, LogIn } from 'lucide-react';

interface LoginForm {
  telephone: string;
  mot_de_passe: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  
  const loginMutation = useMutation({
    mutationFn: ({ telephone, mot_de_passe }: LoginForm) =>
      authApi.login(telephone, mot_de_passe),
    onSuccess: async (data) => {
      try {
        // The login response already contains both token and user data
        const { access_token, user } = data;
        setAuth(user, access_token);
        toast.success('Connexion réussie!');
        router.push('/dashboard');
      } catch (error) {
        toast.error('Erreur lors de la connexion');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur de connexion');
    },
  });
  
  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-montserrat font-bold text-gray-900">
              Admin Livraison
            </h1>
            <p className="text-gray-600 font-montserrat font-medium mt-2">
              Connectez-vous à votre espace
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                {...register('telephone', {
                  required: 'Le téléphone est requis',
                //   pattern: {
                //     value: /^[0-9]{10}$/,
                //     message: 'Format invalide (ex: 0600000000)',
                //   },
                })}
                type="tel"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-montserrat focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="0600000000"
              />
              {errors.telephone && (
                <p className="text-red-500 text-sm font-montserrat font-medium mt-1">
                  {errors.telephone.message}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-montserrat font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  {...register('mot_de_passe', {
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 4,
                      message: 'Minimum 6 caractères',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl font-montserrat focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.mot_de_passe && (
                <p className="text-red-500 text-sm font-montserrat font-medium mt-1">
                  {errors.mot_de_passe.message}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-montserrat font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}