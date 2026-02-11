import apiBase from './config';
import { ActivityPackage, ActivityTemplate, SuggestedTemplate } from '@/interfaces/activity-package';

const BASE_URL = `${process.env.NEXT_PUBLIC_DEV_API}/activity-packages`;

const activityPackageApi = {
  // =====================
  // 1. Package Management
  // =====================

  // GET /activity-packages - Lấy danh sách các package đang hoạt động (active)
  getActivePackages: async (): Promise<ActivityPackage[]> => {
    const response = await apiBase.get(BASE_URL);
    return response.data.data;
  },

  // GET /activity-packages/admin/all - Lấy danh sách tất cả package (bao gồm inactive) [Admin]
  getAllPackages: async (): Promise<ActivityPackage[]> => {
    const response = await apiBase.get(`${BASE_URL}/admin/all`);
    return response.data.data;
  },

  // GET /activity-packages/team/:teamId - Lấy danh sách package theo team
  getPackagesByTeam: async (teamId: string): Promise<ActivityPackage[]> => {
    const response = await apiBase.get(`${BASE_URL}/team/${teamId}`);
    return response.data.data;
  },

  // GET /activity-packages/:id - Lấy chi tiết một package
  getPackageById: async (id: string): Promise<ActivityPackage> => {
    const response = await apiBase.get(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  // POST /activity-packages - Tạo mới một package cơ bản [Admin]
  createPackage: async (data: {
    id: string; // User creates package using this ID
    displayName: string;
    description?: string;
    library?: string;
    version?: string;
    libraryVersion?: string;
  }): Promise<ActivityPackage> => {
    const response = await apiBase.post(BASE_URL, data);
    return response.data.data;
  },

  // PATCH /activity-packages/:id/toggle-active - Bật/Tắt trạng thái hoạt động [Admin]
  togglePackageActive: async (id: string): Promise<ActivityPackage> => {
    const response = await apiBase.patch(`${BASE_URL}/${id}/toggle-active`);
    return response.data.data;
  },

  // PATCH /activity-packages/:id/active - Set trạng thái hoạt động cụ thể [Admin]
  setPackageActive: async (id: string, isActive: boolean): Promise<ActivityPackage> => {
    const response = await apiBase.patch(`${BASE_URL}/${id}/active`, { isActive });
    return response.data.data;
  },

  // =====================
  // 2. Library & Parsing
  // =====================

  // POST /activity-packages/:id/library - Upload file thư viện Python [Admin]
  uploadLibrary: async (
    id: string,
    file: File,
    libraryVersion: string
  ): Promise<ActivityPackage> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('libraryVersion', libraryVersion);

    const response = await apiBase.post(
      `${BASE_URL}/${id}/library`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // PUT /activity-packages/:id/library/reparse - Parse lại thư viện Python [Admin]
  reparseLibrary: async (id: string): Promise<ActivityPackage> => {
    const response = await apiBase.put(`${BASE_URL}/${id}/library/reparse`);
    return response.data.data;
  },

  // =====================
  // 3. Activity Template Management (CRUD)
  // =====================

  // GET /activity-packages/:packageId/templates - Lấy danh sách templates trong package
  getTemplates: async (packageId: string): Promise<ActivityTemplate[]> => {
    const response = await apiBase.get(`${BASE_URL}/${packageId}/templates`);
    return response.data.data;
  },

  // GET /activity-packages/:packageId/templates/:templateId - Lấy chi tiết một template
  getTemplateById: async (packageId: string, templateId: string): Promise<ActivityTemplate> => {
    const response = await apiBase.get(`${BASE_URL}/${packageId}/templates/${templateId}`);
    return response.data.data;
  },

  // POST /activity-packages/:packageId/templates - Tạo mới thủ công một template [Admin]
  createTemplate: async (
    packageId: string,
    data: {
      name: string;
      keyword: string;
      description?: string;
      keywordName?: string;
      pythonMethod?: string;
      arguments?: any[];
      returnValue?: any;
    }
  ): Promise<ActivityTemplate> => {
    const response = await apiBase.post(`${BASE_URL}/${packageId}/templates`, data);
    return response.data.data;
  },

  // PUT /activity-packages/:packageId/templates/:templateId - Cập nhật thông tin template [Admin]
  updateTemplate: async (
    packageId: string,
    templateId: string,
    data: {
      name?: string;
      keyword?: string;
      description?: string;
      keywordName?: string;
      pythonMethod?: string;
      arguments?: any[];
      returnValue?: any;
    }
  ): Promise<ActivityTemplate> => {
    const response = await apiBase.put(`${BASE_URL}/${packageId}/templates/${templateId}`, data);
    return response.data.data;
  },

  // DELETE /activity-packages/:packageId/templates/:templateId - Xóa một template [Admin]
  deleteTemplate: async (packageId: string, templateId: string): Promise<{ message: string }> => {
    const response = await apiBase.delete(`${BASE_URL}/${packageId}/templates/${templateId}`);
    return response.data;
  },

  // =====================
  // Legacy / Helper methods
  // =====================

  // Alias for backward compatibility
  getAllActivePackages: async (): Promise<ActivityPackage[]> => {
    return activityPackageApi.getActivePackages();
  },
};

export default activityPackageApi;
