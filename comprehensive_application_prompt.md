# Client Onboarding Portal - Complete Application Prompt

Build a comprehensive Client Onboarding Portal for a web design & development agency featuring a multi-step wizard that guides new clients through creating a complete creative brief for their website projects.

## Core Features & Architecture

### Tech Stack Requirements
- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **File Handling**: File uploads with 10MB payload limits
- **AI Integration**: OpenAI API for logo generation and content creation
- **PDF Generation**: jsPDF for creative brief exports
- **Routing**: Wouter for client-side routing
- **State Management**: React Query for API state management

### Database Schema (shared/schema.ts)
Create comprehensive schemas for:

```typescript
// Business Information
businessInfo: {
  businessName: string
  businessDescription: string
  industry: string
  targetAudience: string
  keyServices: string[]
  competitorAnalysis: string
}

// Logo Management
logoDecision: 'have-logo' | 'need-logo' | 'generate-logo'
logoFile: File (optional)
selectedLogo: string (optional - for AI generated)

// Website Structure
siteType: 'business' | 'ecommerce' | 'portfolio' | 'blog' | 'nonprofit'
pages: Array<{ name: string, path: string, description: string }>

// Design Preferences
designPreferences: {
  selectedStyle: 'modern' | 'luxury' | 'playful' | 'corporate' | 'minimalist'
  colorTheme: 'blue-professional' | 'green-nature' | 'purple-creative' | 'orange-energetic' | 'grey-minimal' | 'red-bold'
  inspirationLinks: string[]
  additionalNotes: string
}

// Image Requirements
imageRequirements: {
  logoNeeds: 'need-logo' | 'have-logo' | 'generate-logo'
  stockPhotos: Array<{ category: string, description: string, quantity: number }>
  customPhotography: boolean
  existingAssets: File[]
}

// Generated Content
pageContent: Record<string, { title: string, content: string }>
```

## Step-by-Step Wizard Implementation

### Step 1: Welcome & Introduction
- Welcome message explaining the onboarding process
- Overview of what will be collected
- Estimated time to complete

### Step 2: Business Information Collection
- Business name (required)
- Business description textarea
- Industry dropdown selection
- Target audience description
- Key services/products (dynamic array input)
- Competitor analysis textarea

### Step 3: Logo Decision & Management
Three-option radio selection:
- **"I have a logo"** → File upload component
- **"I need a logo designed"** → Note for design team
- **"Generate logo with AI"** → AI logo generation interface

#### AI Logo Generation Features:
- Text prompt input for logo description
- Generate 4 logo variations using OpenAI DALL-E
- Grid display of generated options
- Click to select preferred logo
- Download/save selected logo

### Step 4: Website Type Selection
Radio button selection with descriptions:
- **Business Website** - Professional corporate presence
- **E-commerce Store** - Online retail platform
- **Portfolio Site** - Showcase work/services
- **Blog/Content Site** - Content-focused platform
- **Nonprofit Organization** - Charity/cause-driven site

### Step 5: Sitemap Generation & Page Planning
- Display default pages based on selected website type
- Dynamic page management:
  - Add custom pages
  - Edit page names and descriptions
  - Remove unnecessary pages
  - Reorder page hierarchy
- Each page includes: name, URL path, purpose description

### Step 6: AI-Powered Content Generation
- Generate content for each defined page using OpenAI
- Show loading states during generation
- Display generated content in expandable cards
- Allow content editing and customization
- Regenerate individual page content if needed

### Step 7: Image & Media Requirements
Multi-section form:
- **Logo status confirmation**
- **Stock photography needs**:
  - Category selection (business, lifestyle, technology, etc.)
  - Quantity requirements per category
  - Specific description requests
- **Custom photography requirements**
- **Existing asset uploads**

### Step 8: Design Preferences & Color Themes
Two-part selection:

#### Design Style Selection:
- Modern & Clean
- Luxury & Elegant  
- Playful & Creative
- Corporate & Professional
- Minimalist & Simple

#### Color Theme Selection (6 Professional Themes):
Visual cards showing color swatches for:
- **Professional Blue** - Primary: #3B82F6, Secondary: #1E40AF, Accent: #60A5FA
- **Natural Green** - Primary: #10B981, Secondary: #059669, Accent: #34D399
- **Creative Purple** - Primary: #8B5CF6, Secondary: #7C3AED, Accent: #A78BFA
- **Energetic Orange** - Primary: #F97316, Secondary: #EA580C, Accent: #FB923C
- **Minimal Grey** - Primary: #6B7280, Secondary: #4B5563, Accent: #9CA3AF
- **Bold Red** - Primary: #EF4444, Secondary: #DC2626, Accent: #F87171

Each theme card displays:
- Theme name and description
- Visual color palette preview
- Click to select with visual feedback

### Step 9: Creative Brief Review
Comprehensive review page displaying:
- **Business Overview** - Name, description, industry
- **Logo Section** - Display uploaded/generated logo
- **Website Structure** - Site type and page list
- **Generated Content** - Expandable sections for each page
- **Design Direction** - Selected style and color theme with swatches
- **Image Requirements** - Summary of photography needs
- **Color Palette** - Visual display of selected theme colors

### Step 10: PDF Export & Submission
- Generate comprehensive PDF creative brief including:
  - All collected business information
  - Embedded logo (if available)
  - Complete page content
  - Design preferences and color swatches
  - Image requirements summary
- Download PDF functionality
- Submit project for review
- Confirmation screen with next steps

## Key Technical Features

### File Upload System
- Support for image files (PNG, JPG, SVG)
- 10MB file size limit
- Progress indicators
- Error handling and validation
- Secure file storage

### AI Integration
- **Logo Generation**: OpenAI DALL-E API integration
- **Content Creation**: GPT-4 for page content generation
- Proper API key management
- Rate limiting and error handling
- Loading states and user feedback

### Color Intelligence System
- **Theme Priority**: Selected color themes override text-based extraction
- **Smart Color Extraction**: Parse color keywords from design notes
- **Comprehensive Color Support**: Recognize variations (grey/gray, navy/dark blue)
- **Color Mapping**: Consistent color application throughout the system

### PDF Generation
- **Complete Creative Brief**: All collected information in professional format
- **Embedded Assets**: Include logos and color swatches
- **Proper Formatting**: Clean, readable layout with sections
- **Async File Handling**: Proper base64 encoding for embedded images

### State Management
- **Multi-Step Navigation**: Forward/backward navigation with validation
- **Data Persistence**: Maintain state across steps
- **Form Validation**: Comprehensive validation for each step
- **Progress Tracking**: Visual progress indicator

## UI/UX Requirements

### Design System
- **Component Library**: Use shadcn/ui components consistently
- **Color Theming**: Support for light/dark mode
- **Responsive Design**: Mobile-first approach
- **Interactive Elements**: Hover states, loading indicators, transitions
- **Visual Feedback**: Toast notifications, success states, error messages

### Navigation
- **Step Indicator**: Progress bar showing current step
- **Navigation Controls**: Previous/Next buttons with proper validation
- **Sidebar Navigation**: Optional quick navigation between completed steps

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG compliant color combinations

## Advanced Features

### Error Handling
- **Network Errors**: Graceful handling of API failures
- **Validation Errors**: Clear field-level error messages
- **File Upload Errors**: Size limits, format validation
- **AI Generation Failures**: Retry mechanisms and fallbacks

### Performance Optimization
- **Lazy Loading**: Load steps and content as needed
- **Image Optimization**: Compress and resize uploaded images
- **API Efficiency**: Batch requests where possible
- **Caching**: Cache generated content and user inputs

### Development Environment
- **Local Development**: Support for both Replit and local environments
- **Hot Reloading**: Vite setup for rapid development
- **TypeScript**: Full type safety throughout the application
- **Code Organization**: Modular component structure

## Success Criteria

The completed application should:
1. **Guide users through a complete 10-step onboarding process**
2. **Collect comprehensive business and project information**
3. **Generate professional logos using AI when requested**
4. **Create intelligent sitemaps based on business type**
5. **Generate relevant content for all pages using AI**
6. **Provide professional color theme selection with visual previews**
7. **Export a complete, professional PDF creative brief**
8. **Handle file uploads securely with proper validation**
9. **Provide excellent user experience with proper loading states**
10. **Work seamlessly in both development and production environments**

## Implementation Notes

### Priority Order:
1. Core wizard structure and navigation
2. Database schema and API routes
3. Basic form collection (steps 1-5)
4. AI integrations (logo and content generation)
5. Design preferences and color theme selection
6. PDF export functionality
7. Polish, error handling, and optimization

### Critical Technical Details:
- **Payload Limits**: Configure server for 10MB uploads
- **AI API Integration**: Proper OpenAI API usage with error handling
- **Color System**: Implement intelligent color extraction and theme prioritization
- **PDF Generation**: Async file handling for embedded assets
- **Type Safety**: Comprehensive TypeScript types for all data structures

This prompt provides a complete specification for recreating the entire client onboarding portal with all its advanced features and functionality.