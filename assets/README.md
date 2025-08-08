# 🎨 **Assets Directory**

This directory contains all visual assets, media files, and branding materials for the C&C CRM system.

## 📁 **Directory Structure**

### **🏢 `clients/` - Client-Specific Assets**
```
clients/
├── logos/          # Client company logos
├── images/         # Client-specific images
└── branding/       # Client branding materials
```

**Usage:** Store assets specific to individual clients (LGM, etc.)

### **⚙️ `system/` - System-Wide Assets**
```
system/
├── logos/          # C&C CRM system logos
├── icons/          # System icons and UI elements
└── backgrounds/    # System backgrounds and patterns
```

**Usage:** Store assets used across the entire system

### **📸 `images/` - General Images**
**Usage:** General images, photos, and visual content

### **🎨 `graphics/` - Graphics and Design Elements**
**Usage:** Charts, diagrams, infographics, and design elements

### **🔧 `icons/` - Icon Sets**
**Usage:** Icon collections and icon sets

### **📄 `documents/` - Document Assets**
**Usage:** PDFs, documents, and file assets

### **🎬 `media/` - Media Files**
**Usage:** Videos, audio files, and multimedia content

### **📁 `temp/` - Temporary Assets**
**Usage:** Temporary files and work-in-progress assets

## 🚀 **Asset Guidelines**

### **📏 File Size Limits**
- **Logos:** Max 2MB (PNG/SVG preferred)
- **Images:** Max 5MB (JPG/PNG)
- **Icons:** Max 500KB (SVG preferred)
- **Media:** Max 50MB (MP4/MP3)

### **🎯 File Formats**
- **Logos:** PNG, SVG, JPG
- **Images:** JPG, PNG, WebP
- **Icons:** SVG, PNG
- **Graphics:** SVG, PNG, PDF
- **Media:** MP4, MP3, WebM

### **📐 Image Dimensions**
- **Logos:** 200x200px to 500x500px
- **Icons:** 16x16px to 64x64px
- **Backgrounds:** 1920x1080px or larger
- **Thumbnails:** 150x150px

## 🏢 **Client Assets Structure**

### **Client Logo Requirements**
```
clients/[client_name]/logos/
├── logo_primary.png      # Primary logo (500x500px)
├── logo_secondary.png    # Secondary logo (300x300px)
├── logo_icon.png         # Icon version (64x64px)
├── logo_dark.png         # Dark theme version
├── logo_light.png        # Light theme version
└── logo_favicon.ico      # Favicon (32x32px)
```

### **Client Branding Requirements**
```
clients/[client_name]/branding/
├── colors.json           # Brand color palette
├── fonts.json            # Brand font specifications
├── styleguide.pdf        # Brand style guide
└── assets.zip            # Complete brand assets
```

### **Client Image Requirements**
```
clients/[client_name]/images/
├── hero_banner.jpg       # Hero banner image
├── team_photos/          # Team member photos
├── office_photos/        # Office location photos
├── service_photos/       # Service-related photos
└── testimonial_photos/   # Customer testimonial photos
```

## ⚙️ **System Assets Structure**

### **System Logo Requirements**
```
system/logos/
├── cnc_logo_primary.png      # Primary C&C CRM logo
├── cnc_logo_secondary.png    # Secondary logo
├── cnc_logo_icon.png         # Icon version
├── cnc_logo_dark.png         # Dark theme version
├── cnc_logo_light.png        # Light theme version
└── cnc_favicon.ico           # System favicon
```

### **System Icon Requirements**
```
system/icons/
├── navigation/           # Navigation icons
├── actions/             # Action button icons
├── status/              # Status indicator icons
├── categories/          # Category icons
└── ui/                  # UI element icons
```

## 🎨 **Brand Color Palette**

### **Primary Colors**
- **Primary Blue:** `#00C2FF`
- **Primary Green:** `#19FFA5`
- **Dark Background:** `#121212`

### **Secondary Colors**
- **Success Green:** `#10B981`
- **Warning Orange:** `#F59E0B`
- **Error Red:** `#EF4444`
- **Info Blue:** `#3B82F6`

### **Neutral Colors**
- **White:** `#FFFFFF`
- **Light Gray:** `#F3F4F6`
- **Gray:** `#9CA3AF`
- **Dark Gray:** `#374151`

## 📱 **Responsive Image Guidelines**

### **Mobile-First Approach**
- **Mobile:** 375px width
- **Tablet:** 768px width
- **Desktop:** 1024px+ width

### **Image Optimization**
- **WebP format** for modern browsers
- **JPG fallback** for older browsers
- **Responsive images** with srcset
- **Lazy loading** for performance

## 🔧 **Asset Management**

### **Naming Conventions**
- **Lowercase with underscores:** `client_logo_primary.png`
- **Descriptive names:** `hero_banner_moving_services.jpg`
- **Version control:** `logo_v2_primary.png`

### **Organization Rules**
- **Client-specific:** Place in `clients/[client_name]/`
- **System-wide:** Place in `system/`
- **Temporary:** Place in `temp/`
- **Archived:** Move to `archive/` subfolder

### **Quality Standards**
- **High resolution** for logos and graphics
- **Optimized file sizes** for web performance
- **Consistent branding** across all assets
- **Accessibility compliant** (alt text, contrast)

## 🚀 **Render.com Integration**

### **Static Asset Serving**
- **Public assets:** Serve from `/assets/` directory
- **CDN integration:** Use Render's CDN for global delivery
- **Caching:** Implement proper cache headers
- **Compression:** Enable gzip compression

### **Asset URLs**
```
https://your-app.onrender.com/assets/clients/lgm/logos/logo_primary.png
https://your-app.onrender.com/assets/system/logos/cnc_logo_primary.png
https://your-app.onrender.com/assets/images/hero_banner.jpg
```

### **Performance Optimization**
- **Image optimization** with WebP format
- **Lazy loading** for better performance
- **Responsive images** with srcset
- **CDN caching** for faster delivery

## 📋 **Asset Checklist**

### **Before Adding Assets**
- [ ] **File size** within limits
- [ ] **File format** appropriate
- [ ] **Naming convention** followed
- [ ] **Quality standards** met
- [ ] **Organization** in correct folder
- [ ] **Optimization** completed

### **After Adding Assets**
- [ ] **Test loading** in application
- [ ] **Verify responsive** behavior
- [ ] **Check accessibility** compliance
- [ ] **Update documentation** if needed
- [ ] **Backup assets** to secure location

---

**© 2025 Sagi Ehud Shkolnik - AliceSolutions Inc. All Rights Reserved.**
