# Product Showcase E-Commerce Platform

## Overview

A bilingual (Arabic/English) e-commerce product showcase platform designed for displaying products with rich media, category organization, and promotional banners. The platform features RTL/LTR language switching with dual-language content stored in database fields, an admin panel for content management with side-by-side Arabic/English inputs, and a product-first design approach prioritizing visual presentation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming (light/dark mode support)
- **Fonts**: Cairo (Arabic) and Inter (Latin) font families for bilingual support

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **API Pattern**: RESTful JSON API with endpoints under `/api/*`
- **File Uploads**: Multer middleware handles image/video uploads (50MB limit), stored in `/uploads` directory
- **Authentication**: Session-based admin authentication using express-session with memorystore
- **Development**: tsx for TypeScript execution, Vite middleware for HMR in development
- **Production Build**: esbuild bundles server code, Vite builds client assets

### Admin Panel
- **Access URL**: `/admin-login-x7k9m2` (login page) and `/control-panel-x7k9m2` (panel)
- **Security**: Password-protected via ADMIN_PASSWORD environment variable, session-based authentication
- **Protected Endpoints**: All admin API endpoints (POST/PATCH/DELETE) require authenticated session
- **No Public Links**: Admin panel is hidden from customers - no links visible on public site

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` defines all database tables
- **Validation**: Zod schemas generated from Drizzle schemas using drizzle-zod
- **Storage Abstraction**: `server/storage.ts` provides an interface for data operations with in-memory fallback

### Core Data Models
- **Products**: Bilingual name (nameAr/nameEn), description (descriptionAr/descriptionEn), category, images/video, features array (featuresAr/featuresEn)
- **Categories**: Bilingual names (nameAr/nameEn) for hierarchical product organization
- **Banners**: Promotional carousels with clickable links
- **Payment Methods**: Displayed in sidebar with images
- **Telegram Channels**: Social links displayed in sidebar
- **Site Settings**: Key-value configuration store

### Internationalization
- **Default Language**: Arabic (RTL)
- **Translation Strategy**: Content stored in both Arabic and English fields (e.g., nameAr/nameEn); language context selects appropriate field
- **Admin Panel**: Side-by-side input fields for Arabic and English content
- **Language Context**: React context manages language state, persists preference to localStorage
- **Text Direction**: Dynamic `dir` attribute switching between RTL and LTR

### Theming
- **Mode Support**: Light and dark themes via CSS class toggle
- **Persistence**: Theme preference stored in localStorage
- **System Detection**: Falls back to OS color scheme preference

### Key Design Patterns
- **Product-First Layout**: Products displayed immediately on homepage, no hero section
- **Sidebar Design**: Fixed left sidebar (desktop) with payment methods and Telegram channels; bottom sheet on mobile
- **Responsive Grid**: 4 columns desktop, 2 tablet, 1 mobile for product listings

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle Kit**: Database migrations and schema push (`npm run db:push`)

### Frontend Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tabs, etc.)
- **Embla Carousel**: Banner carousel functionality
- **Lucide React**: Icon library
- **React Icons**: Additional icons (Telegram, WhatsApp social icons)
- **react-day-picker**: Calendar/date picker component
- **Vaul**: Drawer component for mobile sheets

### Build Tools
- **Vite**: Frontend bundler with React plugin
- **esbuild**: Server bundling for production
- **Tailwind CSS**: Utility-first CSS with PostCSS/Autoprefixer

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator