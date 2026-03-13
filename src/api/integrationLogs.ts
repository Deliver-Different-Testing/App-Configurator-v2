import { apiClient } from './client';

export interface IntegrationLog {
  id: number;
  timestamp: string;
  carrierType: string;
  endpoint: string;
  httpMethod: string;
  statusCode: number;
  durationMs: number;
  isSuccess: boolean;
  errorMessage?: string;
  clientId?: number;
  correlationId?: string;
  hasRequestBody: boolean;
  hasResponseBody: boolean;
}

export interface IntegrationLogDetail extends IntegrationLog {
  requestBody?: string;
  responseBody?: string;
}

export interface IntegrationLogsResponse {
  logs: IntegrationLog[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IntegrationLogsSummary {
  fromDate: string;
  toDate: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgDurationMs: number;
  byCarrier: CarrierSummary[];
}

export interface CarrierSummary {
  carrierType: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgDurationMs: number;
}

export interface GetLogsParams {
  carrierType?: string;
  isSuccess?: boolean;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export const integrationLogsApi = {
  getAll: async (params?: GetLogsParams): Promise<IntegrationLogsResponse> => {
    const response = await apiClient.get('/admin/integration-logs', { params });
    return response.data;
  },

  getById: async (id: number): Promise<IntegrationLogDetail> => {
    const response = await apiClient.get(`/admin/integration-logs/${id}`);
    return response.data;
  },

  getSummary: async (params?: { fromDate?: string; toDate?: string }): Promise<IntegrationLogsSummary> => {
    const response = await apiClient.get('/admin/integration-logs/summary', { params });
    return response.data;
  },
};
