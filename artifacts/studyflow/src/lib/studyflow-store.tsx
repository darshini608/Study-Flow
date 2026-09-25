import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type Theme = 'light' | 'dark' | 'system';

export type Task = {
  id: string;
  subject: string;
  topic: string;
  title: string;
  priority: Priority;
  minutes: number;
  deadline: string;
  status: TaskStatus;
  isToday: boolean;
};

export type Subject = {
  id: string;
  name: string;
  color: string;
  goalMinutes: number;
  completedMinutes: number;
};

export type Session = {
  id: string;
  taskId: string;
  subject: string;
  minutes: number;
  completedAt: string;
};

export type Settings = {
  studentName: string;
  dailyGoal: number;
  sessionLength: number;
  breakDuration: number;
  theme: Theme;
  reducedMotion: boolean;
  highContrast: boolean;
  speechEnabled: boolean;
};

type Store = {
  tasks: Task[];
  subjects: Subject[];
  sessions: Session[];
  settings: Settings;
  hydrated: boolean;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addSubject: (subject: Omit<Subject, 'id' | 'completedMinutes'>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  addSession: (session: Omit<Session, 'id'>) => void;
  resetDemo: () => void;
};

const today = new Date();
const dateOnly = (offset = 0) => {
  const date = new Date(today);
  date.setDate(today.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export const seedSubjects: Subject[] = [
  { id: 'math', name: 'Engineering Mathematics', color: '#d86f55', goalMinutes: 420, completedMinutes: 210 },
  { id: 'data', name: 'Data Science', color: '#5b8c85', goalMinutes: 360, completedMinutes: 168 },
  { id: 'electronics', name: 'Electronics', color: '#c6994e', goalMinutes: 300, completedMinutes: 120 },
  { id: 'programming', name: 'Programming', color: '#7b6f9e', goalMinutes: 480, completedMinutes: 312 },
];

export const seedTasks: Task[] = [
  { id: 'task-1', subject: 'Engineering Mathematics', topic: 'Differential equations', title: 'Work through Laplace transform examples', priority: 'high', minutes: 35, deadline: dateOnly(), status: 'todo', isToday: true },
  { id: 'task-2', subject: 'Programming', topic: 'Algorithms', title: 'Review sorting complexity notes', priority: 'medium', minutes: 25, deadline: dateOnly(), status: 'in-progress', isToday: true },
  { id: 'task-3', subject: 'Data Science', topic: 'Probability', title: 'Make a one-page Bayes theorem summary', priority: 'medium', minutes: 30, deadline: dateOnly(1), status: 'todo', isToday: false },
  { id: 'task-4', subject: 'Electronics', topic: 'Signals', title: 'Sketch the RC circuit response', priority: 'low', minutes: 20, deadline: dateOnly(2), status: 'todo', isToday: false },
  { id: 'task-5', subject: 'Programming', topic: 'Python', title: 'Finish data cleaning practice set', priority: 'high', minutes: 40, deadline: dateOnly(-1), status: 'done', isToday: false },
];

export const seedSessions: Session[] = [
  { id: 'session-1', taskId: 'task-5', subject: 'Programming', minutes: 40, completedAt: dateOnly(-1) },
  { id: 'session-2', taskId: 'task-old', subject: 'Engineering Mathematics', minutes: 28, completedAt: dateOnly(-2) },
  { id: 'session-3', taskId: 'task-old-2', subject: 'Data Science', minutes: 32, completedAt: dateOnly(-3) },
  { id: 'session-4', taskId: 'task-old-3', subject: 'Programming', minutes: 25, completedAt: dateOnly(-4) },
  { id: 'session-5', taskId: 'task-old-4', subject: 'Electronics', minutes: 24, completedAt: dateOnly(-6) },
];

const defaultSettings: Settings = {
  studentName: 'Maya',
  dailyGoal: 90,
  sessionLength: 25,
  breakDuration: 5,
  theme: 'light',
  reducedMotion: false,
  highContrast: false,
  speechEnabled: false,
};

const initialState = { tasks: seedTasks, subjects: seedSubjects, sessions: seedSessions, settings: defaultSettings };
const storageKey = 'studyflow-local-v1';

const StoreContext = createContext<Store | null>(null);

export function StudyFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setState({ ...initialState, ...JSON.parse(saved) });
    } catch { /* use the friendly demo state when storage is unavailable */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, hydrated]);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const dark = state.settings.theme === 'dark' || (state.settings.theme === 'system' && prefersDark);
    root.classList.toggle('dark', dark);
    root.classList.toggle('reduced-motion', state.settings.reducedMotion);
    root.classList.toggle('high-contrast', state.settings.highContrast);
  }, [state.settings]);

  const value = useMemo<Store>(() => ({
    ...state,
    hydrated,
    addTask: task => setState(prev => ({ ...prev, tasks: [{ ...task, id: `task-${Date.now()}` }, ...prev.tasks] })),
    updateTask: (id, task) => setState(prev => ({ ...prev, tasks: prev.tasks.map(item => item.id === id ? { ...item, ...task } : item) })),
    deleteTask: id => setState(prev => ({ ...prev, tasks: prev.tasks.filter(task => task.id !== id) })),
    toggleTask: id => setState(prev => {
      const current = prev.tasks.find(task => task.id === id);
      if (!current) return prev;
      const status = current.status === 'done' ? 'todo' : 'done';
      return { ...prev, tasks: prev.tasks.map(task => task.id === id ? { ...task, status } : task) };
    }),
    addSubject: subject => setState(prev => ({ ...prev, subjects: [...prev.subjects, { ...subject, id: `subject-${Date.now()}`, completedMinutes: 0 }] })),
    updateSettings: settings => setState(prev => ({ ...prev, settings: { ...prev.settings, ...settings } })),
    addSession: session => setState(prev => {
      const nextSubjects = prev.subjects.map(subject => subject.name === session.subject ? { ...subject, completedMinutes: subject.completedMinutes + session.minutes } : subject);
      return { ...prev, sessions: [{ ...session, id: `session-${Date.now()}` }, ...prev.sessions], subjects: nextSubjects };
    }),
    resetDemo: () => setState(initialState),
  }), [state, hydrated]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStudyFlow() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStudyFlow must be used inside StudyFlowProvider');
  return context;
}

export const formatDate = (value: string) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`));
export const formatLongDate = (value = dateOnly()) => new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(`${value}T12:00:00`));
export const currentDate = () => dateOnly();