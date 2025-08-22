import { createResourceApiHooks } from '../helpers/createResourceApi';

// Types
export interface Sender {
  full_name: string;
  email: string;
  phone: string;
}

export interface AppealCategory {
  id: number;
  name: string;
}

export interface Appeal {
  id: number;
  reference_number: string;
  region: string;
  status: string;
  category: AppealCategory;
  sender: Sender;
  created_at: string;
}

export interface AppealsResponse {
  limit: number;
  offset: number;
  count: number;
  next: string | null;
  previous: string | null;
  results: Appeal[];
}

// API endpoints
const APPEALS_URL = 'appeals/list';

// Create appeals API hooks using the factory function
export const {
  useGetResources: useGetAppeals,
  useGetResource: useGetAppeal,
  useCreateResource: useCreateAppeal,
  useUpdateResource: useUpdateAppeal,
  useDeleteResource: useDeleteAppeal,
} = createResourceApiHooks<Appeal, AppealsResponse>(APPEALS_URL, 'appeals');
