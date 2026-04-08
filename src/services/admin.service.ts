import api from './api';
import type { User, Category, UserRole } from '@/types';

const reverseRoleMap: Record<string, UserRole> = {
  candidat: 'candidate',
  societe: 'company',
  admin: 'admin',
};

export const adminService = {
  getAccounts: async () => {
    console.log('calling')
    const response = await api.get<any[]>('/compte');
    console.log(response)
    return response.map(item => ({
      id: item._id,
      email: item.email,
      name: item.nom || item.email,
      role: reverseRoleMap[item.role] || item.role,
      isActive: item.actif,
      createdAt: new Date(item.dateCreation || item.createdAt).toLocaleDateString(),
    } as User));
  },

  validateAccount: (id: string) => api.patch(`/compte/${id}`, { actif: true }),
  
  deactivateAccount: (id: string) => api.patch(`/compte/${id}`, { actif: false }),

  getCategories: async () => {
    // Backend seems to have categorie and specialite separate
    const response = await api.get<any[]>('/categories');
    return response.map(item => ({
      id: item._id,
      domain: item.nom,
      specialty: '', // Categories in backend might not have specialty nested
    } as Category));
  },

  createCategory: (data: Partial<Category>) => api.post<Category>('/categories', {
    nom: data.domain,
    description: data.domain,
  }),

  deleteCategory: (id: string) => api.delete(`/categories/${id}`),

  getSpecialties: async () => {
    const response = await api.get<any[]>('/specialites');
    return response.map(item => ({
      id: item._id,
      name: item.nom,
      categoryId: item.categorie,
    }));
  },
};
