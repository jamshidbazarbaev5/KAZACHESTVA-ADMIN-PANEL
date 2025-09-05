import { createResourceApiHooks } from "../helpers/createResourceApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

// Types
export interface Sender {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  region: string;
}

export interface AppealCategory {
  id: number;
  name: string;
}

export interface AppealFile {
  id: number;
  file: string;
}

export interface ResponseFile {
  id: number;
  file: string;
}

export interface AppealResponse {
  id: number;
  text: string;
  status: string;
  created_at: string;
  answerer?: number;
  response_files?: ResponseFile[];
  // Add other response fields as needed
}

export interface Appeal {
  id: number;
  reference_number: string;
  region: string;
  text: string;
  status: string;
  sender_quantity: number;
  category: AppealCategory;
  appeal_files: AppealFile[];
  appeal_response: AppealResponse | null;
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

export interface AppealStatusStat {
  status: string;
  total: number;
}

export interface AppealsDashboardResponse {
  appeal: AppealStatusStat[];
  total_appeal: number;
}

// API endpoints
const APPEALS_LIST_URL = "appeals/list";

// Create appeals API hooks using the factory function
export const {
  useGetResources: useGetAppeals,
  useCreateResource: useCreateAppeal,
  useDeleteResource: useDeleteAppeal,
} = createResourceApiHooks<Appeal, AppealsResponse>(
  APPEALS_LIST_URL,
  "appeals",
);

// Custom hook for getting single appeal with correct endpoint
export const useGetAppeal = (id: number) => {
  return useQuery({
    queryKey: ["appeals", id],
    queryFn: async () => {
      const response = await api.get<Appeal>(`appeals/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Custom hook for updating appeals with correct endpoint
export const useUpdateAppeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Appeal) => {
      const { id, ...updateData } = payload;
      const response = await api.put<Appeal>(`appeals/${id}`, updateData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appeals"] });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: ["appeals", data.id] });
      }
    },
  });
};

// Custom hook for getting appeals dashboard statistics
export const useGetAppealsDashboard = () => {
  return useQuery({
    queryKey: ["appeals", "dashboard"],
    queryFn: async () => {
      const response =
        await api.get<AppealsDashboardResponse>("appeals/dashboard/");
      return response.data;
    },
  });
};
