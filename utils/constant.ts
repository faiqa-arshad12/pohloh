import { Department, Role } from "@/types/types";
export const DEPARTMENTS: Department[] = [
  "Customer",
  "Sales",
  "Marketing",
  "HR",
  "Communication",
  "IT",
  "Finance",
  "Product",
  "Security",
  "Logistics",
  "Operations",
];
export const ROLES: { label: string; value: Role }[] = [
  { label: "Admin", value: "admin" },
  { label: "Owner", value: "owner" },
  { label: "User", value: "user" },
];
export const USER_ROLES: { label: string; value: Role }[] = [
  { label: "User", value: "user" },
];
export const ADMIN_ROLES: { label: string; value: Role }[] = [
  { label: "User", value: "user" },
  { label: "Admin", value: "admin" },

];

export const organizations = "organizations";
export const users = "users";
export const subscription = "subscriptions";

export const user_roles = [
  "Software Engineer",
  "Product Manager",
  "UX Designer",
  "Data Scientist",
  "Marketing Specialist",
  "Other",
];
export const nameRegex = /^[A-Za-z]+$/;
export const usernameRegex = /^[^\s]{1,50}$/;
export const ONBOARDING_DATA_KEY = "onboarding_data";
export const CURRENT_STEP_KEY = "onboarding_current_step";

export enum CardStatus {
  SAVED = 'saved',
  DRAFT = 'draft',
  PUBLISH = 'publish'
}
export enum CardType {
  CARD = 'card',
  ANNOUNCEMENT = 'announcement',
}