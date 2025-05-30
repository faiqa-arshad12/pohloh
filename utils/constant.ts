import {Department, Role} from "@/types/types";
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
export const ROLES: {label: string; value: Role}[] = [
  {label: "Admin", value: "admin"},
  {label: "Owner", value: "owner"},
  {label: "User", value: "user"},
];
export const USER_ROLES: {label: string; value: Role}[] = [
  {label: "User", value: "user"},
];
export const ADMIN_ROLES: {label: string; value: Role}[] = [
  {label: "User", value: "user"},
  {label: "Admin", value: "admin"},
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
  SAVED = "saved",
  DRAFT = "draft",
  PUBLISH = "publish",
}
export enum CardType {
  CARD = "card",
  ANNOUNCEMENT = "announcement",
}
export const visibilityOptions = [
  {value: "only_me", label: "Only Me"},
  {value: "everyone", label: "Everyone"},
  {value: "selected_users", label: "Choose Users"},
  {value: "team_based", label: "Team Based"},
];

export const visibilityLabels: Record<string, string> =
  visibilityOptions.reduce(
    (acc, {value, label}) => ({...acc, [value]: label}),
    {}
  );

export const feedback_topics = [
  { id: 'general', label: 'General feedback' },
  { id: 'issue', label: 'Product Issue' },
  { id: 'feature', label: 'New Feature Request' },
  { id: 'other', label: 'Other (specify in text)' }
];

export const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api`;
export const apiUrl_AI = `${process.env.NEXT_PUBLIC_AI_API_URL}/api`;

  // Available options
  export const fontSizes = [
    "8",
    "10",
    "12",
    "14",
    "16",
    "18",
    "20",
    "24",
    "30",
    "36",
    "48",
  ];
  export const fontFamilies = [
    "Default",
    "Helvetica",
    "Garamond",
    "Arial",
    "Verdana",
    "Georgia",
    "Calibri",
    "Futura",
    "Times New Roman",
    "Cambria",
    "Consolas",
  ];
  export const formatPeriodDisplay = (periodType: string): string => {
    switch (periodType) {
      case "2week":
        return "2 Weeks";
      case "1month":
        return "1 Month";
      case "6months":
        return "6 Months";
      case "12months":
        return "1 Year";
      case "custom":
        return "Custom Date";
      default:
        return "Select period";
    }
  };
  export const  calculateDateFromPeriod = (period: string): Date => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of day

    switch (period) {
      case "2week":
        const twoWeeks = new Date(now);
        twoWeeks.setDate(now.getDate() + 14);
        return twoWeeks;
      case "1month":
        const oneMonth = new Date(now);
        oneMonth.setMonth(now.getMonth() + 1);
        return oneMonth;
      case "6months":
        const sixMonths = new Date(now);
        sixMonths.setMonth(now.getMonth() + 6);
        return sixMonths;
      case "12months":
        const oneYear = new Date(now);
        oneYear.setFullYear(now.getFullYear() + 1);
        return oneYear;
      default:
        return now;
    }
  };
export   const determinePeriodType = (date: Date): string => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const twoWeeks = new Date(now);
    twoWeeks.setDate(now.getDate() + 14);

    const oneMonth = new Date(now);
    oneMonth.setMonth(now.getMonth() + 1);

    const sixMonths = new Date(now);
    sixMonths.setMonth(now.getMonth() + 6);

    const oneYear = new Date(now);
    oneYear.setFullYear(now.getFullYear() + 1);

    if (date.getTime() === twoWeeks.getTime()) return "2week";
    if (date.getTime() === oneMonth.getTime()) return "1month";
    if (date.getTime() === sixMonths.getTime()) return "6months";
    if (date.getTime() === oneYear.getTime()) return "12months";
    return "custom";
  };

  export const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
