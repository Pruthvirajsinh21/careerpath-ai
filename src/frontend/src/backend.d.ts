import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CareerGuidanceResponse {
    matches: Array<JobMatchResult>;
    response: string;
}
export interface Job {
    title: string;
    growthOutlook: string;
    requiredInterests: Array<string>;
    description: string;
    salaryRange: string;
    requiredSkills: Array<string>;
}
export interface Message {
    content: string;
    role: string;
}
export interface JobMatchResult {
    job: Job;
    score: bigint;
}
export interface UserProfile {
    bio: string;
    interests: Array<string>;
    name: string;
    role: UserRole;
    workStylePreferences: Array<string>;
    personalityTraits: Array<string>;
    skills: Array<string>;
}
export interface UserCredential {
    username: string;
    email: string;
    passwordHash: string;
}
export enum UserRole {
    employee = "employee",
    student = "student"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addJob(job: Job): Promise<void>;
    addMessage(message: Message): Promise<CareerGuidanceResponse>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createUserProfile(name: string, role: UserRole, bio: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getConversationHistory(): Promise<Array<Message>>;
    getJob(title: string): Promise<Job>;
    getJobList(): Promise<Array<Job>>;
    getMatchingJobs(): Promise<Array<JobMatchResult>>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    registerAccount(username: string, email: string, passwordHash: string): Promise<void>;
    validateLogin(email: string, passwordHash: string): Promise<UserCredential>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedJobs(): Promise<void>;
    updateUserProfile(interests: Array<string>, skills: Array<string>, personalityTraits: Array<string>, workStylePreferences: Array<string>): Promise<void>;
}
