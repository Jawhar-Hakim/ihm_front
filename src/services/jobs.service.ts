import api from './api';
import type { JobOffer, Application } from '@/types';

export const jobsService = {
  getAll: async (params?: Record<string, string>) => {
    const response = await api.get<any[]>('/offres-emploi');
    
    let filteredData = response;
    if (params?.societe) {
      filteredData = response.filter(item => {
        const societe = item.societe;
        // If societe is populated, it might have a compte field which is the account ID
        const compteId = societe?.compte?._id || societe?.compte || societe?._id || societe;
        return compteId === params.societe;
      });
    }

    return filteredData.map(item => ({
      id: item._id,
      companyId: item.societe,
      companyName: item.societe?.nom || 'Company',
      title: item.titre,
      description: item.description,
      detailsOffre: item.detailsOffre,
      domain: item.domaine,
      specialty: item.specialiteName,
      workMode: item.type || item.workMode || item.contractType,
      createdAt: item.datePublication || item.createdAt,
      isActive: true,
    } as any));
  },

  getById: async (id: string) => {
    const item = await api.get<any>(`/offres-emploi/${id}`);
    return {
      id: item._id,
      companyId: item.societe,
      companyName: item.societe?.nom || 'Company',
      title: item.titre,
      description: item.description,
      detailsOffre: item.detailsOffre,
      domain: item.domaine,
      specialty: item.specialiteName,
      workMode: item.type || item.workMode || item.contractType,
      createdAt: item.datePublication || item.createdAt,
      isActive: true,
    } as any;
  },

  create: (data: Partial<JobOffer>) => api.post<JobOffer>('/offres-emploi', {
    titre: data.title,
    description: data.description,
    societe: data.companyId,
    specialite: data.specialty,
    categorie: data.domain,
  }),

  update: (id: string, data: Partial<JobOffer>) => api.patch<JobOffer>(`/offres-emploi/${id}`, {
    titre: data.title,
    description: data.description,
  }),

  delete: (id: string) => api.delete(`/offres-emploi/${id}`),

  apply: (jobId: string, data: { candidateId: string; cvUrl?: string; coverLetter?: string }) => 
    api.post<Application>('/candidatures', {
      candidat: data.candidateId,
      offreEmploi: jobId,
      cv: data.cvUrl,
      lettreMotivation: data.coverLetter,
    }),

  getApplications: async (jobId: string) => {
    const response = await api.get<any[]>(`/candidatures/offre/${jobId}`);
    return response.map(item => ({
      id: item._id,
      candidateId: item.candidat?._id || item.candidat,
      jobOfferId: item.offreEmploi,
      status: item.statut || 'pending',
      submittedAt: item.dateCandidature,
    } as Application));
  },

  updateApplicationStatus: (appId: string, status: string) => {
    if (status === 'accepted') {
      return api.patch(`/candidatures/${appId}/accepter`);
    } else if (status === 'rejected') {
      return api.patch(`/candidatures/${appId}/refuser`);
    }
    return Promise.reject(new Error('Invalid status update path'));
  },
};
