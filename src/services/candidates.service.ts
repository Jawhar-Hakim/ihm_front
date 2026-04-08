import api from './api';
import type { Candidate, Application } from '@/types';

export const candidatesService = {
  getProfile: async (id: string) => {
    const item = await api.get<any>(`/candidats/${id}`);
    return {
      id: item._id,
      userId: item.compte,
      firstName: item.prenom,
      lastName: item.nom,
      email: item.email,
      dateOfBirth: item.dateNaissance,
      government: item.gouvernement,
      category: item.categorie,
      diplomas: item.diplomes,
      cvUrl: item.cv,
    } as Candidate;
  },
  
  updateProfile: (id: string, data: Partial<Candidate>) => api.patch<Candidate>(`/candidats/${id}`, {
    nom: data.lastName,
    prenom: data.firstName,
    dateNaissance: data.dateOfBirth,
    gouvernement: data.government,
    categorie: data.category,
    diplomes: data.diplomas,
    cv: data.cvUrl,
  }),

  getApplications: async (candidatId: string) => {
    const response = await api.get<any[]>(`/candidatures/candidat/${candidatId}`);

    // For each application, fetch the job details to get the company name
    const populatedApps = await Promise.all(response.map(async (item) => {
      let jobDetails = null;
      try {
        const jobId = typeof item.offreEmploi === 'object' ? item.offreEmploi._id : item.offreEmploi;
        jobDetails = await api.get<any>(`/offres-emploi/${jobId}`);
      } catch (e) {
        console.error("Failed to fetch job details for application", e);
      }

      return {
        id: item._id,
        candidateId: item.candidat,
        jobOfferId: jobDetails?._id || item.offreEmploi,
        jobTitle: jobDetails?.titre || 'Job Application',
        companyName: jobDetails?.societe?.nom || 'Company',
        status: item.statut || 'pending',
        submittedAt: item.dateDepot || item.dateCandidature,
      } as Application;
    }));

    return populatedApps;
  },

  search: async (params?: Record<string, string>) => {
    const response = await api.get<any[]>('/candidats/rechercher', params);
    return response.map(item => ({
      id: item._id,
      firstName: item.prenom,
      lastName: item.nom,
      email: item.email,
      category: item.categorie,
    } as Candidate));
  },
};
