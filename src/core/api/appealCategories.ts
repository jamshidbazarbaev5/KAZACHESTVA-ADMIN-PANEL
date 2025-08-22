import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./api";

// Types
export interface AppealCategory {
  id?: number;
  name: string;
  created_at?: string;
}

// Custom API hooks for Appeal Categories with specific endpoints
export const useGetAppealCategories = (options?: {
  params?: Record<string, string>;
}) => {
  return useQuery({
    queryKey: ["appealCategories", options?.params],
    queryFn: async () => {
      const response = await api.get<AppealCategory[]>(
        "appeals/category/list",
        { params: options?.params },
      );
      return response.data;
    },
  });
};

export const useGetAppealCategory = (id: number) => {
  return useQuery({
    queryKey: ["appealCategories", id],
    queryFn: async () => {
      const response = await api.get<AppealCategory>(`appeals/category/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateAppealCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCategory: { name: string }) => {
      const response = await api.post<AppealCategory>(
        "appeals/category/create/",
        newCategory,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appealCategories"] });
    },
  });
};

export const useUpdateAppealCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: AppealCategory) => {
      if (!category.id) throw new Error("Category ID is required for update");

      const response = await api.put<AppealCategory>(
        `appeals/category/${category.id}/update/`,
        { name: category.name },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appealCategories"] });
      if (data.id) {
        queryClient.invalidateQueries({
          queryKey: ["appealCategories", data.id],
        });
      }
    },
  });
};

export const useDeleteAppealCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`appeals/category/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appealCategories"] });
    },
  });
};
