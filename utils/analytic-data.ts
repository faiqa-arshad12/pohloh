export interface LearningPath {
  id: number;
  name: string;
  path: string;
  completion: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  image: string;
}

// Mock data
export const tutorsList: Tutor[] = [
  {
    id: 1,
    name: "John Henry",
    rating: "91%",
    completionRate: "6%",
    strengths: ["Shopify", "Tier 1"],
    opportunities: ["Return Policy", "Troubleshooting"],
  },
  {
    id: 2,
    name: "Darlene Robertson",
    rating: "83%",
    completionRate: "83%",
    strengths: ["Warranty", "Tier 2"],
    opportunities: ["Summer Sale", "Troubleshooting"],
  },
  {
    id: 3,
    name: "Albert Flores",
    rating: "5%",
    completionRate: "5%",
    strengths: ["Escalation", "Brand Language"],
    opportunities: ["Return Policy", "Troubleshooting"],
  },
  {
    id: 4,
    name: "Cameron Williamson",
    rating: "39",
    completionRate: "41%",
    strengths: ["Call Script", "Summer Sale"],
    opportunities: ["Tier 1", "Troubleshooting"],
  },
  {
    id: 5,
    name: "John ",
    rating: "91%",
    completionRate: "6%",
    strengths: ["Shopify", "Tier 1"],
    opportunities: ["Return Policy", "Troubleshooting"],
  },
  {
    id: 6,
    name: "Robertson",
    rating: "83%",
    completionRate: "83%",
    strengths: ["Warranty", "Tier 2"],
    opportunities: ["Summer Sale", "Troubleshooting"],
  },
  {
    id: 7,
    name: "Flores",
    rating: "5%",
    completionRate: "5%",
    strengths: ["Escalation", "Brand Language"],
    opportunities: ["Return Policy", "Troubleshooting"],
  },
  {
    id: 8,
    name: "Williamson",
    rating: "39",
    completionRate: "41%",
    strengths: ["Call Script", "Summer Sale"],
    opportunities: ["Tier 1", "Troubleshooting"],
  },
];

export const learningPaths: LearningPath[] = [
  {
    id: 1,
    name: "John Doe",
    image: "/pic1.png",
    path: "Customer Support",
    completion: "30%",
    dueDate: "10 Sept 2024",
    priority: "High",
  },
  {
    id: 2,
    name: "John Doe",
    image: "/pic1.png",
    path: "Advanced Sales",
    completion: "40%",
    dueDate: "10 Sept 2024",
    priority: "Low",
  },
  {
    id: 3,
    name: "John Doe",
    image: "/pic1.png",
    path: "Advanced Sales",
    completion: "40%",
    dueDate: "10 Sept 2024",
    priority: "Medium",
  },
  {
    id: 4,
    name: "John Doe",
    image: "/pic1.png",
    path: "Customer Support",
    completion: "30%",
    dueDate: "10 Sept 2024",
    priority: "High",
  },
  {
    id: 5,
    name: "John Doe",
    image: "/pic1.png",
    path: "Advanced Sales",
    completion: "40%",
    dueDate: "10 Sept 2024",
    priority: "Low",
  },
  {
    id: 6,
    name: "John Doe",
    image: "/pic1.png",
    path: "Advanced Sales",
    completion: "40%",
    dueDate: "10 Sept 2024",
    priority: "Medium",
  },
];
export interface Tutor {
  id: number;
  name: string;
  rating: string;
  completionRate: string;
  strengths: string[];
  opportunities: string[];
}
export const tutorColumns = [
  {Header: "Tutor Name", accessor: "name"},
  {Header: "Average Tutor Score", accessor: "rating"},
  {Header: "Completion rate", accessor: "completionRate"},
  {Header: "Strength", accessor: "strengths"},
  {Header: "Opportunities", accessor: "opportunities"},
  {Header: "Action", accessor: "action"},
];

// Define columns for learning paths table
export const pathColumns = [
  {Header: "Name", accessor: "name"},
  {Header: "Learning Path", accessor: "path"},
  {Header: "Completion", accessor: "completion"},
  {Header: "Due Date", accessor: "dueDate"},
  {Header: "Priority", accessor: "priority"},
  {Header: "Action", accessor: "action"},
];
