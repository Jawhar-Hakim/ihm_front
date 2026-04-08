export type UserRole = 'candidate' | 'company' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Candidate {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  government?: string;
  category?: string;
  diplomas: string[];
  cvUrl?: string;
  portfolioUrl?: string;
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  website?: string;
  phone?: string;
  address?: string;
  domain?: string;
  email: string;
}

export interface JobOffer {
  id: string;
  companyId: string;
  companyName?: string;
  title: string;
  description: string;
  domain: string;
  specialty: string;
  contractType?: string;
  responsibilities?: string;
  experienceLevel?: string;
  educationLevel?: string;
  workMode?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Application {
  id: string;
  candidateId: string;
  jobOfferId: string;
  jobTitle?: string;
  companyName?: string;
  cvUrl?: string;
  coverLetterUrl?: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

export interface Category {
  id: string;
  domain: string;
  specialty: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterCandidatePayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterCompanyPayload {
  email: string;
  password: string;
  name: string;
  domain?: string;
}
