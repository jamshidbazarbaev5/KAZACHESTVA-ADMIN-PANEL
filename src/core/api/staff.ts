import { createResourceApiHooks } from "../helpers/createResourceApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

// Types
export interface Staff {
  id: number;
  full_name: string;
  phone: string;
  email: string;
}

export interface StaffResponse {
  limit: number;
  offset: number;
  count: number;
  next: string | null;
  previous: string | null;
  results: Staff[];
}

export interface CreateStaffPayload {
  full_name: string;
  phone: string;
  email: string;
}

export interface UpdateStaffPayload {
  full_name: string;
  phone: string;
  email: string;
}

// API endpoints
const STAFF_LIST_URL = "staff/list";

// Create staff API hooks using the factory function
export const {
  useGetResources: useGetStaff,
  useCreateResource: useCreateStaff,
  useUpdateResource: useUpdateStaff,
  useDeleteResource: useDeleteStaff,
} = createResourceApiHooks<Staff, StaffResponse>(
  STAFF_LIST_URL,
  "staff",
);

// Custom hook for getting single staff member with correct endpoint
export const useGetStaffMember = (id: number) => {
  return useQuery({
    queryKey: ["staff", id],
    queryFn: async () => {
      const response = await api.get<Staff>(`staff/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Custom hook for creating staff with specific endpoint
export const useCreateStaffCustom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStaffPayload) => {
      const response = await api.post<Staff>("staff/create/", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

// Custom hook for updating staff with specific endpoint
export const useUpdateStaffCustom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number } & UpdateStaffPayload) => {
      const { id, ...updateData } = payload;
      const response = await api.put<Staff>(
        `staff/${id}/update/`,
        updateData,
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: ["staff", data.id] });
      }
    },
  });
};

// Custom hook for deleting staff with specific endpoint
export const useDeleteStaffCustom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`staff/${id}/delete/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};
