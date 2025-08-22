import { createResourceApiHooks } from "../helpers/createResourceApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

// Types
export interface AppealReference {
  id: number;
  reference_number: string;
  status: string;
}

export interface Response {
  id: number;
  appeal: AppealReference;
  reference_number: string;
  text: string;
  status?: string;
}

export interface ResponsesResponse {
  limit: number;
  offset: number;
  count: number;
  next: string | null;
  previous: string | null;
  results: Response[];
}

export interface CreateResponsePayload {
  appeal: number;
  text: string;
  status: string;
}

// API endpoints
const RESPONSES_LIST_URL = "responses/list";

// Create responses API hooks using the factory function
export const {
  useGetResources: useGetResponses,
  useCreateResource: useCreateResponse,
  useUpdateResource: useUpdateResponse,
  useDeleteResource: useDeleteResponse,
} = createResourceApiHooks<Response, ResponsesResponse>(
  RESPONSES_LIST_URL,
  "responses",
);

// Custom hook for getting single response with correct endpoint
export const useGetResponse = (id: number) => {
  return useQuery({
    queryKey: ["responses", id],
    queryFn: async () => {
      const response = await api.get<Response>(`responses/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Custom hook for creating responses with specific endpoint

export const useCreateResponseCustom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateResponsePayload) => {
      const response = await api.post<Response>("responses/create/", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses"] });
    },
  });
};

// Custom hook for updating responses with specific endpoint
export const useUpdateResponseCustom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number } & CreateResponsePayload) => {
      const { id, ...updateData } = payload;
      const response = await api.put<Response>(
        `responses/${id}/update/`,
        updateData,
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["responses"] });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: ["responses", data.id] });
      }
    },
  });
};
