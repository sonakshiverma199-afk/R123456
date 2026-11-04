export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'exam' | 'assignment' | 'study' | 'reminder' | 'other';
  description?: string;
  reminder?: boolean;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  subjectId?: string;
  dueDate?: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  deadline: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'submitted';
  description?: string;
  createdAt: string;
  submittedAt?: string;
}

export interface TheoryTopic {
  id: string;
  subjectId: string;
  title: string;
  completed: boolean;
  notes?: string;
}

export interface DailyGoal {
  id: string;
  date: string;
  targetMinutes: number;
  completedMinutes: number;
}

export interface AppData {
  subjects: Subject[];
  studySessions: StudySession[];
  calendarEvents: CalendarEvent[];
  todos: Todo[];
  assignments: Assignment[];
  theoryTopics: TheoryTopic[];
  dailyGoals: DailyGoal[];
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}
