// Candidate hiring stages
export const HIRING_STAGES = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
  'Rejected',
] as const;

export type HiringStage = (typeof HIRING_STAGES)[number];

export interface Candidate {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  appliedRole: string;
  skills: string[];
  experience: string;
  hiringStage: HiringStage;
  resumeUrl?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateFormData {
  fullName: string;
  email: string;
  phone?: string;
  appliedRole: string;
  skills: string;
  experience: string;
  hiringStage: HiringStage;
  resumeUrl?: string;
  notes?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalCandidates: number;
  byStage: Record<HiringStage, number>;
  recentCandidates: Candidate[];
  hiresThisMonth: number;
  interviewsScheduled: number;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface CandidatesQuery {
  page?: number;
  limit?: number;
  search?: string;
  stage?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
