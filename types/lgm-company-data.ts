/**
 * LGM (Let's Get Moving) Company Data TypeScript Interfaces
 * Generated from SmartMoving API exploration
 * Date: 2025-08-08
 */

export interface LGMCompanyInfo {
  name: string;
  api_source: string;
  data_extraction_date: string;
  api_base_url: string;
  api_key: string;
  client_id: string;
  total_branches: number;
  total_users: number;
  total_materials: number;
  total_inventory_items: number;
  total_service_types: number;
  total_move_sizes: number;
  total_room_types: number;
  total_referral_sources: number;
}

export interface LGMGPS {
  latitude: number;
  longitude: number;
}

export interface LGMBranch {
  id: string;
  name: string;
  phone: string;
  is_primary: boolean;
  country: string;
  province_state: string;
  city: string;
  full_address: string;
  street: string;
  zip_code: string;
  gps: LGMGPS;
}

export interface LGMBranches {
  summary: {
    total: number;
    with_gps: number;
    countries: string[];
    primary_branch: string | null;
  };
  locations: LGMBranch[];
}

export interface LGMMaterial {
  id: string;
  name: string;
  description: string;
  rate: number;
  unit: string;
  category: string;
  dimensions?: string;
  max_size?: string;
  size_range?: string;
  capacity?: string;
  contents?: string[];
  weight?: string;
}

export interface LGMMaterials {
  summary: {
    total: number;
    categories: string[];
    price_range: {
      min: number;
      max: number;
      currency: string;
    };
  };
  catalog: LGMMaterial[];
}

export interface LGMServiceType {
  id: number;
  name: string;
  scaling_factor_percentage: number;
  has_activity_loading: boolean;
  has_activity_finished_loading: boolean;
  has_activity_unloading: boolean;
  order: number;
}

export interface LGMServiceTypes {
  summary: {
    total: number;
    features: string[];
  };
  types: LGMServiceType[];
}

export interface LGMMoveSize {
  id: string;
  name: string;
  description: string;
  volume: number;
  weight: number;
}

export interface LGMMoveSizes {
  summary: {
    total: number;
    volume_range: {
      min: number;
      max: number;
      unit: string;
    };
    weight_range: {
      min: number;
      max: number;
      unit: string;
    };
  };
  sizes: LGMMoveSize[];
}

export interface LGMRoomType {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface LGMRoomTypes {
  summary: {
    total: number;
    purpose: string;
  };
  types: LGMRoomType[];
}

export interface LGMUser {
  id: string;
  name: string;
  title: string;
  email: string;
  primary_branch: {
    id: string;
    name: string;
  };
  role: {
    id: string;
    name: string;
  };
}

export interface LGMUsers {
  summary: {
    total: number;
    roles: string[];
  };
  sample_users: LGMUser[];
}

export interface LGMReferralSource {
  id: string;
  name: string;
  is_lead_provider: boolean;
  is_public: boolean;
}

export interface LGMReferralSources {
  summary: {
    total: number;
    types: string[];
  };
  sources: LGMReferralSource[];
}

export interface LGMTariff {
  id: string;
  name: string;
  is_enabled: boolean;
  materials_count: number;
}

export interface LGMTariffs {
  summary: {
    total: number;
    active: number;
  };
  tariffs: LGMTariff[];
}

export interface LGMJobAddresses {
  origin: string;
  destination: string;
}

export interface LGMJobLabor {
  rate: number;
  hours: number;
  total: number;
  hours_estimated?: number;
  hours_actual?: number;
  total_estimated?: number;
  total_actual?: number;
}

export interface LGMJobMaterials {
  heavy_item?: {
    description: string;
    cost: number;
  };
}

export interface LGMJobProcessingFee {
  percentage: number;
  amount: number;
}

export interface LGMJobCharges {
  labor: LGMJobLabor;
  materials: LGMJobMaterials;
  processing_fee?: LGMJobProcessingFee;
  tax: number;
  total: number;
}

export interface LGMJob {
  id: string;
  job_number: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  branch: {
    name: string;
    phone: string;
  };
  service_type: string;
  crew_size: number;
  trucks: number;
  duration: string;
  status: string;
  confirmed: boolean;
  addresses: LGMJobAddresses;
  charges: LGMJobCharges;
}

export interface LGMSampleJobs {
  summary: {
    total_samples: number;
    date_range: string;
  };
  jobs: LGMJob[];
}

export interface LGMIntegrationNotes {
  api_endpoints: {
    branches: string;
    users: string;
    materials: string;
    inventory: string;
    service_types: string;
    move_sizes: string;
    room_types: string;
    referral_sources: string;
    customers: string;
    opportunities: string;
    jobs: string;
  };
  authentication: {
    method: string;
    header: string;
  };
  data_usage: {
    frontend: string[];
    backend: string[];
  };
  sync_recommendations: {
    frequency: string;
    priority: string[];
    storage: string;
  };
}

export interface LGMCompanyData {
  company_info: LGMCompanyInfo;
  branches: LGMBranches;
  materials: LGMMaterials;
  service_types: LGMServiceTypes;
  move_sizes: LGMMoveSizes;
  room_types: LGMRoomTypes;
  users: LGMUsers;
  referral_sources: LGMReferralSources;
  tariffs: LGMTariffs;
  sample_jobs: LGMSampleJobs;
  integration_notes: LGMIntegrationNotes;
}

// Utility types for common operations
export type LGMCountry = 'Canada' | 'United States';
export type LGMProvinceState = 'British Columbia' | 'Ontario' | 'Virginia' | 'Texas' | 'Alberta';
export type LGMServiceTypeName = 'Full Service Move' | 'Partial Move';
export type LGMJobStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

// Helper functions
export const findBranchByCity = (branches: LGMBranch[], city: string): LGMBranch | undefined => {
  return branches.find(branch => branch.city.toLowerCase() === city.toLowerCase());
};

export const findMaterialByName = (materials: LGMMaterial[], name: string): LGMMaterial | undefined => {
  return materials.find(material => material.name.toLowerCase().includes(name.toLowerCase()));
};

export const findServiceTypeByName = (serviceTypes: LGMServiceType[], name: string): LGMServiceType | undefined => {
  return serviceTypes.find(service => service.name === name);
};

export const calculateDistance = (gps1: LGMGPS, gps2: LGMGPS): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (gps2.latitude - gps1.latitude) * Math.PI / 180;
  const dLon = (gps2.longitude - gps1.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(gps1.latitude * Math.PI / 180) * Math.cos(gps2.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const getBranchesByCountry = (branches: LGMBranch[], country: LGMCountry): LGMBranch[] => {
  return branches.filter(branch => branch.country === country);
};

export const getMaterialsByCategory = (materials: LGMMaterial[], category: string): LGMMaterial[] => {
  return materials.filter(material => material.category === category);
};

export const getMaterialsInPriceRange = (materials: LGMMaterial[], minPrice: number, maxPrice: number): LGMMaterial[] => {
  return materials.filter(material => material.rate >= minPrice && material.rate <= maxPrice);
};
