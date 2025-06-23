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
  department?: string;
  score?: string;
  opportunities?: string[];
  category?: string;
}
export const tutorColumns = [
  {Header: "Tutor", accessor: "name"},
  {Header: "Average Tutor Score", accessor: "averageScore"},
  {Header: "Completion Rate", accessor: "completionRate"},
  {Header: "Strength", accessor: "strengths"},
  {Header: "Opportunities", accessor: "opportunities"},
  {Header: "Action", accessor: "action"},
];

export const pathColumns = [
  {Header: "Name", accessor: "name"},
  {Header: "Learning Path", accessor: "path"},
  {Header: "Overall Score", accessor: "completion"},
  {Header: "Completed", accessor: "dueDate"},
  {Header: "Action", accessor: "action"},
];
