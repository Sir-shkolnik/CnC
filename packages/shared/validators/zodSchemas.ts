// Zod validation schemas for C&C CRM
import { z } from 'zod';
import { UserRole, JourneyStage, EntryType, MediaType, TagType } from '../models/enums';

// ===== CORE VALIDATION SCHEMAS =====

export const UserRoleSchema = z.nativeEnum(UserRole);
export const JourneyStageSchema = z.nativeEnum(JourneyStage);
export const EntryTypeSchema = z.nativeEnum(EntryType);
export const MediaTypeSchema = z.nativeEnum(MediaType);
export const TagTypeSchema = z.nativeEnum(TagType);

// ===== AUTH SCHEMAS =====

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: UserRoleSchema,
  locationId: z.string().cuid('Invalid location ID'),
});

// ===== JOURNEY SCHEMAS =====

export const CreateJourneySchema = z.object({
  locationId: z.string().cuid('Invalid location ID'),
  date: z.string().datetime('Invalid date format'),
  truckNumber: z.string().optional(),
  moveSourceId: z.string().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  crewIds: z.array(z.string().cuid('Invalid user ID')).min(1, 'At least one crew member required'),
});

export const UpdateJourneySchema = z.object({
  status: JourneyStageSchema.optional(),
  startTime: z.string().datetime('Invalid date format').optional(),
  endTime: z.string().datetime('Invalid date format').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  truckNumber: z.string().optional(),
});

export const JourneyFiltersSchema = z.object({
  status: z.array(JourneyStageSchema).optional(),
  dateFrom: z.string().datetime('Invalid date format').optional(),
  dateTo: z.string().datetime('Invalid date format').optional(),
  truckNumber: z.string().optional(),
  crewMember: z.string().cuid('Invalid user ID').optional(),
});

// ===== ENTRY SCHEMAS =====

export const CreateEntrySchema = z.object({
  journeyId: z.string().cuid('Invalid journey ID'),
  type: EntryTypeSchema,
  data: z.record(z.any()).refine((data) => {
    // Validate data based on entry type
    switch (data.type) {
      case EntryType.PHOTO:
        return data.url && data.caption !== undefined;
      case EntryType.GPS:
        return data.latitude && data.longitude;
      case EntryType.NOTE:
        return data.content && data.content.length > 0;
      case EntryType.SIGNATURE:
        return data.signatureData;
      case EntryType.CONFIRMATION:
        return data.confirmed === true || data.confirmed === false;
      default:
        return true;
    }
  }, 'Invalid data for entry type'),
  tag: TagTypeSchema.optional(),
});

// ===== MEDIA SCHEMAS =====

export const UploadMediaSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB limit
    'File size must be less than 10MB'
  ),
  type: MediaTypeSchema,
  linkedTo: z.string().cuid('Invalid linked entity ID'),
  metadata: z.record(z.any()).optional(),
});

// ===== USER SCHEMAS =====

export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: UserRoleSchema,
  locationId: z.string().cuid('Invalid location ID'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: UserRoleSchema.optional(),
  locationId: z.string().cuid('Invalid location ID').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

// ===== CLIENT & LOCATION SCHEMAS =====

export const CreateClientSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters'),
  industry: z.string().optional(),
  isFranchise: z.boolean().default(false),
  settings: z.record(z.any()).optional(),
});

export const CreateLocationSchema = z.object({
  clientId: z.string().cuid('Invalid client ID'),
  name: z.string().min(2, 'Location name must be at least 2 characters'),
  timezone: z.string().default('America/Toronto'),
  address: z.string().optional(),
});

// ===== AUDIT SCHEMAS =====

export const AuditFiltersSchema = z.object({
  entity: z.string().optional(),
  entityId: z.string().cuid('Invalid entity ID').optional(),
  userId: z.string().cuid('Invalid user ID').optional(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'VIEW']).optional(),
  dateFrom: z.string().datetime('Invalid date format').optional(),
  dateTo: z.string().datetime('Invalid date format').optional(),
});

// ===== PAGINATION SCHEMAS =====

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ===== API RESPONSE SCHEMAS =====

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  ApiResponseSchema(z.array(dataSchema)).extend({
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });

// ===== C&C MODULE SCHEMAS =====

export const CCModuleConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  features: z.array(z.string()),
  pricing: z.object({
    monthly: z.number(),
    yearly: z.number(),
  }).optional(),
});

export const ClientSettingsSchema = z.object({
  clientId: z.string().cuid('Invalid client ID'),
  enabledModules: z.array(z.string()),
  customFields: z.record(z.any()),
  branding: z.object({
    logo: z.string().url('Invalid logo URL').optional(),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
    companyName: z.string().optional(),
  }),
  features: z.object({
    offlineMode: z.boolean(),
    auditTrail: z.boolean(),
    aiFeatures: z.boolean(),
    crmSync: z.boolean(),
  }),
});

// ===== UTILITY SCHEMAS =====

export const IdParamSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
});

export const ClientLocationParamsSchema = z.object({
  clientId: z.string().cuid('Invalid client ID'),
  locationId: z.string().cuid('Invalid location ID'),
});

// ===== EXPORT ALL SCHEMAS =====

export const schemas = {
  // Auth
  login: LoginSchema,
  register: RegisterSchema,
  
  // Journey
  createJourney: CreateJourneySchema,
  updateJourney: UpdateJourneySchema,
  journeyFilters: JourneyFiltersSchema,
  
  // Entry
  createEntry: CreateEntrySchema,
  
  // Media
  uploadMedia: UploadMediaSchema,
  
  // User
  createUser: CreateUserSchema,
  updateUser: UpdateUserSchema,
  
  // Client & Location
  createClient: CreateClientSchema,
  createLocation: CreateLocationSchema,
  
  // Audit
  auditFilters: AuditFiltersSchema,
  
  // Pagination
  pagination: PaginationSchema,
  
  // C&C Modules
  ccModuleConfig: CCModuleConfigSchema,
  clientSettings: ClientSettingsSchema,
  
  // Utilities
  idParam: IdParamSchema,
  clientLocationParams: ClientLocationParamsSchema,
} as const; 