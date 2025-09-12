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
