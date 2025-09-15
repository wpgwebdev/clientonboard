import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
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
