# 05b_Component_Architecture.md

## 🧩 **C&C CRM COMPONENT ARCHITECTURE**

**Last Updated:** January 2025  
**Version:** 2.5.0  
**Status:** ✅ **PRODUCTION READY - Modular Architecture**

---

## 🏗️ **ARCHITECTURE OVERVIEW**

### **Atomic Design Principles**
```
Atoms → Molecules → Organisms → Templates → Pages
```

### **Component Hierarchy**
```
📁 components/
├── 📁 atoms/           # Basic building blocks
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   ├── Badge/
│   └── Icon.tsx
├── 📁 molecules/       # Simple combinations
│   ├── SearchBar/
│   ├── StatusBadge/
│   └── FormField/
├── 📁 organisms/       # Complex components
│   ├── Navigation/
│   ├── JourneyCard/
│   └── DataTable/
└── 📁 templates/       # Page layouts
    ├── DashboardLayout/
    ├── AuthLayout/
    └── JourneyLayout/
```

---

## 🧩 **ATOMIC COMPONENTS**

### **Button Component**
```typescript
// Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

// Usage Examples
<Button>Default Button</Button>
<Button variant="secondary" size="sm">Small Secondary</Button>
<Button variant="danger" loading>Loading</Button>
<Button leftIcon={<Plus />}>Add Item</Button>
```

### **Input Component**
```typescript
// Input.tsx
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

// Usage Examples
<Input placeholder="Enter text" />
<Input type="email" placeholder="Enter email" />
<Input error="This field is required" />
<Input success="Input is valid!" />
```

### **Card Component**
```typescript
// Card.tsx
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated';
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

// CardHeader.tsx
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

// CardTitle.tsx
interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

// CardContent.tsx
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

// Usage Examples
<Card className="hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
```

### **Badge Component**
```typescript
// Badge.tsx
interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  children: ReactNode;
  className?: string;
}

// Journey Status Variants
type JourneyStatusVariant = 'morning-prep' | 'en-route' | 'onsite' | 'completed' | 'audited';

// Usage Examples
<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="morning-prep">🕐 Morning Prep</Badge>
<Badge variant="completed">✅ Completed</Badge>
```

---

## 🧬 **MOLECULAR COMPONENTS**

### **SearchBar Component**
```typescript
// SearchBar.tsx
interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
}

// Implementation
export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  className
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};
```

### **StatusBadge Component**
```typescript
// StatusBadge.tsx
interface StatusBadgeProps {
  status: JourneyStage;
  showIcon?: boolean;
  className?: string;
}

// Implementation
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  className
}) => {
  const getStatusConfig = (status: JourneyStage) => {
    switch (status) {
      case 'MORNING_PREP':
        return { variant: 'warning', text: '🕐 Morning Prep', icon: <Clock /> };
      case 'EN_ROUTE':
        return { variant: 'info', text: '🚛 En Route', icon: <Truck /> };
      case 'ONSITE':
        return { variant: 'secondary', text: '📍 On Site', icon: <MapPin /> };
      case 'COMPLETED':
        return { variant: 'success', text: '✅ Completed', icon: <CheckCircle /> };
      case 'AUDITED':
        return { variant: 'default', text: '🔍 Audited', icon: <Eye /> };
      default:
        return { variant: 'default', text: status, icon: null };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={className}>
      {showIcon && config.icon && <span className="mr-1">{config.icon}</span>}
      {config.text}
    </Badge>
  );
};
```

### **FormField Component**
```typescript
// FormField.tsx
interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

// Implementation
export const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  error,
  helperText,
  required,
  className
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-error">{error}</p>}
      {helperText && !error && <p className="text-xs text-text-secondary">{helperText}</p>}
    </div>
  );
};
```

---

## 🧠 **ORGANISM COMPONENTS**

### **Navigation System**
```typescript
// MainNavigation.tsx
export const MainNavigation: React.FC = () => {
  const { isMobileMenuOpen, toggleMobileMenu } = useMenuStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <DesktopMenu />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} />
    </>
  );
};

// DesktopMenu.tsx
export const DesktopMenu: React.FC = () => {
  const { isCollapsed, toggleCollapse } = useMenuStore();
  const menuItems = useMenuItems();

  return (
    <nav className={`desktop-menu ${isCollapsed ? 'collapsed' : ''}`}>
      <MenuHeader onToggle={toggleCollapse} />
      <MenuItems items={menuItems} />
    </nav>
  );
};

// MobileMenu.tsx
export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const menuItems = useMenuItems();

  return (
    <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
      <MobileHeader onClose={onClose} />
      <MenuItems items={menuItems} variant="mobile" />
      <QuickActions />
    </div>
  );
};
```

### **JourneyCard Component**
```typescript
// JourneyCard.tsx
interface JourneyCardProps {
  journey: TruckJourney;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

// Implementation
export const JourneyCard: React.FC<JourneyCardProps> = ({
  journey,
  onView,
  onEdit,
  onDelete,
  className
}) => {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold tracking-tight">
                {journey.truckNumber || 'Unassigned Truck'}
              </h3>
              <StatusBadge status={journey.status} />
            </div>
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(journey.date)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {onView && (
              <Button variant="ghost" size="sm" onClick={() => onView(journey.id)}>
                <Eye className="w-4 h-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(journey.id)}>
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(journey.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <JourneyCardContent journey={journey} />
      </CardContent>
    </Card>
  );
};
```

### **DataTable Component**
```typescript
// DataTable.tsx
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

// Implementation
export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data found",
  onRowClick,
  className
}: DataTableProps<T>) => {
  if (loading) {
    return <DataTableSkeleton columns={columns} />;
  }

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            {columns.map((column) => (
              <th key={column.key} className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className="border-b border-gray-700 hover:bg-surface/50 transition-colors cursor-pointer"
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td key={column.key} className="py-3 px-4">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## 🎯 **MODULAR JOURNEY COMPONENTS**

### **Journey Detail Components**
```typescript
// JourneyDetail/index.ts
export { JourneyOverview } from './JourneyOverview';
export { JourneyTimeline } from './JourneyTimeline';
export { JourneyCrew } from './JourneyCrew';
export { JourneyMedia } from './JourneyMedia';
export { JourneyChat } from './JourneyChat';

// JourneyOverview.tsx
export const JourneyOverview: React.FC<JourneyOverviewProps> = ({
  journey,
  journeyId,
  isTracking,
  onTrackingToggle
}) => {
  return (
    <div className="space-y-6">
      <JourneyHeader journey={journey} />
      <JourneyStats journey={journey} />
      <JourneyActions 
        isTracking={isTracking}
        onTrackingToggle={onTrackingToggle}
      />
    </div>
  );
};

// JourneyTimeline.tsx
export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ journeyId }) => {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  return (
    <div className="space-y-4">
      {timelineEvents.map((event, index) => (
        <TimelineEvent key={index} event={event} />
      ))}
    </div>
  );
};
```

### **Journey Creation Components**
```typescript
// JourneyCreation/index.ts
export { BasicInfoStep } from './BasicInfoStep';
export { ScheduleStep } from './ScheduleStep';
export { CrewStep } from './CrewStep';
export { ReviewStep } from './ReviewStep';

// BasicInfoStep.tsx
export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  onUpdate,
  errors
}) => {
  return (
    <div className="space-y-6">
      <FormField label="Truck Number" required error={errors?.truckNumber}>
        <Input
          value={formData.truckNumber}
          onChange={(e) => onUpdate('truckNumber', e.target.value)}
          placeholder="Enter truck number"
        />
      </FormField>
      <FormField label="Location" required error={errors?.location}>
        <Input
          value={formData.location}
          onChange={(e) => onUpdate('location', e.target.value)}
          placeholder="Enter location"
        />
      </FormField>
      <FormField label="Notes" helperText="Optional additional information">
        <textarea
          value={formData.notes}
          onChange={(e) => onUpdate('notes', e.target.value)}
          placeholder="Enter notes..."
          className="w-full p-3 bg-surface border border-gray-600 rounded-lg"
          rows={3}
        />
      </FormField>
    </div>
  );
};
```

---

## 🔄 **STATE MANAGEMENT**

### **Zustand Store Structure**
```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  permissions: Permission[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginForm) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
}

// stores/journeyStore.ts
interface JourneyState {
  journeys: TruckJourney[];
  currentJourney: TruckJourney | null;
  filters: JourneyFilters;
  pagination: PaginationState;
  offlineQueue: OfflineQueueItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchJourneys: (filters?: JourneyFilters) => Promise<void>;
  updateJourney: (id: string, updates: Partial<TruckJourney>) => Promise<void>;
  createJourney: (journey: CreateJourneyForm) => Promise<void>;
  deleteJourney: (id: string) => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
  setFilters: (filters: JourneyFilters) => void;
  clearError: () => void;
}

// stores/menuStore.ts
interface MenuState {
  isCollapsed: boolean;
  isMobileMenuOpen: boolean;
  activeMenuItem: string | null;
  
  // Actions
  toggleCollapse: () => void;
  toggleMobileMenu: () => void;
  setActiveMenuItem: (item: string) => void;
}
```

### **Store Implementation**
```typescript
// stores/authStore.ts
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  permissions: [],
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      // API call implementation
      const response = await loginAPI(credentials);
      set({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        permissions: response.permissions,
        isLoading: false
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      permissions: []
    });
  },

  // ... other actions
}));
```

---

## 🎨 **COMPONENT PATTERNS**

### **Compound Component Pattern**
```typescript
// Card Compound Component
const Card = ({ children, ...props }: CardProps) => (
  <div className="bg-surface rounded-lg border border-gray-700" {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

// Usage
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>Content</Card.Content>
</Card>
```

### **Render Props Pattern**
```typescript
// DataProvider Component
interface DataProviderProps<T> {
  data: T[];
  loading?: boolean;
  error?: string;
  children: (props: DataProviderRenderProps<T>) => ReactNode;
}

interface DataProviderRenderProps<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
}

export const DataProvider = <T extends any>({
  data,
  loading = false,
  error = null,
  children
}: DataProviderProps<T>) => {
  const renderProps: DataProviderRenderProps<T> = {
    data,
    loading,
    error,
    isEmpty: data.length === 0
  };

  return <>{children(renderProps)}</>;
};

// Usage
<DataProvider data={journeys} loading={isLoading} error={error}>
  {({ data, loading, error, isEmpty }) => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;
    if (isEmpty) return <EmptyState />;
    return <JourneyList journeys={data} />;
  }}
</DataProvider>
```

### **Higher-Order Component Pattern**
```typescript
// withLoading HOC
interface WithLoadingProps {
  loading?: boolean;
}

export const withLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P & WithLoadingProps) => {
    const { loading, ...componentProps } = props;
    
    if (loading) {
      return <LoadingSpinner />;
    }
    
    return <Component {...(componentProps as P)} />;
  };
};

// Usage
const JourneyListWithLoading = withLoading(JourneyList);
<JourneyListWithLoading journeys={journeys} loading={isLoading} />
```

---

## 🧪 **TESTING STRATEGY**

### **Component Testing**
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### **Integration Testing**
```typescript
// JourneyCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { JourneyCard } from './JourneyCard';

describe('JourneyCard Component', () => {
  const mockJourney = {
    id: '1',
    truckNumber: 'Truck-001',
    status: 'MORNING_PREP',
    date: '2025-01-15'
  };

  it('renders journey information', () => {
    render(<JourneyCard journey={mockJourney} />);
    expect(screen.getByText('Truck-001')).toBeInTheDocument();
    expect(screen.getByText('🕐 Morning Prep')).toBeInTheDocument();
  });

  it('calls onView when view button is clicked', () => {
    const onView = jest.fn();
    render(<JourneyCard journey={mockJourney} onView={onView} />);
    fireEvent.click(screen.getByLabelText('View Journey'));
    expect(onView).toHaveBeenCalledWith('1');
  });
});
```

---

## 📋 **BEST PRACTICES**

### **Component Design**
- ✅ **Single Responsibility**: Each component has one clear purpose
- ✅ **Props Interface**: Define clear TypeScript interfaces for props
- ✅ **Default Props**: Provide sensible defaults where appropriate
- ✅ **Error Boundaries**: Wrap components in error boundaries
- ✅ **Loading States**: Always handle loading states gracefully
- ✅ **Accessibility**: Include proper ARIA labels and keyboard support

### **Performance Optimization**
- ✅ **React.memo**: Memoize components that don't need frequent re-renders
- ✅ **useCallback**: Memoize event handlers passed to child components
- ✅ **useMemo**: Memoize expensive calculations
- ✅ **Lazy Loading**: Use React.lazy for code splitting
- ✅ **Virtual Scrolling**: For large lists, use virtual scrolling

### **Code Organization**
- ✅ **File Structure**: Follow consistent file naming and organization
- ✅ **Index Files**: Use index files for clean imports
- ✅ **Type Definitions**: Keep types close to components
- ✅ **Constants**: Extract magic strings and numbers to constants
- ✅ **Documentation**: Include JSDoc comments for complex components

---

**🧩 This component architecture provides a scalable, maintainable, and testable foundation for building complex user interfaces in the C&C CRM application.** 