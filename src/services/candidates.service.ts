import api from './api';
import type { Candidate, Application } from '@/types';

export const candidatesService = {
  getProfile: async (userId: string, email?: string) => {
    // Since userId is the Compte ID, and API expects Candidat ID,
    // we need to find the candidat by filtering the list (without touching backend)
    const allCandidats = await api.get<any[]>('/candidats');
    const item = allCandidats.find((c: any) => c.compte?._id === userId || c.compte === userId || c.email === email);
    
    if (!item) {
      throw new Error("Candidate profile not found for this user");
    }

    // Extract meta object from diplomas if it exists
    let meta: any = {};
    const regularDiplomas: string[] = [];
    (item.diplomes || []).forEach((d: string) => {
      if (d && d.startsWith('{"_meta":true')) {
        try { meta = JSON.parse(d); } catch (e) {}
      } else {
        regularDiplomas.push(d);
      }
    });

    return {
      id: item._id,
      userId: typeof item.compte === 'object' ? item.compte._id : item.compte,
      firstName: item.prenom,
      lastName: item.nom,
      email: item.email,
      dateOfBirth: item.dateNaissance,
      government: item.gouvernement,
      category: item.categorie,
      diplomas: regularDiplomas,
      cvUrl: meta.cvUrl || '',
      portfolioUrl: meta.portfolioUrl || '',
      description: meta.description || '',
      experienceYears: meta.experienceYears || '',
    } as Candidate;
  },
  
  updateProfile: (candidatId: string, data: Partial<Candidate>) => {
    // Pack our custom fields into a JSON string and store it in `diplomes` since Backend does not whitelist it
    const metaString = JSON.stringify({
      _meta: true,
      cvUrl: data.cvUrl,
      portfolioUrl: data.portfolioUrl,
      description: data.description,
      experienceYears: data.experienceYears,
    });

    const diplomesWithMeta = [...(data.diplomas || []), metaString];

    return api.patch<Candidate>(`/candidats/${candidatId}`, {
      nom: data.lastName,
      prenom: data.firstName,
      dateNaissance: data.dateOfBirth,
      gouvernement: data.government,
      categorie: data.category,
      diplomes: diplomesWithMeta,
    });
  },

  getApplications: async (userId: string) => {
    // We need the true candidat ID. 
    const allCandidats = await api.get<any[]>('/candidats');
    const candidat = allCandidats.find((c: any) => c.compte?._id === userId || c.compte === userId);
    
    if (!candidat) return [];

    const response = await api.get<any[]>(`/candidatures/candidat/${candidat._id}`);

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
