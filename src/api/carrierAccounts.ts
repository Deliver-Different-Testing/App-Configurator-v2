import { apiClient } from './client';

export interface CarrierAccount {
  id: number;
  clientId: number | null;
  carrierType: string;
  accountNumber: string;
  meterNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  // Extended fields for UI
  accountName?: string;
  clientName?: string;
}

export interface CreateCarrierAccountRequest {
  clientId?: number | null;
  carrierTypeCode: string;
  accountNumber: string;
  meterNumber?: string;
  secretKeyRef?: string;
  isActive: boolean;
}

export interface UpdateCarrierAccountRequest {
  accountNumber: string;
  meterNumber?: string;
  secretKeyRef?: string;
  isActive: boolean;
}

export interface GetAccountsParams {
  clientId?: number;
  carrierTypeCode?: string;
}

export const carrierAccountsApi = {
  getAll: async (params?: GetAccountsParams): Promise<CarrierAccount[]> => {
    const response = await apiClient.get('/admin/carriers/accounts', { params });
    return response.data;
  },

  getById: async (id: number): Promise<CarrierAccount> => {
    const response = await apiClient.get(`/admin/carriers/accounts/${id}`);
    return response.data;
  },

  create: async (data: CreateCarrierAccountRequest): Promise<CarrierAccount> => {
    const response = await apiClient.post('/admin/carriers/accounts', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCarrierAccountRequest): Promise<void> => {
    await apiClient.put(`/admin/carriers/accounts/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/carriers/accounts/${id}`);
  },
};
