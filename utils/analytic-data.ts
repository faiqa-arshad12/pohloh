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
  department?:string;
  score?:string;
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
