// Storage Management Components
export { InteractiveMap } from './StorageMap/InteractiveMap';
export { StorageAnalytics } from './Analytics/StorageAnalytics';
export { AddLocationModal } from './Modals/AddLocationModal';
export { AddStorageUnitModal } from './Modals/AddStorageUnitModal';

// Re-export types for convenience
export type { 
  StorageUnit,
  StorageLocation,
  StorageZone,
  StorageMap,
  StorageAnalytics as StorageAnalyticsType,
  StorageBooking,
  StorageUser,
  StorageFilter,
  LocationFilter,
  OperationalKPIs,
  FinancialKPIs
} from '@/types/storage'; 