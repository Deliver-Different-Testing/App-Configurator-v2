import { apiClient } from './client';

export interface CarrierServiceMapping {
  id: number;
  jobTypeId: number;
  jobTypeName?: string;
  carrierIntegrationTypeId: number;
  carrierName?: string;
  carrierServiceCode: string;
  carrierServiceName: string;
  dimFactor: number;
  isDefault: boolean;
  isActive: boolean;
  priority?: number;
}

export interface JobType {
  id: number;
  name: string;
  shortName?: string;
  code?: string;
  groupingId: number;
  groupingName?: string;
}

export interface CarrierType {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
}

export interface CreateCarrierServiceMappingRequest {
  jobTypeId: number;
  carrierIntegrationTypeId: number;
  carrierServiceCode: string;
  carrierServiceName: string;
  dimFactor: number;
  isDefault: boolean;
  isActive: boolean;
  priority?: number;
}

export interface UpdateCarrierServiceMappingRequest {
  carrierServiceCode: string;
  carrierServiceName: string;
  dimFactor: number;
  isDefault: boolean;
  isActive: boolean;
  priority?: number;
}

export interface GetMappingsParams {
  jobTypeId?: number;
  carrierIntegrationTypeId?: number;
  isActive?: boolean;
}

interface GetMappingsResponse {
  mappings: CarrierServiceMapping[];
}

interface GetJobTypesResponse {
  jobTypes: JobType[];
}

interface GetCarrierTypesResponse {
  carrierTypes: CarrierType[];
}

export const carrierServiceMappingsApi = {
  getAll: async (params?: GetMappingsParams): Promise<CarrierServiceMapping[]> => {
    const response = await apiClient.get<GetMappingsResponse>('/admin/carrier-service-mappings', { params });
    return response.data.mappings;
  },

  create: async (data: CreateCarrierServiceMappingRequest): Promise<CarrierServiceMapping> => {
    const response = await apiClient.post('/admin/carrier-service-mappings', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCarrierServiceMappingRequest): Promise<void> => {
    await apiClient.put(`/admin/carrier-service-mappings/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/carrier-service-mappings/${id}`);
  },

  getJobTypes: async (groupingId?: number): Promise<JobType[]> => {
    const params = groupingId ? { groupingId } : {};
    const response = await apiClient.get<GetJobTypesResponse>('/admin/carrier-service-mappings/job-types', { params });
    return response.data.jobTypes;
  },

  getCarrierTypes: async (isActive?: boolean): Promise<CarrierType[]> => {
    const params = isActive !== undefined ? { isActive } : {};
    const response = await apiClient.get<GetCarrierTypesResponse>('/admin/carrier-service-mappings/carrier-types', { params });
    return response.data.carrierTypes;
  },
};
