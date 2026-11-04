import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppData, Subject, StudySession, CalendarEvent, Todo, Assignment, TheoryTopic, DailyGoal, Notification } from '../types';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface DataContextType {
  data: AppData;
  notifications: Notification[];
  addSubject: (name: string, color: string) => boolean;
  updateSubject: (id: string, name: string, color: string) => void;
  deleteSubject: (id: string) => void;
  addStudySession: (subjectId: string, duration: number) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  addTheoryTopic: (subjectId: string, title: string) => void;
  updateTheoryTopic: (id: string, updates: Partial<TheoryTopic>) => void;
  deleteTheoryTopic: (id: string) => void;
  getStudyHours: (subjectId?: string, period?: 'daily' | 'weekly' | 'monthly') => number;
  getSubjectProgress: (subjectId: string) => number;
  getTodayStudyMinutes: () => number;
  getStreak: () => number;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  setDailyGoal: (targetMinutes: number) => void;
  updateTodayCompletedMinutes: () => void;
}

const defaultData: AppData = {
  subjects: [],
  studySessions: [],
  calendarEvents: [],
  todos: [],
  assignments: [],
  theoryTopics: [],
  dailyGoals: [],
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>(defaultData);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const storageKey = user ? `studyhub_data_${user.id}` : '';
  const notifKey = user ? `studyhub_notifs_${user.id}` : '';

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setData(JSON.parse(saved));
      } else {
        setData(defaultData);
      }
    }
    if (notifKey) {
      const savedNotifs = localStorage.getItem(notifKey);
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      } else {
        setNotifications([]);
      }
    }
  }, [storageKey, notifKey]);

  const saveData = useCallback((newData: AppData) => {
    setData(newData);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(newData));
    }
  }, [storageKey]);

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
    const notif: Notification = { id: uuidv4(), message, type, timestamp: new Date().toISOString(), read: false };
    setNotifications(prev => {
      const updated = [notif, ...prev].slice(0, 50);
      if (notifKey) localStorage.setItem(notifKey, JSON.stringify(updated));
      return updated;
    });
  }, [notifKey]);

  const addSubject = (name: string, color: string): boolean => {
    if (data.subjects.length >= 10) {
      addNotification('Maximum 10 subjects allowed', 'warning');
      return false;
    }
    const subject: Subject = { id: uuidv4(), name, color, createdAt: new Date().toISOString() };
    const newData = { ...data, subjects: [...data.subjects, subject] };
    saveData(newData);
    addNotification(`Subject "${name}" added`, 'success');
    return true;
  };

  const updateSubject = (id: string, name: string, color: string) => {
    const newData = { ...data, subjects: data.subjects.map(s => s.id === id ? { ...s, name, color } : s) };
    saveData(newData);
  };

  const deleteSubject = (id: string) => {
    const newData = {
      ...data,
      subjects: data.subjects.filter(s => s.id !== id),
      studySessions: data.studySessions.filter(s => s.subjectId !== id),
      todos: data.todos.filter(t => t.subjectId !== id),
      assignments: data.assignments.filter(a => a.subjectId !== id),
      theoryTopics: data.theoryTopics.filter(t => t.subjectId !== id),
    };
    saveData(newData);
    addNotification('Subject deleted', 'info');
  };

  const addStudySession = (subjectId: string, duration: number) => {
    const session: StudySession = {
      id: uuidv4(), subjectId, startTime: new Date(Date.now() - duration * 1000).toISOString(),
      endTime: new Date().toISOString(), duration,
    };
    const newData = { ...data, studySessions: [...data.studySessions, session] };
    saveData(newData);
    const hours = (duration / 3600).toFixed(1);
    addNotification(`Study session logged: ${hours} hours`, 'success');
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: uuidv4() };
    const newData = { ...data, calendarEvents: [...data.calendarEvents, newEvent] };
    saveData(newData);
    addNotification(`Event "${event.title}" added to calendar`, 'success');
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    const newData = { ...data, calendarEvents: data.calendarEvents.map(e => e.id === id ? { ...e, ...updates } : e) };
    saveData(newData);
  };

  const deleteCalendarEvent = (id: string) => {
    const newData = { ...data, calendarEvents: data.calendarEvents.filter(e => e.id !== id) };
    saveData(newData);
  };

  const addTodo = (todo: Omit<Todo, 'id' | 'createdAt'>) => {
    const newTodo: Todo = { ...todo, id: uuidv4(), createdAt: new Date().toISOString() };
    const newData = { ...data, todos: [...data.todos, newTodo] };
    saveData(newData);
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    const newData = { ...data, todos: data.todos.map(t => t.id === id ? { ...t, ...updates } : t) };
    saveData(newData);
  };

  const deleteTodo = (id: string) => {
    const newData = { ...data, todos: data.todos.filter(t => t.id !== id) };
    saveData(newData);
  };

  const addAssignment = (assignment: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAssignment: Assignment = { ...assignment, id: uuidv4(), createdAt: new Date().toISOString() };
    const newData = { ...data, assignments: [...data.assignments, newAssignment] };
    saveData(newData);
    addNotification(`Assignment "${assignment.title}" added`, 'success');
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    const newData = { ...data, assignments: data.assignments.map(a => {
      if (a.id === id) {
        const updated = { ...a, ...updates };
        if (updates.status === 'submitted' && !a.submittedAt) {
          updated.submittedAt = new Date().toISOString();
        }
        return updated;
      }
      return a;
    })};
    saveData(newData);
  };

  const deleteAssignment = (id: string) => {
    const newData = { ...data, assignments: data.assignments.filter(a => a.id !== id) };
    saveData(newData);
  };

  const addTheoryTopic = (subjectId: string, title: string) => {
    const topic: TheoryTopic = { id: uuidv4(), subjectId, title, completed: false };
    const newData = { ...data, theoryTopics: [...data.theoryTopics, topic] };
    saveData(newData);
  };

  const updateTheoryTopic = (id: string, updates: Partial<TheoryTopic>) => {
    const newData = { ...data, theoryTopics: data.theoryTopics.map(t => t.id === id ? { ...t, ...updates } : t) };
    saveData(newData);
  };

  const deleteTheoryTopic = (id: string) => {
    const newData = { ...data, theoryTopics: data.theoryTopics.filter(t => t.id !== id) };
    saveData(newData);
  };

  const getStudyHours = (subjectId?: string, period?: 'daily' | 'weekly' | 'monthly'): number => {
    const now = new Date();
    let sessions = data.studySessions;
    if (subjectId) sessions = sessions.filter(s => s.subjectId === subjectId);
    if (period) {
      const start = new Date();
      if (period === 'daily') start.setHours(0, 0, 0, 0);
      else if (period === 'weekly') start.setDate(start.getDate() - start.getDay());
      else if (period === 'monthly') start.setDate(1);
      sessions = sessions.filter(s => new Date(s.startTime) >= start);
    }
    return sessions.reduce((sum, s) => sum + s.duration, 0) / 3600;
  };

  const getSubjectProgress = (subjectId: string): number => {
    const topics = data.theoryTopics.filter(t => t.subjectId === subjectId);
    if (topics.length === 0) return 0;
    const completed = topics.filter(t => t.completed).length;
    return Math.round((completed / topics.length) * 100);
  };

  const getTodayStudyMinutes = (): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return data.studySessions
      .filter(s => new Date(s.startTime) >= today)
      .reduce((sum, s) => sum + s.duration, 0) / 60;
  };

  const getStreak = (): number => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const hasSession = data.studySessions.some(s => {
        const sDate = new Date(s.startTime);
        return sDate >= day && sDate < nextDay;
      });
      if (hasSession) streak++;
      else if (i > 0) break;
      else break;
    }
    return streak;
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      if (notifKey) localStorage.setItem(notifKey, JSON.stringify(updated));
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    if (notifKey) localStorage.setItem(notifKey, JSON.stringify([]));
  };

  const setDailyGoal = (targetMinutes: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newData = { ...data };
    const goals = [...(newData.dailyGoals || [])];
    const idx = goals.findIndex(g => g.date === today);
    if (idx >= 0) {
      goals[idx] = { ...goals[idx], targetMinutes };
    } else {
      goals.push({ id: today, date: today, targetMinutes, completedMinutes: 0 });
    }
    newData.dailyGoals = goals;
    saveData(newData);
    addNotification(`Daily goal set to ${targetMinutes} minutes`, 'success');
  };

  const updateTodayCompletedMinutes = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayMinutes = getTodayStudyMinutes();
    const newData = { ...data };
    const goals = [...(newData.dailyGoals || [])];
    const idx = goals.findIndex(g => g.date === today);
    if (idx >= 0) {
      goals[idx] = { ...goals[idx], completedMinutes: todayMinutes };
    } else {
      goals.push({ id: today, date: today, targetMinutes: 120, completedMinutes: todayMinutes });
    }
    newData.dailyGoals = goals;
    saveData(newData);
  };

  return (
    <DataContext.Provider value={{
      data, notifications, addSubject, updateSubject, deleteSubject,
      addStudySession, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
      addTodo, updateTodo, deleteTodo, addAssignment, updateAssignment, deleteAssignment,
      addTheoryTopic, updateTheoryTopic, deleteTheoryTopic,
      getStudyHours, getSubjectProgress, getTodayStudyMinutes, getStreak,
      markNotificationRead, clearNotifications, setDailyGoal, updateTodayCompletedMinutes,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
