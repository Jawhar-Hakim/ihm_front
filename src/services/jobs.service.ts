import api from './api';
import type { JobOffer, Application } from '@/types';

export const jobsService = {
  getCompanyProfile: async (userId: string) => {
    console.log("Fetching company profile for userId:", userId);
    const response = await api.get<any>('/societes');
    const societes = Array.isArray(response) ? response : (response.data || response.items || []);
    console.log("All societes found:", societes.length);
    
    const currentSociete = societes.find((s: any) => {
      const compteId = s.compte?._id || s.compte;
      // Handle both string and object comparisons
      return String(compteId) === String(userId) || s.email === userId;
    });
    
    if (!currentSociete) {
      console.warn("Company profile not found for userId:", userId);
      throw new Error('Company profile not found. Please ensure your account is correctly linked to a company.');
    }
    console.log("Matched company profile:", currentSociete.nom, currentSociete._id);
    return currentSociete;
  },

  mapOffer: (item: any): JobOffer => {
    let extraFields: any = {};
    if (item.detailsOffre && item.detailsOffre.startsWith('{')) {
      try {
        extraFields = JSON.parse(item.detailsOffre);
      } catch (e) {
        console.warn("Failed to parse detailsOffre as JSON", e);
      }
    }

    return {
      id: item._id || item.id,
      companyId: item.societe?._id || item.societe,
      companyName: item.societe?.nom || 'Company',
      title: item.titre || '',
      description: item.description || '',
      detailsOffre: extraFields.detailsOffre || item.detailsOffre || '',
      domain: item.domaine || item.categorie?.domaine || '',
      specialty: item.specialiteName || item.specialite?.name || '',
      contractType: extraFields.contractType || item.contractType || '',
      experienceLevel: extraFields.experienceLevel || item.experienceLevel || '',
      educationLevel: extraFields.educationLevel || item.educationLevel || '',
      responsibilities: extraFields.responsibilities || item.responsibilities || '',
      workMode: item.type || item.workMode || 'On-site',
      createdAt: item.datePublication || item.createdAt || new Date().toISOString(),
      isActive: true,
    };
  },

  getAll: async (params?: Record<string, string>) => {
    console.log("Fetching all job offers with params:", params);
    const response = await api.get<any>('/offres-emploi');
    
    let filteredData = Array.isArray(response) ? response : (response.data || response.items || []);
    
    if (params?.societe) {
      filteredData = filteredData.filter((item: any) => {
        const societeId = item.societe?._id || item.societe;
        return String(societeId) === String(params.societe);
      });
    }

    return filteredData.map(jobsService.mapOffer);
  },

  getById: async (id: string) => {
    const item = await api.get<any>(`/offres-emploi/${id}`);
    return jobsService.mapOffer(item);
  },

  create: (data: Partial<JobOffer>) => api.post<JobOffer>('/offres-emploi', {
    titre: data.title,
    description: data.description,
    societe: data.companyId,
    specialite: data.specialty,
    categorie: data.domain,
    type: data.workMode,
    detailsOffre: JSON.stringify({
      contractType: data.contractType,
      experienceLevel: data.experienceLevel,
      educationLevel: data.educationLevel,
      responsibilities: data.responsibilities,
      detailsOffre: data.detailsOffre
    })
  }),

  update: (id: string, data: Partial<JobOffer>) => api.patch<JobOffer>(`/offres-emploi/${id}`, {
    titre: data.title,
    description: data.description,
    specialite: data.specialty,
    categorie: data.domain,
    type: data.workMode,
    detailsOffre: JSON.stringify({
      contractType: data.contractType,
      experienceLevel: data.experienceLevel,
      educationLevel: data.educationLevel,
      responsibilities: data.responsibilities,
      detailsOffre: data.detailsOffre
    })
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
    try {
      const response = await api.get<any[]>(`/candidatures/offre/${jobId}`);
      console.log(`Raw applications for job ${jobId}:`, response);
      
      return response.map(item => {
        let mappedStatus: 'pending' | 'accepted' | 'rejected' = 'pending';
        const rawStatus = item.statut;
        
        // Match backend StatutCandidature enum values: en_attente, acceptee, refusee
        if (rawStatus === 'en_attente' || rawStatus === 'pending') mappedStatus = 'pending';
        else if (rawStatus === 'acceptee' || rawStatus === 'accepted') mappedStatus = 'accepted';
        else if (rawStatus === 'refusee' || rawStatus === 'rejected') mappedStatus = 'rejected';

        // Find the CV
        let cvUrl = item.cvCible?.fichier || item.cv || item.candidat?.cv;
        
        if (!cvUrl && item.candidat?.diplomes) {
          const metaStr = item.candidat.diplomes.find((d: string) => d && d.startsWith('{"_meta":true'));
          if (metaStr) {
            try {
              const meta = JSON.parse(metaStr);
              cvUrl = meta.cvUrl;
            } catch (e) {}
          }
        }

        return {
          id: item._id || item.id,
          candidateId: item.candidat?._id || item.candidat?.id || item.candidat,
          candidate: item.candidat,
          jobOfferId: item.offreEmploi?._id || item.offreEmploi?.id || item.offreEmploi,
          status: mappedStatus,
          submittedAt: item.dateDepot || item.dateCandidature || item.createdAt,
          cvUrl: cvUrl,
          coverLetterUrl: item.lettreMotivation,
        } as Application;
      });
    } catch (error) {
      console.error(`Error fetching applications for job ${jobId}:`, error);
      throw error;
    }
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
