import { apiClient } from "./api";
import type { BackendTemplate } from "../types/api";

export const templateApi = {
  async listTemplates(): Promise<BackendTemplate[]> {
    const response = await apiClient.get<BackendTemplate[]>("/api/templates");
    return response.data;
  },

  async createTemplate(template: Omit<BackendTemplate, "id" | "createdAt">): Promise<BackendTemplate> {
    const response = await apiClient.post<BackendTemplate>("/api/templates", template);
    return response.data;
  },

  async updateTemplate(id: string, updates: Partial<BackendTemplate>): Promise<BackendTemplate> {
    const response = await apiClient.put<BackendTemplate>(`/api/templates/${id}`, updates);
    return response.data;
  },

  async deleteTemplate(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/templates/${id}`);
    return response.data;
  },
};
