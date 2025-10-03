# Client Onboarding Portal

## Overview

This is a comprehensive client onboarding portal for a web design agency that streamlines the project initiation process through a guided questionnaire system. The application serves both client-facing onboarding workflows and admin project management functionality.

The portal transforms the traditional creative brief process into an interactive, multi-step wizard that captures business requirements, branding preferences, site structure, content needs, and design direction. It generates a complete creative brief document and provides project management capabilities for tracking multiple client engagements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and maintainable code
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React hooks for local state, TanStack Query for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Design System**: Material Design approach with professional color palette and Inter typography
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture  
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Structure**: RESTful endpoints with JSON request/response format
- **Error Handling**: Centralized error middleware with structured error responses
- **Development**: Hot module replacement via Vite integration for seamless development experience

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema**: User management system with extensible project data structure
- **Migrations**: Drizzle Kit for database schema versioning and deployment

### Authentication and Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions
- **User Roles**: Multi-tier access control (guest, client, admin) for different interface experiences
- **Security**: Express session middleware with secure cookie configuration

### Component Architecture
- **Wizard System**: Multi-step onboarding process with progress tracking and validation
- **Form Management**: React Hook Form with Zod validation for robust form handling  
- **File Handling**: Drag-and-drop file upload components with type validation and size limits
- **Design Patterns**: Compound components for complex UI elements like dashboards and review interfaces
- **Responsive Design**: Mobile-first approach with Tailwind responsive utilities

## External Dependencies

### Third-Party Services
- **AI Integration**: OpenAI API (GPT-5) for intelligent business name generation and content assistance
- **Database Hosting**: Neon serverless PostgreSQL for scalable data storage
- **Font Service**: Google Fonts (Inter family) for consistent typography

### Development Tools  
- **UI Components**: Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **Build Pipeline**: Vite with React plugin and TypeScript support
- **Code Quality**: ESLint and TypeScript compiler for code validation
- **Environment**: Replit-specific plugins for development environment integration

### Runtime Dependencies
- **HTTP Client**: Native fetch API with custom query client abstraction
- **Date Handling**: date-fns for date manipulation and formatting
- **Validation**: Zod schemas for runtime type validation
- **Icons**: Lucide React for consistent iconography
- **Utilities**: clsx and tailwind-merge for conditional styling

## Deployment Configuration

### Render.com Deployment
The application is configured for deployment on Render with the following setup:

- **Configuration File**: `render.yaml` defines web service and database
- **Health Check**: `/api/health` endpoint for service monitoring
- **Database**: Supports both Neon serverless and standard PostgreSQL with SSL
- **Environment Detection**: Automatically binds to `0.0.0.0` in production environments
- **Node Version**: Specified in `.node-version` (Node.js 18)

**Required Environment Variables for Render:**
- `DATABASE_URL`: PostgreSQL connection string (auto-configured from database)
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `NODE_ENV`: Set to `production`

### Local Development
- **Mac Setup**: Documented in `SETUP_MAC.md` with PostgreSQL configuration
- **Environment Variables**: Loaded via dotenv from `.env` file
- **Host Configuration**: Automatically uses `localhost` for local development