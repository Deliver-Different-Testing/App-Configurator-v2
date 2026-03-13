import { apiClient } from './client';

export interface TrackingStatusMapping {
  id: number;
  carrierIntegrationTypeId: number;
  carrierTypeName: string;
  carrierTypeCode: string;
  carrierStatusCode: string;
  carrierDescription: string;
  internalStatus: string;
  triggerNotification: boolean;
  isActive: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTrackingMappingRequest {
  carrierIntegrationTypeId: number;
  carrierStatusCode: string;
  carrierDescription: string;
  internalStatus: string;
  triggerNotification: boolean;
  isActive: boolean;
  sortOrder?: number;
}

export interface UpdateTrackingMappingRequest {
  carrierStatusCode: string;
  carrierDescription: string;
  internalStatus: string;
  triggerNotification: boolean;
  isActive: boolean;
  sortOrder?: number;
}

export interface GetMappingsParams {
  carrierIntegrationTypeId?: number;
  isActive?: boolean;
}

export const trackingMappingsApi = {
  getAll: async (params?: GetMappingsParams): Promise<TrackingStatusMapping[]> => {
    const response = await apiClient.get('/admin/tracking-mappings', { params });
    return response.data;
  },

  getById: async (id: number): Promise<TrackingStatusMapping> => {
    const response = await apiClient.get(`/admin/tracking-mappings/${id}`);
    return response.data;
  },

  create: async (data: CreateTrackingMappingRequest): Promise<TrackingStatusMapping> => {
    const response = await apiClient.post('/admin/tracking-mappings', data);
    return response.data;
  },

  update: async (id: number, data: UpdateTrackingMappingRequest): Promise<void> => {
    await apiClient.put(`/admin/tracking-mappings/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/tracking-mappings/${id}`);
  },

  getInternalStatuses: async (): Promise<string[]> => {
    const response = await apiClient.get('/admin/tracking-mappings/internal-statuses');
    return response.data;
  },
};
