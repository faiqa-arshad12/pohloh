export interface LearningPath {
  id: number;
  name: string;
  path: string;
  completion: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  image: string;
  departmentId?: string;
}

// Mock data
// export const tutorsList: Tutor[] = [
//   {
//     id: 1,
//     name: "John Henry",
//     rating: "91%",
//     completionRate: "6%",
//     strengths: ["Shopify", "Tier 1"],
//     opportunities: ["Return Policy", "Troubleshooting"],
//     departmentId: "62e7b485-70c7-4807-b3e3-943a7d7e7d19", // Customer Department
//   },
//   {
//     id: 2,
//     name: "Darlene Robertson",
//     rating: "83%",
//     completionRate: "83%",
//     strengths: ["Warranty", "Tier 2"],
//     opportunities: ["Summer Sale", "Troubleshooting"],
//     departmentId: "9bbec25d-a60a-433d-8f87-58f256fcc16f", // Operations Department
//   },
//   {
//     id: 3,
//     name: "Albert Flores",
//     rating: "5%",
//     completionRate: "5%",
//     strengths: ["Escalation", "Brand Language"],
//     opportunities: ["Return Policy", "Troubleshooting"],
//     departmentId: "9b62f894-209c-4418-8779-16c8adde4eea", // Security Department
//   },
//   {
//     id: 4,
//     name: "Cameron Williamson",
//     rating: "39",
//     completionRate: "41%",
//     strengths: ["Call Script", "Summer Sale"],
//     opportunities: ["Tier 1", "Troubleshooting"],
//     departmentId: "ff8d7ba1-ff9b-436f-bb1e-a7dbb83bbcff", // test Department
//   },
//   {
//     id: 5,
//     name: "John ",
//     rating: "91%",
//     completionRate: "6%",
//     strengths: ["Shopify", "Tier 1"],
//     opportunities: ["Return Policy", "Troubleshooting"],
//     departmentId: "62e7b485-70c7-4807-b3e3-943a7d7e7d19", // Customer Department
//   },
//   {
//     id: 6,
//     name: "Robertson",
//     rating: "83%",
//     completionRate: "83%",
//     strengths: ["Warranty", "Tier 2"],
//     opportunities: ["Summer Sale", "Troubleshooting"],
//     departmentId: "9bbec25d-a60a-433d-8f87-58f256fcc16f", // Operations Department
//   },
//   {
//     id: 7,
//     name: "Flores",
//     rating: "5%",
//     completionRate: "5%",
//     strengths: ["Escalation", "Brand Language"],
//     opportunities: ["Return Policy", "Troubleshooting"],
//     departmentId: "9b62f894-209c-4418-8779-16c8adde4eea", // Security Department
//   },
//   {
//     id: 8,
//     name: "Williamson",
//     rating: "39",
//     completionRate: "41%",
//     strengths: ["Call Script", "Summer Sale"],
//     opportunities: ["Tier 1", "Troubleshooting"],
//     departmentId: "ff8d7ba1-ff9b-436f-bb1e-a7dbb83bbcff", // test Department
//   },
// ];

export const learningPaths: LearningPath[] = [
  {
    id: 1,
    name: "John Doe",
    image: "/pic1.png",
    path: "Customer Support",
    completion: "30%",
    dueDate: "10 Sept 2024",
    priority: "High",
    departmentId: "62e7b485-70c7-4807-b3e3-943a7d7e7d19",
  },
  {
    id: 2,
    name: "John Doe",
    image: "/pic1.png",
    path: "Advanced Sales",
    completion: "40%",
    dueDate: "10 Sept 2024",
    priority: "Low",
    departmentId: "9bbec25d-a60a-433d-8f87-58f256fcc16f",
  },
  {
    id: 3,
    name: "John Doe",
    image: "/pic1.png",
    path: "Advanced Sales",
    completion: "40%",
    dueDate: "10 Sept 2024",
    priority: "Medium",
    departmentId: "ff8d7ba1-ff9b-436f-bb1e-a7dbb83bbcff",
  },
  {
    id: 4,
    name: "John Doe",
    image: "/pic1.png",
    path: "Customer Support",
    completion: "30%",
    dueDate: "10 Sept 2024",
    priority: "High",
    departmentId: "62e7b485-70c7-4807-b3e3-943a7d7e7d19",
  },
  {
    id: 5,
    name: "John Doe",
    image: "/pic1.png",
    path: "Advanced Sales",
    completion: "40%",
    dueDate: "10 Sept 2024",
    priority: "Low",
    departmentId: "9bbec25d-a60a-433d-8f87-58f256fcc16f",
  },
  {
    id: 6,
    name: "John Doe",
    image: "/pic1.png",
    path: "Advanced Sales",
    completion: "40%",
    dueDate: "10 Sept 2024",
    priority: "Medium",
    departmentId: "ff8d7ba1-ff9b-436f-bb1e-a7dbb83bbcff",
  },
];
export interface Tutor {
  id: string;
  name: string;
  email?: string;
  profile_picture?: string;
  averageScore?: number;
  completionRate?: number;
  totalPaths?: number;
  completedPaths?: number;
  totalQuestionsAnswered?: string;
  totalQuestionsCompleted?: number;
  strengths?: string[];
  opportunities?: string[];
  category?:string
}
export const tutorColumns = [
  { Header: "Tutor", accessor: "name" },
  { Header: "Average Tutor Score", accessor: "averageScore" },
  { Header: "Completion Rate", accessor: "completionRate" },
  { Header: "Strength", accessor: "strengths" },
  { Header: "Opportunities", accessor: "opportunities" },
  { Header: "Action", accessor: "action" },
];

// Define columns for learning paths table
export const pathColumns = [
  { Header: "Name", accessor: "name" },
  { Header: "Learning Path", accessor: "path" },
  { Header: "Overall Score", accessor: "completion" },
  { Header: "Completed", accessor: "dueDate" },
  // { Header: "Priority", accessor: "priority" },
  { Header: "Action", accessor: "action" },
];
export const policies = [
  {
    title: "How to order products online?",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
  },
  {
    title: "CX Tips & Tricks",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
  },
  {
    title: "Design Techniques",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
  },
  {
    title: "Remote Work Policy",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
  },
  {
    title: "Security Policy",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
  },
  {
    title: "Code of Conduct",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
  },
];



export const strengths = [
  { id: 1, name: "Warranty", color: "#BB6BD9" },
  { id: 2, name: "Escalation", color: "#E86818" },
  { id: 3, name: "Brand Language", color: "#EFBE0F" },
];

export const opportunities = [
  { id: 1, name: "Return Policy", color: "#2ABF1D" },
  { id: 2, name: "Troubleshooting", color: "#D72828" },
  { id: 3, name: "Sale", color: "#306BE1" },
];
const columnsLeaderboardEntry = [
  { Header: "Rank", accessor: "rankIcon" },
  { Header: "Name", accessor: "name" },
  { Header: "Completion Rate", accessor: "completion" },
  { Header: "Created Card & Verified", accessor: "cards" },
  { Header: "Engagement Level", accessor: "engagement" },
];
interface LeaderboardEntry {
  name: string;
  completion: string;
  cards: string;
  engagement: string;
  rankIcon: string;
  avatarUrl: string;
}

export const dataLeaderboardEntry: LeaderboardEntry[] = [
  {
    name: "John Doe",
    completion: "90%",
    cards: "12 (10 Verified)",
    engagement: "120 / 5",
    rankIcon: "🥇 Winner",
    avatarUrl: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "John Doe",
    completion: "80%",
    cards: "12 (10 Verified)",
    engagement: "120 / 5",
    rankIcon: "🥈 2nd place",
    avatarUrl: "https://i.pravatar.cc/40?img=2",
  },
  {
    name: "John Doe",
    completion: "70%",
    cards: "12 (10 Verified)",
    engagement: "120 / 5",
    rankIcon: "🥉 3rd place",
    avatarUrl: "https://i.pravatar.cc/40?img=3",
  },
  {
    name: "John Doe",
    completion: "90%",
    cards: "12 (10 Verified)",
    engagement: "120 / 5",
    rankIcon: "🥇 Winner",
    avatarUrl: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "John Doe",
    completion: "80%",
    cards: "12 (10 Verified)",
    engagement: "120 / 5",
    rankIcon: "🥈 2nd place",
    avatarUrl: "https://i.pravatar.cc/40?img=2",
  },
  {
    name: "John Doe",
    completion: "70%",
    cards: "12 (10 Verified)",
    engagement: "120 / 5",
    rankIcon: "🥉 3rd place",
    avatarUrl: "https://i.pravatar.cc/40?img=3",
  },
];
