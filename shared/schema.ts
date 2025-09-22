import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Logo Generation Schemas
export const logoPreferencesSchema = z.object({
  types: z.array(z.enum([
    'wordmark', 
    'lettermark', 
    'pictorial', 
    'combination', 
    'emblem', 
    'abstract', 
    'mascot'
  ])).min(1, "Please select at least one logo type"),
  styles: z.array(z.enum([
    'modern',
    'classic', 
    'minimalist',
    'vintage',
    'playful',
    'elegant',
    'bold',
    'organic',
    'geometric',
    'hand-drawn',
    'tech',
    'luxury'
  ])).min(1, "Please select at least one style"),
  colors: z.string().optional(),
  inspirations: z.array(z.string()).optional(),
  useReference: z.boolean().optional()
});

export const logoGenerationRequestSchema = z.object({
  businessName: z.string().optional(),
  description: z.string().min(1, "Business description is required"),
  preferences: logoPreferencesSchema,
  referenceImageBase64: z.string().optional()
});

export const generatedLogoSchema = z.object({
  id: z.string(),
  dataUrl: z.string(),
  prompt: z.string()
});

export const logoSelectionSchema = z.object({
  selectedId: z.string(),
  decision: z.enum(['final', 'direction']),
  selectedLogo: generatedLogoSchema
});

export type LogoPreferences = z.infer<typeof logoPreferencesSchema>;
export type LogoGenerationRequest = z.infer<typeof logoGenerationRequestSchema>;
export type GeneratedLogo = z.infer<typeof generatedLogoSchema>;
export type LogoSelection = z.infer<typeof logoSelectionSchema>;

// Content Generation Schemas
export const contentPreferencesSchema = z.object({
  style: z.enum(['text-heavy', 'visual-focused', 'balanced']),
  useVideo: z.boolean(),
  tone: z.enum(['professional', 'casual', 'friendly', 'authoritative'])
});

export const contentGenerationRequestSchema = z.object({
  businessName: z.string(),
  businessDescription: z.string(),
  siteType: z.string(),
  pages: z.array(z.object({
    id: z.string(),
    name: z.string(),
    path: z.string()
  })),
  preferences: contentPreferencesSchema,
  pageDirections: z.array(z.object({
    pageId: z.string(),
    direction: z.string()
  })).optional() // Array of page directions from user
});

export const generatedContentSchema = z.object({
  pageId: z.string(),
  pageName: z.string(),
  content: z.string(),
  editedContent: z.string().optional(), // User's edited version
  pageDirection: z.string().optional(), // User's specific direction for this page
  suggestions: z.array(z.string()).optional(),
  hasEdits: z.boolean().optional() // Flag to track if content was edited
});

export const pageRegenerationRequestSchema = z.object({
  businessName: z.string(),
  businessDescription: z.string(),
  siteType: z.string(),
  page: z.object({
    id: z.string(),
    name: z.string(),
    path: z.string()
  }),
  preferences: contentPreferencesSchema,
  pageDirection: z.string().optional() // Custom direction for this specific page
});

export type ContentPreferences = z.infer<typeof contentPreferencesSchema>;
export type ContentGenerationRequest = z.infer<typeof contentGenerationRequestSchema>;
export type GeneratedContent = z.infer<typeof generatedContentSchema>;
export type PageRegenerationRequest = z.infer<typeof pageRegenerationRequestSchema>;

// Images & Media Schemas
export const imageRequirementsSchema = z.object({
  logoNeeds: z.enum(['have-logo', 'need-logo', 'need-variations']),
  logoDescription: z.string().optional(),
  specificImages: z.array(z.string()).optional(), // List of specific images needed
  teamPhotos: z.boolean().optional(),
  productPhotos: z.boolean().optional(),
  facilityPhotos: z.boolean().optional(),
  preferredPhotoStyle: z.enum([
    'professional-corporate',
    'lifestyle-candid', 
    'modern-minimalist',
    'warm-friendly',
    'high-energy',
    'artistic-creative'
  ]).optional(),
  stockPhotoPreference: z.enum(['free-library', 'premium-paid', 'mixed']).optional(),
  additionalNotes: z.string().optional()
});

export const uploadedImageSchema = z.object({
  id: z.string(),
  filename: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  category: z.enum(['logo', 'team', 'product', 'facility', 'other']).optional(),
  description: z.string().optional()
});

export type ImageRequirements = z.infer<typeof imageRequirementsSchema>;
export type UploadedImage = z.infer<typeof uploadedImageSchema>;

// Integration Schemas (CRM and Marketing Automation)
export const integrationSchema = z.object({
  // CRM Integration
  selectedCrms: z.array(z.enum([
    'salesforce',
    'hubspot', 
    'zoho-crm',
    'pipedrive',
    'microsoft-dynamics-365',
    'freshsales',
    'ontraport',
    'nimble',
    'nutshell',
    'membrain',
    'sugarcrm',
    'custom'
  ])).optional().default([]),
  customCrmNames: z.array(z.string()).optional(),
  
  // Marketing Automation Integration
  selectedMarketingAutomation: z.array(z.enum([
    'klaviyo',
    'hubspot',
    'activecampaign',
    'mailchimp',
    'brevo',
    'marketo-engage',
    'pardot',
    'custom'
  ])).optional().default([]),
  customMarketingAutomationNames: z.array(z.string()).optional(),
  
  // Payment Gateway Integration
  selectedPaymentGateways: z.array(z.enum([
    'stripe',
    'paypal',
    'square',
    'authorize-net',
    'amazon-pay',
    'apple-pay',
    'bank-transfer',
    'custom'
  ])).optional().default([]),
  customPaymentGatewayNames: z.array(z.string()).optional(),
  
  // API Integrations
  apiIntegrations: z.string().optional(),
  
  // Automation Integration
  selectedAutomationPlatforms: z.array(z.enum([
    'zapier',
    'make'
  ])).optional().default([]),
  
  // Engagement & Interactivity Integration
  selectedEngagementFeatures: z.array(z.enum([
    'animations-motion-effects',
    'popups-modals',
    'live-chat-integration',
    'polls-surveys',
    'appointment-booking-scheduling',
    'event-calendar-ticketing',
    'social-media-feeds-sharing'
  ])).optional().default([]),
  
  // Advanced Features Integration
  selectedAdvancedFeatures: z.array(z.enum([
    'multilingual-translation-support',
    'seo-tools-meta-sitemap-schema',
    'analytics-integration-ga4-hotjar',
    'security-features-ssl-captcha-2fa',
    'custom-forms-workflows',
    'chatbots-ai-powered-scripted'
  ])).optional().default([])
}).superRefine((data, ctx) => {
  // Validate that at least one integration is selected
  const hasAnyCrm = data.selectedCrms && data.selectedCrms.length > 0;
  const hasAnyMarketing = data.selectedMarketingAutomation && data.selectedMarketingAutomation.length > 0;
  const hasAnyPayment = data.selectedPaymentGateways && data.selectedPaymentGateways.length > 0;
  const hasApiIntegrations = data.apiIntegrations && data.apiIntegrations.trim().length > 0;
  const hasAnyAutomation = data.selectedAutomationPlatforms && data.selectedAutomationPlatforms.length > 0;
  const hasAnyEngagement = data.selectedEngagementFeatures && data.selectedEngagementFeatures.length > 0;
  const hasAnyAdvanced = data.selectedAdvancedFeatures && data.selectedAdvancedFeatures.length > 0;
  
  if (!hasAnyCrm && !hasAnyMarketing && !hasAnyPayment && !hasApiIntegrations && !hasAnyAutomation && !hasAnyEngagement && !hasAnyAdvanced) {
    ctx.addIssue({
      code: 'custom',
      message: 'Please select at least one integration type',
      path: ['selectedCrms']
    });
  }
  
  // Validate custom CRM names
  if (data.selectedCrms?.includes('custom') && (!data.customCrmNames || data.customCrmNames.length === 0 || data.customCrmNames.every(name => !name?.trim()))) {
    ctx.addIssue({
      code: 'custom',
      message: 'At least one custom CRM name is required',
      path: ['customCrmNames']
    });
  }
  
  // Validate custom Marketing Automation names
  if (data.selectedMarketingAutomation?.includes('custom') && (!data.customMarketingAutomationNames || data.customMarketingAutomationNames.length === 0 || data.customMarketingAutomationNames.every(name => !name?.trim()))) {
    ctx.addIssue({
      code: 'custom',
      message: 'At least one custom Marketing Automation name is required',
      path: ['customMarketingAutomationNames']
    });
  }
  
  // Validate custom Payment Gateway names
  if (data.selectedPaymentGateways?.includes('custom') && (!data.customPaymentGatewayNames || data.customPaymentGatewayNames.length === 0 || data.customPaymentGatewayNames.every(name => !name?.trim()))) {
    ctx.addIssue({
      code: 'custom',
      message: 'At least one custom Payment Gateway name is required',
      path: ['customPaymentGatewayNames']
    });
  }
});

// Legacy alias for backward compatibility
export const crmIntegrationSchema = integrationSchema;
export type CrmIntegration = z.infer<typeof integrationSchema>;
export type IntegrationData = z.infer<typeof integrationSchema>;

// Project Submission Schema
export const projectSubmissionSchema = z.object({
  businessName: z.string(),
  businessDescription: z.string(),
  selectedSiteType: z.string(),
  pages: z.array(z.object({
    id: z.string(),
    name: z.string(),
    path: z.string(),
    required: z.boolean().optional()
  })),
  logoDecision: z.enum(['final', 'direction']).optional(),
  logoFile: z.string().optional(), // Base64 or file reference
  selectedLogo: generatedLogoSchema.optional(),
  contentPreferences: contentPreferencesSchema,
  generatedContent: z.array(generatedContentSchema),
  crmIntegration: crmIntegrationSchema.optional(),
  imageRequirements: imageRequirementsSchema,
  designPreferences: z.object({
    selectedStyle: z.string(),
    preferredFont: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    accentColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    inspirationLinks: z.array(z.string()),
    additionalNotes: z.string()
  }),
  submittedAt: z.string().optional()
});

export type ProjectSubmission = z.infer<typeof projectSubmissionSchema>;

// Feature Selection Schemas
export const featureSelections = pgTable("feature_selections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  projectId: varchar("project_id"),
  selectedFeatures: json("selected_features").$type<string[]>().notNull(),
  priority: json("priority").$type<{ [key: string]: 'low' | 'medium' | 'high' }>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const featureSelectionSchema = z.object({
  selectedFeatures: z.array(z.string()),
  priority: z.record(z.enum(['low', 'medium', 'high'])).optional(),
  notes: z.string().optional()
});

export const insertFeatureSelectionSchema = createInsertSchema(featureSelections, {
  selectedFeatures: z.array(z.string()),
  priority: z.record(z.enum(['low', 'medium', 'high'])).optional()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Feature categories and features definition
export const websiteFeatures = {
  "Core Website Features": [
    "Contact Form",
    "Contact Form with Conditional Logic", 
    "Newsletter Signup",
    "Blog / News Section",
    "FAQ Page / Accordion Sections",
    "Search Functionality"
  ],
  "User Accounts & Membership": [
    "Registration & Login",
    "User Profiles",
    "Role-Based Access (admin, member, guest)",
    "Membership / Subscription System",
    "Customer Dashboards"
  ],
  "E-Commerce": [
    "Online Store (Shopify / WooCommerce)",
    "Product Catalog",
    "Shopping Cart & Checkout",
    "Digital Downloads",
    "Inventory Management",
    "Subscription Products", 
    "Multi-Currency Support",
    "Discount Codes / Coupons"
  ],
  "Engagement & Interactivity": [
    "Animations & Motion Effects",
    "Pop-ups / Modals (newsletter, promos)",
    "Live Chat Integration (Intercom, Drift, etc.)",
    "Polls & Surveys",
    "Appointment Booking / Scheduling",
    "Event Calendar & Ticketing",
    "Social Media Feeds / Sharing"
  ],
  "Integrations": [
    "CRM Integration (HubSpot, Salesforce, Zoho, etc.)",
    "Marketing Automation (Klaviyo, Mailchimp, ActiveCampaign)",
    "Payment Gateways (Stripe, PayPal, Square, etc.)",
    "API Integrations (custom or third-party tools)",
    "Zapier / Make (Integromat) Automations"
  ],
  "Content & Media": [
    "Photo Galleries / Sliders",
    "Video Backgrounds / Embeds",
    "Podcast / Audio Player",
    "Resource Library (PDFs, Whitepapers)",
    "Download Center"
  ],
  "Advanced Features": [
    "Multilingual / Translation Support",
    "SEO Tools (meta tags, sitemap, schema)",
    "Analytics Integration (GA4, Hotjar, etc.)",
    "Security Features (SSL, Captcha, 2FA)",
    "Custom Forms & Workflows",
    "Chatbots (AI-powered or scripted)"
  ],
  "Design & Branding": [
    "Theme Customization",
    "Color & Typography Options",
    "Dark Mode Toggle",
    "Icon Libraries & Illustrations",
    "Custom Graphics / SVG Animations"
  ],
  "Enterprise / Custom": [
    "Learning Management System (LMS)",
    "Custom Web Applications / Portals",
    "Document Management System",
    "API-Driven Dashboards",
    "Integrations with ERP / Accounting Tools"
  ]
} as const;

export type FeatureSelection = z.infer<typeof featureSelectionSchema>;
export type InsertFeatureSelection = z.infer<typeof insertFeatureSelectionSchema>;
export type FeatureSelectionRow = typeof featureSelections.$inferSelect;
export type WebsiteFeatureCategory = keyof typeof websiteFeatures;
export type WebsiteFeature = typeof websiteFeatures[WebsiteFeatureCategory][number];
