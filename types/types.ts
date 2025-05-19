import { UserStatus } from "./enum";

export type Department =
  | "Customer"
  | "Sales"
  | "Marketing"
  | "HR"
  | "Communication"
  | "IT"
  | "Finance"
  | "Product"
  | "Security"
  | "Logistics"
  | "Operations"
  | string;

export type Role = "admin" | "owner" | "user";
export type USER_Role = "user";
export type ADMIN_ROLE = "admin" | "user";



export type Status =
  | "pending"
  | "complete"
  | "organization_details"
  | "setup_profile"
  | "plan_selected"
  | string;

export interface OnboardingData {
  organization?: {
    // role: Role
    departments: Department[];
    organization_name: string;
    stripe_customer_id?: string;
    subscription_id?: string;
  };
  profile?: {
    role: Role;
    location: string;
    profile_picture: string;
  };
}

export type User = {
  user_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  org_id?: string;
  email: string;
  password?: string;
  profile_picture?: string;
  location?: string;
  user_role?: string;
  role: Role;
  week_days?: any,
  status?: "pending" | "organization_details" | "setup_profile" | "plan_selected" | "approved" | "complete",

};
export interface Organization {
  // role: Role
  departments: Department;
  id?: string;
  name: string;
  user_id: string
  num_of_seat: number
};

export interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  // Add other fields you need
}

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number | null;
  currency: string;
  recurring?: {
    interval: "day" | "week" | "month" | "year";
    interval_count: number;
  };
  nickname: string | null;
  // Add other fields you need
}
export interface Organization {
  // role: Role
  departments: Department;
  id?: string;
  name: string;
  user_id: string
  num_of_seat: number
};


export type PaymentPlan = {
  plan: string;
  billingCycle: 'month' | 'year'; // or string if open-ended
};



export interface UserOnboardingData {
  organization?: {
    departments: Department[];
    name: string;
    id?: string;
    num_of_seat?: number;
    user_id?: string;
  };
  user?: {
    user_role: string;
    location: string;
    profile_picture: string;
    first_name?: string;
    last_name?: string;
    user_name?: string;
    org_id?: string;
    status?: UserStatus
  };
  subscription?: {
    subscription_id: string;
    customer_id: string;
    is_subscribed: boolean;
    plan_type?: string;
    org_id?: string;
    client_secret?: string;
    priceId?: string;
    amount?: number;
    quantity?: number
  };
}
export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type WorkDaysState = Record<Weekday, boolean>;
export const defaultWorkDays: WorkDaysState = {
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: false,
  sunday: false,
};

export type IconName =
  | "BarChart2"
  | "BarChart"
  | "Users"
  | "Briefcase"
  | "ClipboardList"
  | "FileText"
  | "Search"
  | "Plus"
  | "X"
  | "MoreHorizontal"
  | "Trash2"
  | "Edit"
  | "Zap"
  | "Coffee"
  | "Mail"
  | "Bell"
  | "Calendar"
  | "Scissors"
  | "Headphones"
  | "Map"
  | "Flag"
  | "Database"
  | "Book"
  | "Code"
  | "CheckCircle2"
  | "AlertCircle"
  | "Info"
  | "Globe"
  | "Settings"
  | "ShieldCheck"
  | "Lock"
  | "Unlock"
  | "Loader2"
  | "Download"
  | "Upload"
  | "Image"
  | "Video"
  | "Star"
  | "Home"
  | "Menu"
  | "Moon"
  | "Sun"
  | "Eye"
  | "EyeOff"
  | string;

// Icon categories for better organization
export type IconCategory = {
  name: string;
  icons: string[];
}