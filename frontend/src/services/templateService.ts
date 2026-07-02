import type { JobTemplate } from "../types";
import { templateApi } from "../api/template";
import type { BackendTemplate } from "../types/api";

function mapToFrontendTemplate(bt: BackendTemplate): JobTemplate {
  return {
    id: bt.id,
    title: bt.name || bt.title || "Job Template",
    department: (bt as any).department || "Engineering",
    experience: (bt as any).experience || "N/A",
    description: bt.description || "",
    requiredSkills: (bt as any).requiredSkills || [],
    lastUsedAt: bt.lastUsedAt || bt.createdAt,
    isCustom: (bt as any).isCustom !== undefined ? (bt as any).isCustom : true,
  };
}

export const templateService = {
  async getTemplates(): Promise<JobTemplate[]> {
    const templates = await templateApi.listTemplates();
    return templates.map(mapToFrontendTemplate);
  },

  async createTemplate(template: Omit<JobTemplate, "id" | "isCustom">): Promise<JobTemplate> {
    const payload = {
      name: template.title,
      title: template.title,
      department: template.department,
      experience: template.experience,
      description: template.description,
      requiredSkills: template.requiredSkills,
      isCustom: true,
    };
    const newBt = await templateApi.createTemplate(payload);
    return mapToFrontendTemplate(newBt);
  },

  async updateTemplate(id: string, updates: Partial<JobTemplate>): Promise<JobTemplate> {
    const payload: any = {};
    if (updates.title) {
      payload.name = updates.title;
      payload.title = updates.title;
    }
    if (updates.department) payload.department = updates.department;
    if (updates.experience) payload.experience = updates.experience;
    if (updates.description) payload.description = updates.description;
    if (updates.requiredSkills) payload.requiredSkills = updates.requiredSkills;
    if (updates.isCustom !== undefined) payload.isCustom = updates.isCustom;

    const updatedBt = await templateApi.updateTemplate(id, payload);
    return mapToFrontendTemplate(updatedBt);
  },

  async deleteTemplate(id: string): Promise<void> {
    await templateApi.deleteTemplate(id);
  },
};
