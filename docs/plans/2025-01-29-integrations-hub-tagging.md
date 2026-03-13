# Integration Hub Tagging System

**Date:** 2025-01-29
**Status:** Approved for implementation

## Overview

Add the tag/connection navigation system to Integration Hub for consistency with other modules (Territory, Notifications, etc.).

## What Gets ConnectionBadge

### Main Dashboard - Carrier Cards
Each carrier card (FedEx, UPS, USPS, DHL) displays a ConnectionBadge showing relationships to other system areas.

### Detail Tabs - Rows
| Tab | Entity with Badge |
|-----|-------------------|
| Accounts | Each carrier account row |
| Service Mappings | Each mapping row |
| Zone Mappings | Each zone mapping row |
| Tracking Mappings | Each tracking status row |

### Excluded
- Setup Wizard (workflow, not entity)
- Rate Calculator (tool, not stored config)
- Stats cards

## Connection Categories by Entity

### Carrier Integration (FedEx, UPS, etc.)
| Category | Connection Logic |
|----------|------------------|
| Services | Service mappings exist |
| Zone Groups | Zone mappings configured |
| Customers | Secondary accounts linked |
| Depots | Via zone coverage |
| Rate Cards | Carrier rates integrated |
| Regions | Via zone coverage |
| Notifications | Tracking event triggers |
| Airports | Air freight connections |
| Linehauls | Ground route connections |

### Carrier Account
| Category | Connection Logic |
|----------|------------------|
| Customers | Secondary account = specific client |
| Services | Account used for services |

### Service/Zone Mappings
| Category | Connection Logic |
|----------|------------------|
| Services | Maps to internal service |
| Zone Groups | Applies to zones |

## Implementation Tasks

### 1. Update types.ts
- Add `IntegrationSourceType`
- Import/extend `EntityConnections` from territory

### 2. Create sample connection data
- `sampleCarrierConnections` - per carrier type
- `sampleAccountConnections` - per account
- `sampleMappingConnections` - per mapping type

### 3. Update IntegrationsHubPage.tsx
- Add TagSidebar state management
- Add handleConnectionsClick callback
- Add TagSidebar component
- Add ConnectionBadge to carrier cards

### 4. Update detail tab components
- CarrierAccountsTab.tsx - badge on rows
- ServiceMappingsTab.tsx - badge on rows
- ZoneMappingsTab.tsx - badge on rows
- TrackingMappingsTab.tsx - badge on rows

## File Changes Summary

| File | Change |
|------|--------|
| `integrations-hub/types.ts` | Add source types |
| `integrations-hub/data/sampleData.ts` | Add connection data |
| `integrations-hub/IntegrationsHubPage.tsx` | Add TagSidebar + carrier badges |
| `integrations-hub/components/CarrierAccountsTab.tsx` | Add row badges |
| `integrations-hub/components/ServiceMappingsTab.tsx` | Add row badges |
| `integrations-hub/components/ZoneMappingsTab.tsx` | Add row badges |
| `integrations-hub/components/TrackingMappingsTab.tsx` | Add row badges |
