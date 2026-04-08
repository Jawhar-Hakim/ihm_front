import api from './api';
import type { AuthResponse, LoginPayload, RegisterCandidatePayload, RegisterCompanyPayload, UserRole } from '@/types';

// Map frontend roles to backend role enums
const reverseRoleMap: Record<string, UserRole> = {
  candidat: 'candidate',
  societe: 'company',
  admin: 'admin',
};

export const authService = {
  login: async (data: LoginPayload) => {
    const response = await api.post<{ access_token: string; user: any }>('/auth/login', {
      email: data.email,
      motDePasse: data.password,
    });
    
    return {
      token: response.access_token,
      user: {
        id: response.user.id || response.user._id,
        email: response.user.email,
        role: reverseRoleMap[response.user.role] || response.user.role,
        isActive: response.user.actif ?? true,
        createdAt: response.user.dateCreation,
      },
    } as AuthResponse;
  },

  registerCandidate: async (data: RegisterCandidatePayload) => {
    const response = await api.post<{ access_token: string; user: any }>('/auth/register', {
      email: data.email,
      motDePasse: data.password,
      nom: data.lastName,
      prenom: data.firstName,
      role: 'candidat',
    });

    return {
      token: response.access_token,
      user: {
        id: response.user.id || response.user._id,
        email: response.user.email,
        role: reverseRoleMap[response.user.role] || response.user.role,
        isActive: response.user.actif ?? true,
        createdAt: response.user.dateCreation,
      },
    } as AuthResponse;
  },

  registerCompany: async (data: RegisterCompanyPayload) => {
    const response = await api.post<{ access_token: string; user: any }>('/auth/register', {
      email: data.email,
      motDePasse: data.password,
      nom: data.name,
      role: 'societe',
    });

    return {
      token: response.access_token,
      user: {
        id: response.user.id || response.user._id,
        email: response.user.email,
        role: reverseRoleMap[response.user.role] || response.user.role,
        isActive: response.user.actif ?? true,
        createdAt: response.user.dateCreation,
      },
    } as AuthResponse;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getProfile: async () => {
    const user = await api.get<any>('/auth/profile');
    return {
      id: user.id || user._id,
      email: user.email,
      role: reverseRoleMap[user.role] || user.role,
      isActive: user.actif ?? true,
      createdAt: user.dateCreation,
    };
  },
};
