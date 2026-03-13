import type { ZipZone, ZoneGroup, Depot, FilterDefinition, EntityConnections } from '../types';
import { createEmptyConnections } from '../types';

// 50+ Zip Zones covering all filter combinations
export const zipZonesData: ZipZone[] = [
  // Manhattan Central (1A) - NYC Central Depot
  { id: 'z1', zip: '10001', zoneNumber: '1A', zoneName: 'Manhattan Central', region: 'North America', depot: 'NYC Central', service: 'Express', vehicle: 'Van', customer: '1976 Limited', rateCard: 'Standard Rates', status: 'Active' },
  { id: 'z2', zip: '10002', zoneNumber: '1A', zoneName: 'Manhattan Central', region: 'North America', depot: 'NYC Central', service: 'Express', vehicle: 'Van', customer: '1976 Limited', rateCard: 'Standard Rates', status: 'Active' },
  { id: 'z3', zip: '10003', zoneNumber: '1A', zoneName: 'Manhattan Central', region: 'North America', depot: 'NYC Central', service: 'Same Day', vehicle: 'Cargo Bike', customer: 'Acme Corp', rateCard: 'Premium Rates', status: 'Active' },
  { id: 'z4', zip: '10004', zoneNumber: '1A', zoneName: 'Manhattan Central', region: 'North America', depot: 'NYC Central', service: 'Same Day', vehicle: 'Cargo Bike', customer: 'Acme Corp', rateCard: 'Premium Rates', status: 'Active' },
  { id: 'z5', zip: '10005', zoneNumber: '1A', zoneName: 'Manhattan Central', region: 'North America', depot: 'NYC Central', service: 'Overnight', vehicle: 'Truck', customer: 'Global Logistics', rateCard: 'Corporate Rates', status: 'Active' },
  { id: 'z6', zip: '10006', zoneNumber: '1A', zoneName: 'Manhattan Central', region: 'North America', depot: 'NYC Central', service: 'Standard', vehicle: 'Van', customer: 'Metro Traders', rateCard: 'Volume Discounts', status: 'Active' },
  { id: 'z7', zip: '10007', zoneNumber: '1A', zoneName: 'Manhattan Central', region: 'North America', depot: 'NYC Central', service: 'Express', vehicle: 'Van', customer: '1976 Limited', rateCard: 'Standard Rates', status: 'Active' },
  { id: 'z8', zip: '10008', zoneNumber: '1A', zoneName: 'Manhattan Central', region: 'North America', depot: 'NYC Central', service: 'Standard', vehicle: 'Van', customer: 'Prime Distribution', rateCard: 'Standard Rates', status: 'Inactive' },

  // Manhattan Upper (1B) - NYC Central Depot
  { id: 'z9', zip: '10016', zoneNumber: '1B', zoneName: 'Manhattan Upper', region: 'North America', depot: 'NYC Central', service: 'Express', vehicle: 'Van', customer: '1976 Limited', rateCard: 'Standard Rates', status: 'Active' },
  { id: 'z10', zip: '10017', zoneNumber: '1B', zoneName: 'Manhattan Upper', region: 'North America', depot: 'NYC Central', service: 'Express', vehicle: 'Van', customer: 'Acme Corp', rateCard: 'Corporate Rates', status: 'Active' },
  { id: 'z11', zip: '10018', zoneNumber: '1B', zoneName: 'Manhattan Upper', region: 'North America', depot: 'NYC Central', service: 'Same Day', vehicle: 'Motorcycle', customer: 'Swift Transport', rateCard: 'Premium Rates', status: 'Active' },
  { id: 'z12', zip: '10019', zoneNumber: '1B', zoneName: 'Manhattan Upper', region: 'North America', depot: 'NYC Central', service: 'Standard', vehicle: 'Van', customer: 'Metro Traders', rateCard: 'Standard Rates', status: 'Active' },
  { id: 'z13', zip: '10020', zoneNumber: '1B', zoneName: 'Manhattan Upper', region: 'North America', depot: 'NYC Central', service: 'Overnight', vehicle: 'Truck', customer: 'Global Logistics', rateCard: 'Volume Discounts', status: 'Active' },

  // Brooklyn East (2A) - Brooklyn Hub
  { id: 'z14', zip: '11201', zoneNumber: '2A', zoneName: 'Brooklyn East', region: 'North America', depot: 'Brooklyn Hub', service: 'Standard', vehicle: 'Truck', customer: 'Acme Corp', rateCard: 'Corporate Rates', status: 'Active' },
  { id: 'z15', zip: '11202', zoneNumber: '2A', zoneName: 'Brooklyn East', region: 'North America', depot: 'Brooklyn Hub', service: 'Standard', vehicle: 'Truck', customer: 'Acme Corp', rateCard: 'Corporate Rates', status: 'Active' },
  { id: 'z16', zip: '11203', zoneNumber: '2A', zoneName: 'Brooklyn East', region: 'North America', depot: 'Brooklyn Hub', service: 'Express', vehicle: 'Van', customer: '1976 Limited', rateCard: 'Standard Rates', status: 'Active' },
  { id: 'z17', zip: '11204', zoneNumber: '2A', zoneName: 'Brooklyn East', region: 'North America', depot: 'Brooklyn Hub', service: 'Overnight', vehicle: 'Van', customer: 'Global Logistics', rateCard: 'Premium Rates', status: 'Active' },
  { id: 'z18', zip: '11205', zoneNumber: '2A', zoneName: 'Brooklyn East', region: 'North America', depot: 'Brooklyn Hub', service: 'Standard', vehicle: 'Truck', customer: 'Metro Traders', rateCard: 'Volume Discounts', status: 'Active' },
  { id: 'z19', zip: '11206', zoneNumber: '2A', zoneName: 'Brooklyn East', region: 'North America', depot: 'Brooklyn Hub', service: 'Same Day', vehicle: 'Van', customer: 'Swift Transport', rateCard: 'Premium Rates', status: 'Inactive' },

  // Brooklyn West (2B) - Brooklyn Hub
  { id: 'z20', zip: '11210', zoneNumber: '2B', zoneName: 'Brooklyn West', region: 'North America', depot: 'Brooklyn Hub', service: 'Standard', vehicle: 'Van', customer: 'Prime Distribution', rateCard: 'Standard Rates', status: 'Active' },
  { id: 'z21', zip: '11211', zoneNumber: '2B', zoneName: 'Brooklyn West', region: 'North America', depot: 'Brooklyn Hub', service: 'Express', vehicle: 'Van', customer: '1976 Limited', rateCard: 'Corporate Rates', status: 'Active' },
  { id: 'z22', zip: '11212', zoneNumber: '2B', zoneName: 'Brooklyn West', region: 'North America', depot: 'Brooklyn Hub', service: 'Same Day', vehicle: 'Cargo Bike', customer: 'Acme Corp', rateCard: 'Premium Rates', status: 'Active' },
  { id: 'z23', zip: '11213', zoneNumber: '2B', zoneName: 'Brooklyn West', region: 'North America', depot: 'Brooklyn Hub', service: 'Overnight', vehicle: 'Truck', customer: 'Global Logistics', rateCard: 'Volume Discounts', status: 'Active' },

  // Queens North (3A) - Queens Hub
  { id: 'z24', zip: '11351', zoneNumber: '3A', zoneName: 'Queens North', region: 'North America', depot: 'Queens Hub', service: 'Overnight', vehicle: 'Van', customer: 'Global Logistics', rateCard: 'Premium Rates', status: 'Active' },
  { id: 'z25', zip: '11352', zoneNumber: '3A', zoneName: 'Queens North', region: 'North America', depot: 'Queens Hub', service: 'Standard', vehicle: 'Truck', customer: 'Metro Traders', rateCard: 'Standard Rates', status: 'Active' },
  { id: 'z26', zip: '11353', zoneNumber: '3A', zoneName: 'Queens North', region: 'North America', depot: 'Queens Hub', service: 'Express', vehicle: 'Van', customer: '1976 Limited', rateCard: 'Corporate Rates', status: 'Active' },
  { id: 'z27', zip: '11354', zoneNumber: '3A', zoneName: 'Queens North', region: 'North America', depot: 'Queens Hub', service: 'Same Day', vehicle: 'Van', customer: 'Swift Transport', rateCard: 'Premium Rates', status: 'Active' },
  { id: 'z28', zip: '11355', zoneNumber: '3A', zoneName: 'Queens North', region: 'North America', depot: 'Queens Hub', service: 'Standard', vehicle: 'Van', customer: 'Prime Distribution', rateCard: 'Standard Rates', status: 'Inactive' },

  // Queens South (3B) - Queens Hub
  { id: 'z29', zip: '11360', zoneNumber: '3B', zoneName: 'Queens South', region: 'North America', depot: 'Queens Hub', service: 'Standard', vehicle: 'Truck', customer: 'Acme Corp', rateCard: 'Corporate Rates', status: 'Active' },
  { id: 'z30', zip: '11361', zoneNumber: '3B', zoneName: 'Queens South', region: 'North America', depot: 'Queens Hub', service: 'Express', vehicle: 'Van', customer: '1976 Limited', rateCard: 'Standard Rates', status: 'Active' },
  { id: 'z31', zip: '11362', zoneNumber: '3B', zoneName: 'Queens South', region: 'North America', depot: 'Queens Hub', service: 'Overnight', vehicle: 'Van', customer: 'Global Logistics', rateCard: 'Volume Discounts', status: 'Active' },

  // JFK Area (4A) - JFK Facility
  { id: 'z32', zip: '11430', zoneNumber: '4A', zoneName: 'JFK Airport', region: 'North America', depot: 'JFK Facility', service: 'Express', vehicle: 'Van', customer: '1976 Limited', rateCard: 'Premium Rates', status: 'Active' },
  { id: 'z33', zip: '11431', zoneNumber: '4A', zoneName: 'JFK Airport', region: 'North America', depot: 'JFK Facility', service: 'Same Day', vehicle: 'Van', customer: 'Swift Transport', rateCard: 'Premium Rates', status: 'Active' },
  { id: 'z34', zip: '11432', zoneNumber: '4A', zoneName: 'JFK Airport', region: 'North America', depot: 'JFK Facility', service: 'Overnight', vehicle: 'Truck', customer: 'Global Logistics', rateCard: 'Corporate Rates', status: 'Active' },
  { id: 'z35', zip: '11433', zoneNumber: '4A', zoneName: 'JFK Airport', region: 'North America', depot: 'JFK Facility', service: 'Standard', vehicle: 'Truck', customer: 'Metro Traders', rateCard: 'Standard Rates', status: 'Active' },

  // Newark Area (4B) - Newark Gateway
  { id: 'z36', zip: '07101', zoneNumber: '4B', zoneName: 'Newark Gateway', region: 'North America', depot: 'Newark Gateway', service: 'Express', vehicle: 'Van', customer: 'Acme Corp', rateCard: 'Corporate Rates', status: 'Active' },
  { id: 'z37', zip: '07102', zoneNumber: '4B', zoneName: 'Newark Gateway', region: 'North America', depot: 'Newark Gateway', service: 'Standard', vehicle: 'Truck', customer: 'Prime Distribution', rateCard: 'Standard Rates', status: 'Active' },
  { id: 'z38', zip: '07103', zoneNumber: '4B', zoneName: 'Newark Gateway', region: 'North America', depot: 'Newark Gateway', service: 'Overnight', vehicle: 'Van', customer: 'Global Logistics', rateCard: 'Volume Discounts', status: 'Active' },
  { id: 'z39', zip: '07104', zoneNumber: '4B', zoneName: 'Newark Gateway', region: 'North America', depot: 'Newark Gateway', service: 'Same Day', vehicle: 'Van', customer: 'Swift Transport', rateCard: 'Premium Rates', status: 'Inactive' },

  // Hoboken (5A) - Hoboken Depot
  { id: 'z40', zip: '07030', zoneNumber: '5A', zoneName: 'Hoboken', region: 'North America', depot: 'Hoboken Depot', service: 'Express', vehicle: 'Van', customer: '1976 Limited', rateCard: 'Standard Rates', status: 'Active' },
  { id: 'z41', zip: '07031', zoneNumber: '5A', zoneName: 'Hoboken', region: 'North America', depot: 'Hoboken Depot', service: 'Same Day', vehicle: 'Cargo Bike', customer: 'Acme Corp', rateCard: 'Premium Rates', status: 'Active' },
  { id: 'z42', zip: '07032', zoneNumber: '5A', zoneName: 'Hoboken', region: 'North America', depot: 'Hoboken Depot', service: 'Standard', vehicle: 'Van', customer: 'Metro Traders', rateCard: 'Standard Rates', status: 'Active' },
  { id: 'z43', zip: '07033', zoneNumber: '5A', zoneName: 'Hoboken', region: 'North America', depot: 'Hoboken Depot', service: 'Overnight', vehicle: 'Truck', customer: 'Global Logistics', rateCard: 'Corporate Rates', status: 'Active' },

  // Jersey City (5B) - Hoboken Depot
  { id: 'z44', zip: '07302', zoneNumber: '5B', zoneName: 'Jersey City', region: 'North America', depot: 'Hoboken Depot', service: 'Express', vehicle: 'Van', customer: 'Prime Distribution', rateCard: 'Corporate Rates', status: 'Active' },
  { id: 'z45', zip: '07303', zoneNumber: '5B', zoneName: 'Jersey City', region: 'North America', depot: 'Hoboken Depot', service: 'Standard', vehicle: 'Truck', customer: 'Acme Corp', rateCard: 'Volume Discounts', status: 'Active' },
  { id: 'z46', zip: '07304', zoneNumber: '5B', zoneName: 'Jersey City', region: 'North America', depot: 'Hoboken Depot', service: 'Same Day', vehicle: 'Van', customer: 'Swift Transport', rateCard: 'Premium Rates', status: 'Active' },
  { id: 'z47', zip: '07305', zoneNumber: '5B', zoneName: 'Jersey City', region: 'North America', depot: 'Hoboken Depot', service: 'Overnight', vehicle: 'Van', customer: '1976 Limited', rateCard: 'Standard Rates', status: 'Inactive' },

  // Bronx (6A) - NYC Central
  { id: 'z48', zip: '10451', zoneNumber: '6A', zoneName: 'South Bronx', region: 'North America', depot: 'NYC Central', service: 'Standard', vehicle: 'Truck', customer: 'Metro Traders', rateCard: 'Standard Rates', status: 'Active' },
  { id: 'z49', zip: '10452', zoneNumber: '6A', zoneName: 'South Bronx', region: 'North America', depot: 'NYC Central', service: 'Express', vehicle: 'Van', customer: '1976 Limited', rateCard: 'Corporate Rates', status: 'Active' },
  { id: 'z50', zip: '10453', zoneNumber: '6A', zoneName: 'South Bronx', region: 'North America', depot: 'NYC Central', service: 'Overnight', vehicle: 'Van', customer: 'Global Logistics', rateCard: 'Volume Discounts', status: 'Active' },

  // Staten Island (6B) - Newark Gateway
  { id: 'z51', zip: '10301', zoneNumber: '6B', zoneName: 'Staten Island', region: 'North America', depot: 'Newark Gateway', service: 'Standard', vehicle: 'Truck', customer: 'Prime Distribution', rateCard: 'Standard Rates', status: 'Active' },
  { id: 'z52', zip: '10302', zoneNumber: '6B', zoneName: 'Staten Island', region: 'North America', depot: 'Newark Gateway', service: 'Express', vehicle: 'Van', customer: 'Acme Corp', rateCard: 'Corporate Rates', status: 'Active' },
  { id: 'z53', zip: '10303', zoneNumber: '6B', zoneName: 'Staten Island', region: 'North America', depot: 'Newark Gateway', service: 'Overnight', vehicle: 'Van', customer: 'Swift Transport', rateCard: 'Premium Rates', status: 'Inactive' },
];

// 12 Zone Groups with realistic configurations
export const zoneGroupsData: ZoneGroup[] = [
  {
    id: 'g1',
    name: 'Manhattan Express',
    region: 'North America',
    status: 'active',
    zipCount: 13,
    zips: ['z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7', 'z9', 'z10', 'z11', 'z12', 'z13', 'z8'],
    filters: { service: ['Express', 'Same Day'], vehicle: ['Van', 'Cargo Bike', 'Motorcycle'] },
  },
  {
    id: 'g2',
    name: 'Brooklyn Standard',
    region: 'North America',
    status: 'active',
    zipCount: 10,
    zips: ['z14', 'z15', 'z16', 'z17', 'z18', 'z19', 'z20', 'z21', 'z22', 'z23'],
    filters: { service: ['Standard', 'Overnight'], vehicle: ['Truck', 'Van'] },
  },
  {
    id: 'g3',
    name: 'Queens Full Service',
    region: 'North America',
    status: 'active',
    zipCount: 8,
    zips: ['z24', 'z25', 'z26', 'z27', 'z28', 'z29', 'z30', 'z31'],
    filters: { depot: ['Queens Hub'] },
  },
  {
    id: 'g4',
    name: 'Airport Express',
    region: 'North America',
    status: 'active',
    zipCount: 4,
    zips: ['z32', 'z33', 'z34', 'z35'],
    filters: { service: ['Express', 'Same Day'], depot: ['JFK Facility'] },
  },
  {
    id: 'g5',
    name: 'Newark Regional',
    region: 'North America',
    status: 'active',
    zipCount: 8,
    zips: ['z36', 'z37', 'z38', 'z39', 'z51', 'z52', 'z53'],
    filters: { depot: ['Newark Gateway'] },
  },
  {
    id: 'g6',
    name: 'Hoboken Metro',
    region: 'North America',
    status: 'active',
    zipCount: 8,
    zips: ['z40', 'z41', 'z42', 'z43', 'z44', 'z45', 'z46', 'z47'],
    filters: { depot: ['Hoboken Depot'] },
  },
  {
    id: 'g7',
    name: '1976 Limited Zones',
    region: 'North America',
    status: 'active',
    zipCount: 12,
    zips: ['z1', 'z2', 'z7', 'z9', 'z16', 'z21', 'z26', 'z30', 'z32', 'z40', 'z47', 'z49'],
    filters: { customer: ['1976 Limited'] },
  },
  {
    id: 'g8',
    name: 'Same Day Coverage',
    region: 'North America',
    status: 'active',
    zipCount: 10,
    zips: ['z3', 'z4', 'z11', 'z22', 'z27', 'z33', 'z39', 'z41', 'z46'],
    filters: { service: ['Same Day'] },
  },
  {
    id: 'g9',
    name: 'Overnight Network',
    region: 'North America',
    status: 'active',
    zipCount: 11,
    zips: ['z5', 'z13', 'z17', 'z23', 'z24', 'z31', 'z34', 'z38', 'z43', 'z50', 'z53'],
    filters: { service: ['Overnight'] },
  },
  {
    id: 'g10',
    name: 'Truck Routes',
    region: 'North America',
    status: 'active',
    zipCount: 14,
    zips: ['z5', 'z14', 'z15', 'z18', 'z23', 'z25', 'z29', 'z34', 'z35', 'z37', 'z43', 'z45', 'z48', 'z51'],
    filters: { vehicle: ['Truck', 'Semi'] },
  },
  {
    id: 'g11',
    name: 'Bronx Coverage',
    region: 'North America',
    status: 'inactive',
    zipCount: 3,
    zips: ['z48', 'z49', 'z50'],
    filters: { zoneName: ['South Bronx'] },
  },
  {
    id: 'g12',
    name: 'Global Logistics Zones',
    region: 'North America',
    status: 'active',
    zipCount: 10,
    zips: ['z5', 'z17', 'z24', 'z31', 'z34', 'z38', 'z43', 'z50'],
    filters: { customer: ['Global Logistics'] },
  },
];

// 8 Depots with full contact info and drop-off locations
export const depotsData: Depot[] = [
  {
    id: 'd1',
    name: 'NYC Central',
    address: '123 Industrial Parkway',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    phone: '+1 (212) 555-0100',
    email: 'ops.nyc@deliverdifferent.com',
    status: 'active',
    zoneGroups: ['g1', 'g7', 'g8', 'g11'],
    dropOffLocations: [
      { id: 'dl1', name: 'Times Square Drop-off', address: '1540 Broadway, New York, NY 10036', hours: '24/7', contact: '+1 (212) 555-0101' },
      { id: 'dl2', name: 'Penn Station Drop-off', address: '242 W 31st St, New York, NY 10001', hours: '6am-10pm', contact: '+1 (212) 555-0102' },
      { id: 'dl3', name: 'Grand Central Drop-off', address: '89 E 42nd St, New York, NY 10017', hours: '7am-9pm', contact: '+1 (212) 555-0103' },
    ],
  },
  {
    id: 'd2',
    name: 'Brooklyn Hub',
    address: '456 Commerce Drive',
    city: 'Brooklyn',
    state: 'NY',
    zip: '11201',
    phone: '+1 (718) 555-0200',
    email: 'ops.brooklyn@deliverdifferent.com',
    status: 'active',
    zoneGroups: ['g2'],
    dropOffLocations: [
      { id: 'dl4', name: 'DUMBO Drop-off', address: '55 Water St, Brooklyn, NY 11201', hours: '8am-8pm', contact: '+1 (718) 555-0201' },
      { id: 'dl5', name: 'Williamsburg Drop-off', address: '300 Bedford Ave, Brooklyn, NY 11249', hours: '9am-7pm', contact: '+1 (718) 555-0202' },
    ],
  },
  {
    id: 'd3',
    name: 'Queens Hub',
    address: '789 Queens Blvd',
    city: 'Long Island City',
    state: 'NY',
    zip: '11101',
    phone: '+1 (718) 555-0300',
    email: 'ops.queens@deliverdifferent.com',
    status: 'active',
    zoneGroups: ['g3'],
    dropOffLocations: [
      { id: 'dl6', name: 'Flushing Drop-off', address: '41-60 Main St, Flushing, NY 11355', hours: '8am-6pm', contact: '+1 (718) 555-0301' },
    ],
  },
  {
    id: 'd4',
    name: 'JFK Facility',
    address: 'Building 75, JFK Airport',
    city: 'Jamaica',
    state: 'NY',
    zip: '11430',
    phone: '+1 (718) 555-0400',
    email: 'ops.jfk@deliverdifferent.com',
    status: 'active',
    zoneGroups: ['g4'],
    dropOffLocations: [
      { id: 'dl7', name: 'Terminal 1 Cargo', address: 'JFK Airport Terminal 1, Jamaica, NY 11430', hours: '24/7', contact: '+1 (718) 555-0401' },
      { id: 'dl8', name: 'Terminal 4 Cargo', address: 'JFK Airport Terminal 4, Jamaica, NY 11430', hours: '24/7', contact: '+1 (718) 555-0402' },
    ],
  },
  {
    id: 'd5',
    name: 'Newark Gateway',
    address: '100 Gateway Center',
    city: 'Newark',
    state: 'NJ',
    zip: '07102',
    phone: '+1 (973) 555-0500',
    email: 'ops.newark@deliverdifferent.com',
    status: 'active',
    zoneGroups: ['g5'],
    dropOffLocations: [
      { id: 'dl9', name: 'Newark Penn Station', address: 'Raymond Plaza W, Newark, NJ 07102', hours: '6am-11pm', contact: '+1 (973) 555-0501' },
    ],
  },
  {
    id: 'd6',
    name: 'Hoboken Depot',
    address: '200 River Street',
    city: 'Hoboken',
    state: 'NJ',
    zip: '07030',
    phone: '+1 (201) 555-0600',
    email: 'ops.hoboken@deliverdifferent.com',
    status: 'active',
    zoneGroups: ['g6'],
    dropOffLocations: [
      { id: 'dl10', name: 'Hoboken Terminal', address: '1 Hudson Place, Hoboken, NJ 07030', hours: '7am-9pm', contact: '+1 (201) 555-0601' },
      { id: 'dl11', name: 'Exchange Place', address: '30 Hudson St, Jersey City, NJ 07302', hours: '8am-8pm', contact: '+1 (201) 555-0602' },
    ],
  },
  {
    id: 'd7',
    name: 'LaGuardia Station',
    address: '100 LaGuardia Rd',
    city: 'East Elmhurst',
    state: 'NY',
    zip: '11369',
    phone: '+1 (718) 555-0700',
    email: 'ops.lga@deliverdifferent.com',
    status: 'inactive',
    zoneGroups: [],
    dropOffLocations: [],
  },
  {
    id: 'd8',
    name: 'White Plains Center',
    address: '50 Main Street',
    city: 'White Plains',
    state: 'NY',
    zip: '10601',
    phone: '+1 (914) 555-0800',
    email: 'ops.whiteplains@deliverdifferent.com',
    status: 'inactive',
    zoneGroups: [],
    dropOffLocations: [],
  },
];

// Filter definitions for all 9 required filters
export const zipZoneFilters: FilterDefinition[] = [
  { id: 'zoneNumber', label: 'Zone #', options: ['All Zones', '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'] },
  { id: 'zoneName', label: 'Zone Name', options: ['All Names', 'Manhattan Central', 'Manhattan Upper', 'Brooklyn East', 'Brooklyn West', 'Queens North', 'Queens South', 'JFK Airport', 'Newark Gateway', 'Hoboken', 'Jersey City', 'South Bronx', 'Staten Island'] },
  { id: 'region', label: 'Region', options: ['All Regions', 'North America', 'Europe', 'Asia Pacific', 'Latin America'] },
  { id: 'depot', label: 'Depot', options: ['All Depots', 'NYC Central', 'Brooklyn Hub', 'Queens Hub', 'JFK Facility', 'Newark Gateway', 'Hoboken Depot'] },
  { id: 'service', label: 'Service', options: ['All Services', 'Standard', 'Express', 'Overnight', 'Same Day'] },
  { id: 'vehicle', label: 'Vehicle', options: ['All Vehicles', 'Van', 'Truck', 'Semi', 'Cargo Bike', 'Motorcycle'] },
  { id: 'customer', label: 'Customer', options: ['All Customers', '1976 Limited', 'Acme Corp', 'Global Logistics', 'Metro Traders', 'Prime Distribution', 'Swift Transport'] },
  { id: 'rateCard', label: 'Rate Card', options: ['All Rate Cards', 'Standard Rates', 'Premium Rates', 'Corporate Rates', 'Volume Discounts'] },
];

// Depot zone group filters (subset of main filters)
export const depotZoneGroupFilters: FilterDefinition[] = [
  { id: 'region', label: 'Region', options: ['All Regions', 'North America', 'Europe', 'Asia Pacific'] },
  { id: 'service', label: 'Service', options: ['All Services', 'Standard', 'Express', 'Overnight', 'Same Day'] },
  { id: 'customer', label: 'Customer', options: ['All Customers', '1976 Limited', 'Acme Corp', 'Global Logistics', 'Metro Traders'] },
  { id: 'tag', label: 'Tag', options: ['All Tags', 'High Volume', 'Express Only', 'Weekend Service', 'Priority'] },
];

// Table columns for zip zones
export const zipZoneColumns = [
  { key: 'zip', label: 'Zip Code' },
  { key: 'zoneNumber', label: 'Zone #' },
  { key: 'zoneName', label: 'Zone Name' },
  { key: 'region', label: 'Region' },
  { key: 'depot', label: 'Depot' },
  { key: 'service', label: 'Service' },
  { key: 'customer', label: 'Customer' },
  { key: 'status', label: 'Status' },
];

// Table columns for zip selection in zone groups
export const zipSelectionColumns = [
  { key: 'zip', label: 'Zip' },
  { key: 'zoneNumber', label: 'Zone #' },
  { key: 'zoneName', label: 'Zone Name' },
  { key: 'depot', label: 'Depot' },
];

// Table columns for zone groups in depots
export const zoneGroupColumns = [
  { key: 'name', label: 'Name' },
  { key: 'zipCount', label: 'Zip Count' },
  { key: 'status', label: 'Status' },
];

// ============================================
// SAMPLE CONNECTION DATA
// See TAG-SYSTEM-SPEC.md for documentation
// ============================================

interface SampleConnectionData {
  connections: EntityConnections;
  connectedCount: number;
  hasIssues: boolean;
}

/**
 * Sample connection data for zone groups.
 * In production, this would be computed from actual relationships.
 */
export const sampleZoneGroupConnections: Record<string, SampleConnectionData> = {
  g1: {
    connections: {
      customers: { hasConnections: true, count: 847, connectionPath: 'via rate cards and service areas' },
      zoneGroups: { hasConnections: false, count: 0 },
      depots: { hasConnections: true, count: 1, connectionPath: 'NYC Central' },
      rateCards: { hasConnections: true, count: 4, connectionPath: 'Standard, Premium, Corporate, Volume' },
      services: { hasConnections: true, count: 3, connectionPath: 'Express, Same Day, Standard' },
      vehicles: { hasConnections: true, count: 3, connectionPath: 'Van, Cargo Bike, Motorcycle' },
      notifications: { hasConnections: true, count: 2, connectionPath: 'Email, SMS' },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1, connectionPath: 'North America' },
    },
    connectedCount: 7,
    hasIssues: false,
  },
  g2: {
    connections: {
      customers: { hasConnections: true, count: 234, connectionPath: 'via Brooklyn Hub' },
      zoneGroups: { hasConnections: false, count: 0 },
      depots: { hasConnections: true, count: 1, connectionPath: 'Brooklyn Hub' },
      rateCards: { hasConnections: true, count: 3, connectionPath: 'Standard, Corporate, Premium' },
      services: { hasConnections: true, count: 2, connectionPath: 'Standard, Overnight' },
      vehicles: { hasConnections: true, count: 2, connectionPath: 'Truck, Van' },
      notifications: { hasConnections: true, count: 1, connectionPath: 'Email only' },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1, connectionPath: 'North America' },
    },
    connectedCount: 7,
    hasIssues: false,
  },
  g3: {
    connections: {
      customers: { hasConnections: true, count: 156, connectionPath: 'via Queens Hub' },
      zoneGroups: { hasConnections: false, count: 0 },
      depots: { hasConnections: true, count: 1, connectionPath: 'Queens Hub' },
      rateCards: { hasConnections: true, count: 4 },
      services: { hasConnections: true, count: 4, connectionPath: 'All services' },
      vehicles: { hasConnections: true, count: 2, connectionPath: 'Van, Truck' },
      notifications: { hasConnections: true, count: 2 },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 7,
    hasIssues: false,
  },
  g4: {
    connections: {
      customers: { hasConnections: true, count: 89, connectionPath: 'via JFK Facility' },
      zoneGroups: { hasConnections: false, count: 0 },
      depots: { hasConnections: true, count: 1, connectionPath: 'JFK Facility' },
      rateCards: { hasConnections: true, count: 2, connectionPath: 'Premium, Corporate' },
      services: { hasConnections: true, count: 2, connectionPath: 'Express, Same Day' },
      vehicles: { hasConnections: true, count: 2, connectionPath: 'Van, Truck' },
      notifications: { hasConnections: true, count: 3 },
      airports: { hasConnections: true, count: 1, connectionPath: 'JFK' },
      linehauls: { hasConnections: true, count: 2, connectionPath: 'NYC-BOS, NYC-DC' },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 9,
    hasIssues: false,
  },
  g5: {
    connections: {
      customers: { hasConnections: true, count: 178, connectionPath: 'via Newark Gateway' },
      zoneGroups: { hasConnections: false, count: 0 },
      depots: { hasConnections: true, count: 1, connectionPath: 'Newark Gateway' },
      rateCards: { hasConnections: true, count: 3 },
      services: { hasConnections: true, count: 4, connectionPath: 'All services' },
      vehicles: { hasConnections: true, count: 2 },
      notifications: { hasConnections: false, count: 0 },
      airports: { hasConnections: true, count: 1, connectionPath: 'Newark' },
      linehauls: { hasConnections: true, count: 3 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 8,
    hasIssues: true, // No notifications configured - potential issue
  },
  g6: {
    connections: {
      customers: { hasConnections: true, count: 123 },
      zoneGroups: { hasConnections: false, count: 0 },
      depots: { hasConnections: true, count: 1, connectionPath: 'Hoboken Depot' },
      rateCards: { hasConnections: true, count: 4 },
      services: { hasConnections: true, count: 4 },
      vehicles: { hasConnections: true, count: 3 },
      notifications: { hasConnections: true, count: 2 },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 7,
    hasIssues: false,
  },
  g7: {
    connections: {
      customers: { hasConnections: true, count: 1, connectionPath: '1976 Limited' },
      zoneGroups: { hasConnections: false, count: 0 },
      depots: { hasConnections: true, count: 4, connectionPath: 'Multiple depots' },
      rateCards: { hasConnections: true, count: 3 },
      services: { hasConnections: true, count: 3 },
      vehicles: { hasConnections: true, count: 2 },
      notifications: { hasConnections: true, count: 3 },
      airports: { hasConnections: true, count: 1, connectionPath: 'JFK' },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 8,
    hasIssues: false,
  },
  g8: {
    connections: {
      customers: { hasConnections: true, count: 412, connectionPath: 'via Same Day service' },
      zoneGroups: { hasConnections: false, count: 0 },
      depots: { hasConnections: true, count: 5, connectionPath: 'Multiple depots' },
      rateCards: { hasConnections: true, count: 1, connectionPath: 'Premium Rates only' },
      services: { hasConnections: true, count: 1, connectionPath: 'Same Day' },
      vehicles: { hasConnections: true, count: 3, connectionPath: 'Van, Cargo Bike, Motorcycle' },
      notifications: { hasConnections: true, count: 4, connectionPath: 'All channels' },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 7,
    hasIssues: false,
  },
  g9: {
    connections: {
      customers: { hasConnections: true, count: 289 },
      zoneGroups: { hasConnections: false, count: 0 },
      depots: { hasConnections: true, count: 6 },
      rateCards: { hasConnections: true, count: 2 },
      services: { hasConnections: true, count: 1, connectionPath: 'Overnight' },
      vehicles: { hasConnections: true, count: 2, connectionPath: 'Truck, Van' },
      notifications: { hasConnections: true, count: 2 },
      airports: { hasConnections: true, count: 2, connectionPath: 'JFK, Newark' },
      linehauls: { hasConnections: true, count: 5, connectionPath: 'All routes' },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 9,
    hasIssues: false,
  },
  g10: {
    connections: {
      customers: { hasConnections: true, count: 567 },
      zoneGroups: { hasConnections: false, count: 0 },
      depots: { hasConnections: true, count: 6 },
      rateCards: { hasConnections: true, count: 4 },
      services: { hasConnections: true, count: 3 },
      vehicles: { hasConnections: true, count: 2, connectionPath: 'Truck, Semi' },
      notifications: { hasConnections: true, count: 2 },
      airports: { hasConnections: true, count: 2 },
      linehauls: { hasConnections: true, count: 4 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 9,
    hasIssues: false,
  },
  g11: {
    connections: {
      customers: { hasConnections: false, count: 0 },
      zoneGroups: { hasConnections: false, count: 0 },
      depots: { hasConnections: true, count: 1, connectionPath: 'NYC Central' },
      rateCards: { hasConnections: false, count: 0 },
      services: { hasConnections: true, count: 3 },
      vehicles: { hasConnections: true, count: 2 },
      notifications: { hasConnections: false, count: 0 },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 4,
    hasIssues: true, // No customers, no rate cards - definitely has issues
  },
  g12: {
    connections: {
      customers: { hasConnections: true, count: 1, connectionPath: 'Global Logistics' },
      zoneGroups: { hasConnections: false, count: 0 },
      depots: { hasConnections: true, count: 5 },
      rateCards: { hasConnections: true, count: 2 },
      services: { hasConnections: true, count: 2 },
      vehicles: { hasConnections: true, count: 2 },
      notifications: { hasConnections: true, count: 3 },
      airports: { hasConnections: true, count: 2 },
      linehauls: { hasConnections: true, count: 3 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 9,
    hasIssues: false,
  },
};

/**
 * Sample connection data for depots.
 */
export const sampleDepotConnections: Record<string, SampleConnectionData> = {
  d1: {
    connections: {
      customers: { hasConnections: true, count: 1243 },
      zoneGroups: { hasConnections: true, count: 4 },
      depots: { hasConnections: false, count: 0 },
      rateCards: { hasConnections: true, count: 4 },
      services: { hasConnections: true, count: 4 },
      vehicles: { hasConnections: true, count: 4 },
      notifications: { hasConnections: true, count: 3 },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: true, count: 3 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 8,
    hasIssues: false,
  },
  d2: {
    connections: {
      customers: { hasConnections: true, count: 567 },
      zoneGroups: { hasConnections: true, count: 1 },
      depots: { hasConnections: false, count: 0 },
      rateCards: { hasConnections: true, count: 3 },
      services: { hasConnections: true, count: 3 },
      vehicles: { hasConnections: true, count: 2 },
      notifications: { hasConnections: true, count: 2 },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 7,
    hasIssues: false,
  },
  d3: {
    connections: {
      customers: { hasConnections: true, count: 345 },
      zoneGroups: { hasConnections: true, count: 1 },
      depots: { hasConnections: false, count: 0 },
      rateCards: { hasConnections: true, count: 4 },
      services: { hasConnections: true, count: 4 },
      vehicles: { hasConnections: true, count: 2 },
      notifications: { hasConnections: true, count: 2 },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 7,
    hasIssues: false,
  },
  d4: {
    connections: {
      customers: { hasConnections: true, count: 234 },
      zoneGroups: { hasConnections: true, count: 1 },
      depots: { hasConnections: false, count: 0 },
      rateCards: { hasConnections: true, count: 2 },
      services: { hasConnections: true, count: 2 },
      vehicles: { hasConnections: true, count: 2 },
      notifications: { hasConnections: true, count: 4 },
      airports: { hasConnections: true, count: 1 },
      linehauls: { hasConnections: true, count: 4 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 9,
    hasIssues: false,
  },
  d5: {
    connections: {
      customers: { hasConnections: true, count: 456 },
      zoneGroups: { hasConnections: true, count: 1 },
      depots: { hasConnections: false, count: 0 },
      rateCards: { hasConnections: true, count: 3 },
      services: { hasConnections: true, count: 4 },
      vehicles: { hasConnections: true, count: 2 },
      notifications: { hasConnections: false, count: 0 },
      airports: { hasConnections: true, count: 1 },
      linehauls: { hasConnections: true, count: 3 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 8,
    hasIssues: true, // No notifications
  },
  d6: {
    connections: {
      customers: { hasConnections: true, count: 289 },
      zoneGroups: { hasConnections: true, count: 1 },
      depots: { hasConnections: false, count: 0 },
      rateCards: { hasConnections: true, count: 4 },
      services: { hasConnections: true, count: 4 },
      vehicles: { hasConnections: true, count: 3 },
      notifications: { hasConnections: true, count: 2 },
      airports: { hasConnections: false, count: 0 },
      linehauls: { hasConnections: false, count: 0 },
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 7,
    hasIssues: false,
  },
  d7: {
    connections: {
      ...createEmptyConnections(),
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 1,
    hasIssues: true, // Inactive depot - minimal connections
  },
  d8: {
    connections: {
      ...createEmptyConnections(),
      regions: { hasConnections: true, count: 1 },
    },
    connectedCount: 1,
    hasIssues: true, // Inactive depot - minimal connections
  },
};
