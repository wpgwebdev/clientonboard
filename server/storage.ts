import { type User, type InsertUser, type ProjectSubmission, type FeatureSelectionRow, type InsertFeatureSelection } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project submission methods
  createProjectSubmission(submission: Omit<ProjectSubmission, 'submittedAt'>): Promise<ProjectSubmission & { id: string }>;
  getProjectSubmission(id: string): Promise<(ProjectSubmission & { id: string }) | undefined>;
  listProjectSubmissions(): Promise<(ProjectSubmission & { id: string })[]>;

  // Feature selection methods
  createFeatureSelection(selection: InsertFeatureSelection): Promise<FeatureSelectionRow>;
  getFeatureSelection(id: string): Promise<FeatureSelectionRow | undefined>;
  getFeatureSelectionByUserId(userId: string): Promise<FeatureSelectionRow | undefined>;
  updateFeatureSelection(id: string, selection: Partial<InsertFeatureSelection>): Promise<FeatureSelectionRow | undefined>;
  listFeatureSelections(): Promise<FeatureSelectionRow[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projectSubmissions: Map<string, ProjectSubmission & { id: string }>;
  private featureSelections: Map<string, FeatureSelectionRow>;

  constructor() {
    this.users = new Map();
    this.projectSubmissions = new Map();
    this.featureSelections = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Project submission methods
  async createProjectSubmission(submission: Omit<ProjectSubmission, 'submittedAt'>): Promise<ProjectSubmission & { id: string }> {
    const id = randomUUID();
    const submittedAt = new Date().toISOString();
    const projectSubmission: ProjectSubmission & { id: string } = {
      ...submission,
      id,
      submittedAt
    };
    this.projectSubmissions.set(id, projectSubmission);
    return projectSubmission;
  }

  async getProjectSubmission(id: string): Promise<(ProjectSubmission & { id: string }) | undefined> {
    return this.projectSubmissions.get(id);
  }

  async listProjectSubmissions(): Promise<(ProjectSubmission & { id: string })[]> {
    return Array.from(this.projectSubmissions.values());
  }

  // Feature selection methods
  async createFeatureSelection(selection: InsertFeatureSelection): Promise<FeatureSelectionRow> {
    const id = randomUUID();
    const now = new Date();
    const featureSelection: FeatureSelectionRow = {
      id,
      userId: selection.userId ?? null,
      projectId: selection.projectId ?? null,
      selectedFeatures: selection.selectedFeatures,
      priority: selection.priority ?? null,
      notes: selection.notes ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.featureSelections.set(id, featureSelection);
    return featureSelection;
  }

  async getFeatureSelection(id: string): Promise<FeatureSelectionRow | undefined> {
    return this.featureSelections.get(id);
  }

  async getFeatureSelectionByUserId(userId: string): Promise<FeatureSelectionRow | undefined> {
    return Array.from(this.featureSelections.values()).find(
      (selection) => selection.userId === userId
    );
  }

  async updateFeatureSelection(id: string, updates: Partial<InsertFeatureSelection>): Promise<FeatureSelectionRow | undefined> {
    const existing = this.featureSelections.get(id);
    if (!existing) {
      return undefined;
    }
    
    const updated: FeatureSelectionRow = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    
    this.featureSelections.set(id, updated);
    return updated;
  }

  async listFeatureSelections(): Promise<FeatureSelectionRow[]> {
    return Array.from(this.featureSelections.values());
  }
}

export const storage = new MemStorage();
