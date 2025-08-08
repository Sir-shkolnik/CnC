# 05a_Design_System.md

## 🎨 **C&C CRM DESIGN SYSTEM**

**Last Updated:** January 2025  
**Version:** 2.5.0  
**Status:** ✅ **PRODUCTION READY - Complete Implementation**

---

## 🎨 **COLOR PALETTE**

### **Primary Colors**
```css
/* Background Colors */
background: #121212    /* Dark background */
surface: #1E1E1E       /* Card surfaces */
surface-light: #2A2A2A /* Hover states */

/* Brand Colors */
primary: #00C2FF       /* Bright cyan blue */
secondary: #19FFA5     /* Bright green */
accent: #FF6B35        /* Orange accent */

/* Text Colors */
text-primary: #EAEAEA  /* Main text */
text-secondary: #B0B0B0 /* Secondary text */
text-muted: #808080    /* Muted text */
```

### **Status Colors**
```css
/* Status Indicators */
success: #4CAF50       /* Green - Completed, Success */
warning: #FF9800       /* Orange - Warning, Pending */
error: #F44336         /* Red - Error, Failed */
info: #2196F3          /* Blue - Info, In Progress */

/* Journey Status Colors */
morning-prep: #FF9800  /* Morning Prep */
en-route: #2196F3      /* En Route */
onsite: #19FFA5        /* On Site */
completed: #4CAF50     /* Completed */
audited: #9C27B0       /* Audited */
```

### **Gradient Colors**
```css
/* Text Gradients */
.text-gradient {
  background: linear-gradient(135deg, #00C2FF 0%, #19FFA5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Button Gradients */
.btn-gradient {
  background: linear-gradient(135deg, #00C2FF 0%, #19FFA5 100%);
}
```

---

## 📝 **TYPOGRAPHY**

### **Font Family**
```css
/* Google Fonts - Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### **Type Scale**
```css
/* Heading Sizes */
h1: 2.5rem (40px) - Page titles, hero text
h2: 2rem (32px) - Section headers
h3: 1.5rem (24px) - Subsection headers
h4: 1.25rem (20px) - Card titles
h5: 1.125rem (18px) - Small headers
h6: 1rem (16px) - Micro headers

/* Body Text */
body: 1rem (16px) - Main content
small: 0.875rem (14px) - Secondary text
xs: 0.75rem (12px) - Captions, labels
```

### **Font Weights**
```css
font-light: 300    /* Light text */
font-normal: 400   /* Regular text */
font-medium: 500   /* Medium emphasis */
font-semibold: 600 /* Semi-bold headers */
font-bold: 700     /* Bold titles */
font-extrabold: 800 /* Extra bold hero text */
```

### **Line Heights**
```css
leading-tight: 1.25    /* Headers */
leading-normal: 1.5    /* Body text */
leading-relaxed: 1.75  /* Long content */
```

---

## 🧩 **COMPONENT LIBRARY**

### **Button Component**
```typescript
// Variants
variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning'

// Sizes
size: 'sm' | 'md' | 'lg'

// States
loading: boolean
disabled: boolean
leftIcon?: ReactNode
rightIcon?: ReactNode
```

**Examples:**
```tsx
<Button>Default Button</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button loading>Loading</Button>
<Button leftIcon={<Plus />}>With Icon</Button>
```

### **Input Component**
```typescript
// Types
type: 'text' | 'email' | 'password' | 'tel' | 'number'

// States
error?: string
success?: string
disabled?: boolean
required?: boolean
```

**Examples:**
```tsx
<Input placeholder="Default input" />
<Input type="email" placeholder="Enter email" />
<Input error="This field is required" />
<Input success="Input is valid!" />
```

### **Card Component**
```typescript
// Variants
variant: 'default' | 'outlined' | 'elevated'

// Sections
CardHeader: Title and actions
CardContent: Main content
CardFooter: Actions and metadata
```

**Examples:**
```tsx
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
// Variants
variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

// Journey Status Variants
variant: 'morning-prep' | 'en-route' | 'onsite' | 'completed' | 'audited'
```

**Examples:**
```tsx
<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="morning-prep">🕐 Morning Prep</Badge>
<Badge variant="completed">✅ Completed</Badge>
```

---

## 📐 **SPACING SYSTEM**

### **Container Spacing**
```css
/* Page Containers */
p-4 sm:p-6 lg:p-8    /* Responsive padding */
max-w-7xl mx-auto     /* Max width with centering */

/* Section Spacing */
space-y-6             /* Vertical spacing between sections */
space-y-4             /* Vertical spacing between elements */
space-y-2             /* Tight vertical spacing */
```

### **Grid Spacing**
```css
/* Responsive Grids */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  /* 1-2-3 column layout */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  /* 1-2-4 column layout */
gap-4                 /* Standard grid gap */
gap-6                 /* Larger grid gap */
gap-8                 /* Extra large grid gap */
```

### **Component Spacing**
```css
/* Card Padding */
p-4                   /* Standard card padding */
p-6                   /* Larger card padding */
p-8                   /* Extra large card padding */

/* Button Spacing */
px-4 py-2             /* Standard button padding */
px-6 py-3             /* Larger button padding */
px-8 py-4             /* Extra large button padding */
```

---

## 📱 **RESPONSIVE BREAKPOINTS**

### **Mobile-First Approach**
```css
/* Breakpoints */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### **Responsive Patterns**
```css
/* Typography */
text-2xl sm:text-3xl lg:text-4xl    /* Responsive headings */
text-sm sm:text-base lg:text-lg     /* Responsive body text */

/* Layout */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  /* Responsive grids */
flex-col sm:flex-row                        /* Stack to row */
p-4 sm:p-6 lg:p-8                          /* Responsive padding */
```

---

## 🎯 **VISUAL HIERARCHY**

### **Component Sizing**
```css
/* Icons */
w-4 h-4     /* Small icons */
w-5 h-5     /* Medium icons */
w-6 h-6     /* Large icons */
w-8 h-8     /* Extra large icons */

/* Cards */
rounded-lg   /* Standard border radius */
rounded-xl   /* Larger border radius */
rounded-2xl  /* Extra large border radius */
```

### **Shadows & Elevation**
```css
/* Shadow System */
shadow-sm    /* Subtle shadow */
shadow       /* Standard shadow */
shadow-lg    /* Large shadow */
shadow-xl    /* Extra large shadow */

/* Hover Effects */
hover:shadow-lg transition-shadow  /* Card hover */
hover:bg-surface/80 transition-colors  /* Button hover */
```

---

## ♿ **ACCESSIBILITY**

### **Color Contrast**
- **Text on Background**: 4.5:1 minimum ratio
- **Large Text**: 3:1 minimum ratio
- **Interactive Elements**: 3:1 minimum ratio

### **Focus States**
```css
/* Focus Indicators */
focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-background
```

### **Screen Reader Support**
```tsx
// ARIA Labels
aria-label="Search journeys"
aria-describedby="search-help"
aria-expanded={isExpanded}
aria-selected={isSelected}
```

---

## 🎨 **DESIGN TOKENS**

### **CSS Custom Properties**
```css
:root {
  /* Colors */
  --color-background: #121212;
  --color-surface: #1E1E1E;
  --color-primary: #00C2FF;
  --color-secondary: #19FFA5;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
}
```

---

## 📋 **USAGE GUIDELINES**

### **Do's**
- ✅ Use consistent spacing throughout the application
- ✅ Follow the mobile-first responsive approach
- ✅ Maintain proper color contrast for accessibility
- ✅ Use semantic HTML elements
- ✅ Include proper focus states for interactive elements
- ✅ Test components across different screen sizes

### **Don'ts**
- ❌ Don't use hardcoded colors outside the design system
- ❌ Don't skip responsive breakpoints
- ❌ Don't ignore accessibility requirements
- ❌ Don't use inconsistent spacing
- ❌ Don't forget to test with screen readers

---

## 🧪 **TESTING CHECKLIST**

### **Visual Testing**
- [ ] Components render correctly on all screen sizes
- [ ] Colors meet accessibility contrast requirements
- [ ] Typography scales properly across devices
- [ ] Spacing is consistent throughout the application
- [ ] Hover and focus states work correctly

### **Accessibility Testing**
- [ ] All interactive elements are keyboard accessible
- [ ] Screen readers can navigate the interface
- [ ] Focus indicators are visible and clear
- [ ] Color is not the only way to convey information
- [ ] Text can be resized up to 200% without loss of functionality

---

**🎨 This design system provides a solid foundation for building consistent, accessible, and responsive user interfaces across the C&C CRM application.** 