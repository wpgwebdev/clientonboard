import { type User, type InsertUser, type ProjectSubmission } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projectSubmissions: Map<string, ProjectSubmission & { id: string }>;

  constructor() {
    this.users = new Map();
    this.projectSubmissions = new Map();
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
}

export const storage = new MemStorage();
