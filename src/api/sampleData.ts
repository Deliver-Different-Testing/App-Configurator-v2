// Sample data for development - shows UI when backend is unavailable

import type { CarrierAccount } from './carrierAccounts';
import type { CarrierServiceMapping, CarrierType } from './carrierServiceMappings';
import type { TrackingStatusMapping } from './trackingMappings';

export const sampleIntegrationLogs = {
  logs: [
    {
      id: 1,
      timestamp: '2026-01-29T10:45:32Z',
      carrierType: 'FEDEX',
      endpoint: '/rate/v1/rates/quotes',
      httpMethod: 'POST',
      statusCode: 200,
      durationMs: 342,
      isSuccess: true,
      hasRequestBody: true,
      hasResponseBody: true,
    },
    {
      id: 2,
      timestamp: '2026-01-29T10:44:18Z',
      carrierType: 'UPS',
      endpoint: '/api/rating/v1/Shop',
      httpMethod: 'POST',
      statusCode: 200,
      durationMs: 289,
      isSuccess: true,
      hasRequestBody: true,
      hasResponseBody: true,
    },
    {
      id: 3,
      timestamp: '2026-01-29T10:43:05Z',
      carrierType: 'FEDEX',
      endpoint: '/track/v1/trackingnumbers',
      httpMethod: 'POST',
      statusCode: 200,
      durationMs: 156,
      isSuccess: true,
      hasRequestBody: true,
      hasResponseBody: true,
    },
    {
      id: 4,
      timestamp: '2026-01-29T10:42:51Z',
      carrierType: 'FEDEX',
      endpoint: '/oauth/token',
      httpMethod: 'POST',
      statusCode: 401,
      durationMs: 89,
      isSuccess: false,
      errorMessage: 'Invalid credentials',
      hasRequestBody: true,
      hasResponseBody: true,
    },
    {
      id: 5,
      timestamp: '2026-01-29T10:41:33Z',
      carrierType: 'DHL',
      endpoint: '/express/rates',
      httpMethod: 'POST',
      statusCode: 200,
      durationMs: 2105,
      isSuccess: true,
      hasRequestBody: true,
      hasResponseBody: true,
    },
  ],
  totalCount: 5,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

export const sampleLogDetails: Record<number, { requestBody: string; responseBody: string }> = {
  1: {
    requestBody: JSON.stringify({
      accountNumber: '123456789',
      requestedShipment: {
        shipper: { address: { postalCode: '90210' } },
        recipient: { address: { postalCode: '10001' } },
      },
    }, null, 2),
    responseBody: JSON.stringify({
      output: {
        rateReplyDetails: [
          {
            serviceType: 'FEDEX_GROUND',
            ratedShipmentDetails: [{ totalNetCharge: { amount: '24.50' } }],
          },
        ],
      },
    }, null, 2),
  },
  2: {
    requestBody: JSON.stringify({
      RateRequest: {
        Shipment: { Shipper: { Address: { PostalCode: '90210' } } },
      },
    }, null, 2),
    responseBody: JSON.stringify({
      RateResponse: {
        RatedShipment: [{ TotalCharges: { MonetaryValue: '22.75' } }],
      },
    }, null, 2),
  },
  3: {
    requestBody: JSON.stringify({
      trackingInfo: [{ trackingNumberInfo: { trackingNumber: '794644790132' } }],
    }, null, 2),
    responseBody: JSON.stringify({
      output: {
        completeTrackResults: [
          { trackResults: [{ latestStatusDetail: { statusByLocale: 'Delivered' } }] },
        ],
      },
    }, null, 2),
  },
  4: {
    requestBody: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: '***',
      client_secret: '***',
    }, null, 2),
    responseBody: JSON.stringify({
      errors: [{ code: 'UNAUTHORIZED', message: 'Invalid credentials' }],
    }, null, 2),
  },
  5: {
    requestBody: JSON.stringify({
      customerDetails: { shipperDetails: { postalCode: '90210' } },
    }, null, 2),
    responseBody: JSON.stringify({
      products: [{ productName: 'EXPRESS WORLDWIDE', totalPrice: [{ price: 45.0 }] }],
    }, null, 2),
  },
};

export const sampleCarrierAccounts: CarrierAccount[] = [
  {
    id: 1,
    clientId: null, // Primary account (tenant default)
    carrierType: 'FEDEX',
    accountNumber: '123456789',
    accountName: 'FedEx Primary Account',
    meterNumber: '987654321',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 2,
    clientId: 101, // Secondary account (client-specific)
    carrierType: 'FEDEX',
    accountNumber: '555123456',
    accountName: 'Acme Corp FedEx',
    meterNumber: '555654321',
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-15T14:20:00Z',
    clientName: 'Acme Corp',
  },
  {
    id: 3,
    clientId: null,
    carrierType: 'UPS',
    accountNumber: '987654321',
    accountName: 'UPS Primary Account',
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-18T09:15:00Z',
  },
  {
    id: 4,
    clientId: null,
    carrierType: 'USPS',
    accountNumber: 'USPS-001',
    accountName: 'USPS Primary Account',
    isActive: false,
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 5,
    clientId: null,
    carrierType: 'DHL',
    accountNumber: 'DHL-12345',
    accountName: 'DHL Express Account',
    isActive: true,
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
];

export const sampleServiceMappings: CarrierServiceMapping[] = [
  {
    id: 1,
    jobTypeId: 1,
    jobTypeName: 'Standard Delivery',
    carrierIntegrationTypeId: 1,
    carrierName: 'FEDEX',
    carrierServiceCode: 'FEDEX_GROUND',
    carrierServiceName: 'FedEx Ground',
    dimFactor: 139,
    isDefault: true,
    isActive: true,
  },
  {
    id: 2,
    jobTypeId: 2,
    jobTypeName: 'Express Delivery',
    carrierIntegrationTypeId: 1,
    carrierName: 'FEDEX',
    carrierServiceCode: 'FEDEX_EXPRESS_SAVER',
    carrierServiceName: 'FedEx Express Saver',
    dimFactor: 139,
    isDefault: false,
    isActive: true,
  },
  {
    id: 3,
    jobTypeId: 3,
    jobTypeName: 'Overnight',
    carrierIntegrationTypeId: 1,
    carrierName: 'FEDEX',
    carrierServiceCode: 'PRIORITY_OVERNIGHT',
    carrierServiceName: 'FedEx Priority Overnight',
    dimFactor: 139,
    isDefault: false,
    isActive: true,
  },
  {
    id: 4,
    jobTypeId: 1,
    jobTypeName: 'Standard Delivery',
    carrierIntegrationTypeId: 2,
    carrierName: 'UPS',
    carrierServiceCode: 'GND',
    carrierServiceName: 'UPS Ground',
    dimFactor: 139,
    isDefault: true,
    isActive: true,
  },
  {
    id: 5,
    jobTypeId: 2,
    jobTypeName: 'Express Delivery',
    carrierIntegrationTypeId: 4,
    carrierName: 'DHL',
    carrierServiceCode: 'EXPRESS_WORLDWIDE',
    carrierServiceName: 'DHL Express Worldwide',
    dimFactor: 139,
    isDefault: true,
    isActive: true,
  },
];

export const sampleTrackingMappings: TrackingStatusMapping[] = [
  {
    id: 1,
    carrierIntegrationTypeId: 1,
    carrierTypeName: 'FedEx',
    carrierTypeCode: 'FEDEX',
    carrierStatusCode: 'PU',
    carrierDescription: 'Picked Up',
    internalStatus: 'In Transit',
    triggerNotification: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    carrierIntegrationTypeId: 1,
    carrierTypeName: 'FedEx',
    carrierTypeCode: 'FEDEX',
    carrierStatusCode: 'IT',
    carrierDescription: 'In Transit',
    internalStatus: 'In Transit',
    triggerNotification: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    carrierIntegrationTypeId: 1,
    carrierTypeName: 'FedEx',
    carrierTypeCode: 'FEDEX',
    carrierStatusCode: 'OD',
    carrierDescription: 'Out for Delivery',
    internalStatus: 'Out for Delivery',
    triggerNotification: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 4,
    carrierIntegrationTypeId: 1,
    carrierTypeName: 'FedEx',
    carrierTypeCode: 'FEDEX',
    carrierStatusCode: 'DL',
    carrierDescription: 'Delivered',
    internalStatus: 'Delivered',
    triggerNotification: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 5,
    carrierIntegrationTypeId: 1,
    carrierTypeName: 'FedEx',
    carrierTypeCode: 'FEDEX',
    carrierStatusCode: 'DE',
    carrierDescription: 'Delivery Exception',
    internalStatus: 'Exception',
    triggerNotification: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 6,
    carrierIntegrationTypeId: 2,
    carrierTypeName: 'UPS',
    carrierTypeCode: 'UPS',
    carrierStatusCode: 'D',
    carrierDescription: 'Delivered',
    internalStatus: 'Delivered',
    triggerNotification: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 7,
    carrierIntegrationTypeId: 4,
    carrierTypeName: 'DHL',
    carrierTypeCode: 'DHL',
    carrierStatusCode: 'OK',
    carrierDescription: 'Shipment Delivered',
    internalStatus: 'Delivered',
    triggerNotification: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const sampleCarrierTypes: CarrierType[] = [
  { id: 1, name: 'FedEx', code: 'FEDEX', isActive: true },
  { id: 2, name: 'UPS', code: 'UPS', isActive: true },
  { id: 3, name: 'USPS', code: 'USPS', isActive: true },
  { id: 4, name: 'DHL', code: 'DHL', isActive: true },
];

export const sampleInternalStatuses = [
  'Pending',
  'Picked Up',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Exception',
  'Returned',
  'Cancelled',
];
