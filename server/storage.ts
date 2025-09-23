import { type User, type InsertUser, type ProjectSubmission, type FeatureSelectionRow, type InsertFeatureSelection, type InsertProjectSubmission, type ProjectSubmissionRow, users, projectSubmissions, featureSelections } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project submission methods
  createProjectSubmission(submission: InsertProjectSubmission): Promise<ProjectSubmissionRow>;
  getProjectSubmission(id: string): Promise<ProjectSubmissionRow | undefined>;
  getProjectSubmissionByUserId(userId: string): Promise<ProjectSubmissionRow | undefined>;
  updateProjectSubmission(id: string, submission: Partial<InsertProjectSubmission>): Promise<ProjectSubmissionRow | undefined>;
  listProjectSubmissions(): Promise<ProjectSubmissionRow[]>;

  // Feature selection methods
  createFeatureSelection(selection: InsertFeatureSelection): Promise<FeatureSelectionRow>;
  getFeatureSelection(id: string): Promise<FeatureSelectionRow | undefined>;
  getFeatureSelectionByUserId(userId: string): Promise<FeatureSelectionRow | undefined>;
  updateFeatureSelection(id: string, selection: Partial<InsertFeatureSelection>): Promise<FeatureSelectionRow | undefined>;
  listFeatureSelections(): Promise<FeatureSelectionRow[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Project submission methods
  async createProjectSubmission(submission: InsertProjectSubmission): Promise<ProjectSubmissionRow> {
    const result = await db.insert(projectSubmissions).values(submission as any).returning();
    return result[0];
  }

  async getProjectSubmission(id: string): Promise<ProjectSubmissionRow | undefined> {
    const result = await db.select().from(projectSubmissions).where(eq(projectSubmissions.id, id)).limit(1);
    return result[0];
  }

  async getProjectSubmissionByUserId(userId: string): Promise<ProjectSubmissionRow | undefined> {
    const result = await db.select().from(projectSubmissions).where(eq(projectSubmissions.userId, userId)).limit(1);
    return result[0];
  }

  async updateProjectSubmission(id: string, submission: Partial<InsertProjectSubmission>): Promise<ProjectSubmissionRow | undefined> {
    const result = await db.update(projectSubmissions)
      .set(submission as any)
      .where(eq(projectSubmissions.id, id))
      .returning();
    return result[0];
  }

  async listProjectSubmissions(): Promise<ProjectSubmissionRow[]> {
    return await db.select().from(projectSubmissions);
  }

  // Feature selection methods
  async createFeatureSelection(selection: InsertFeatureSelection): Promise<FeatureSelectionRow> {
    const result = await db.insert(featureSelections).values(selection).returning();
    return result[0];
  }

  async getFeatureSelection(id: string): Promise<FeatureSelectionRow | undefined> {
    const result = await db.select().from(featureSelections).where(eq(featureSelections.id, id)).limit(1);
    return result[0];
  }

  async getFeatureSelectionByUserId(userId: string): Promise<FeatureSelectionRow | undefined> {
    const result = await db.select().from(featureSelections).where(eq(featureSelections.userId, userId)).limit(1);
    return result[0];
  }

  async updateFeatureSelection(id: string, updates: Partial<InsertFeatureSelection>): Promise<FeatureSelectionRow | undefined> {
    const result = await db.update(featureSelections)
      .set(updates)
      .where(eq(featureSelections.id, id))
      .returning();
    return result[0];
  }

  async listFeatureSelections(): Promise<FeatureSelectionRow[]> {
    return await db.select().from(featureSelections);
  }
}

export const storage = new DatabaseStorage();
