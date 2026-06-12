'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './auth';

/* ─── Types ────────────────────────────────────────────── */
export interface TaskAssignment {
  taskKey: string;       // e.g. "sprint-1-task-0"
  assigneeId: string;    // user id
  assignedAt: string;    // ISO timestamp
}

export interface SprintProgress {
  currentSprintId: number;       // active sprint number
  currentPhaseId: number;        // active phase index
  completedTasks: Record<number, number[]>; // sprintId → task indices
  assignments: TaskAssignment[];
  notes: Record<string, string>; // taskKey → note
}

const DEFAULT_PROGRESS: SprintProgress = {
  currentSprintId: 1,
  currentPhaseId: 0,
  completedTasks: {},
  assignments: [],
  notes: {},
};

/* ─── Server sync helpers ──────────────────────────────── */
const STORAGE_KEY = 'tf_sprint_progress';

async function fetchProgressFromServer(userId: string): Promise<SprintProgress | null> {
  try {
    const res = await fetch(`/api/progress?userId=${userId}`);
    if (!res.ok) return null;
    const { data } = await res.json();
    return data ? { ...DEFAULT_PROGRESS, ...data } : null;
  } catch {
    return null;
  }
}

async function saveProgressToServer(userId: string, progress: SprintProgress): Promise<boolean> {
  try {
    const res = await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, progress }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ─── Store context ────────────────────────────────────── */
interface StoreCtx {
  progress: SprintProgress;
  toggleTask: (sprintId: number, taskIdx: number) => void;
  isTaskDone: (sprintId: number, taskIdx: number) => boolean;
  getSprintProgress: (sprintId: number, totalTasks: number) => { done: number; total: number; pct: number };
  setCurrentSprint: (sprintId: number, phaseId: number) => void;
  assignTask: (taskKey: string, assigneeId: string) => void;
  unassignTask: (taskKey: string) => void;
  getTaskAssignee: (taskKey: string) => string | undefined;
  setTaskNote: (taskKey: string, note: string) => void;
  getTaskNote: (taskKey: string) => string;
  getOverallProgress: () => { totalDone: number; totalTasks: number; pct: number };
  isSyncing: boolean;
}

const StoreContext = createContext<StoreCtx>({
  progress: DEFAULT_PROGRESS,
  toggleTask: () => {},
  isTaskDone: () => false,
  getSprintProgress: () => ({ done: 0, total: 0, pct: 0 }),
  setCurrentSprint: () => {},
  assignTask: () => {},
  unassignTask: () => {},
  getTaskAssignee: () => undefined,
  setTaskNote: () => {},
  getTaskNote: () => '',
  getOverallProgress: () => ({ totalDone: 0, totalTasks: 0, pct: 0 }),
  isSyncing: false,
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<SprintProgress>(DEFAULT_PROGRESS);
  const [hydrated, setHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef(progress);

  // Keep ref in sync
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // ── Hydrate: localStorage first (instant), then server (background) ──
  useEffect(() => {
    // 1. Instant hydrate from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProgress({ ...DEFAULT_PROGRESS, ...parsed });
      }
    } catch { /* ignore */ }
    setHydrated(true);

    // 2. Background fetch from Vercel KV (if user is logged in)
    if (user?.id) {
      fetchProgressFromServer(user.id).then((serverData) => {
        if (serverData) {
          setProgress(serverData);
          // Update localStorage with server truth
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
        }
      });
    }
  }, [user?.id]);

  // ── Persist: localStorage immediately, server debounced ──
  useEffect(() => {
    if (!hydrated) return;

    // Immediate localStorage write
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

    // Debounced server write (500ms)
    if (user?.id) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setIsSyncing(true);
        saveProgressToServer(user.id, progressRef.current).finally(() => {
          setIsSyncing(false);
        });
      }, 500);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [progress, hydrated, user?.id]);

  const toggleTask = useCallback((sprintId: number, taskIdx: number) => {
    setProgress((prev) => {
      const tasks = prev.completedTasks[sprintId] || [];
      const idx = tasks.indexOf(taskIdx);
      const next = idx >= 0 ? tasks.filter((i) => i !== taskIdx) : [...tasks, taskIdx];
      return { ...prev, completedTasks: { ...prev.completedTasks, [sprintId]: next } };
    });
  }, []);

  const isTaskDone = useCallback((sprintId: number, taskIdx: number) => {
    return (progress.completedTasks[sprintId] || []).includes(taskIdx);
  }, [progress.completedTasks]);

  const getSprintProgress = useCallback((sprintId: number, totalTasks: number) => {
    const done = (progress.completedTasks[sprintId] || []).length;
    return { done, total: totalTasks, pct: totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0 };
  }, [progress.completedTasks]);

  const setCurrentSprint = useCallback((sprintId: number, phaseId: number) => {
    setProgress((prev) => ({ ...prev, currentSprintId: sprintId, currentPhaseId: phaseId }));
  }, []);

  const assignTask = useCallback((taskKey: string, assigneeId: string) => {
    setProgress((prev) => {
      const filtered = prev.assignments.filter((a) => a.taskKey !== taskKey);
      return {
        ...prev,
        assignments: [...filtered, { taskKey, assigneeId, assignedAt: new Date().toISOString() }],
      };
    });
  }, []);

  const unassignTask = useCallback((taskKey: string) => {
    setProgress((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.taskKey !== taskKey),
    }));
  }, []);

  const getTaskAssignee = useCallback((taskKey: string) => {
    return progress.assignments.find((a) => a.taskKey === taskKey)?.assigneeId;
  }, [progress.assignments]);

  const setTaskNote = useCallback((taskKey: string, note: string) => {
    setProgress((prev) => ({
      ...prev,
      notes: { ...prev.notes, [taskKey]: note },
    }));
  }, []);

  const getTaskNote = useCallback((taskKey: string) => {
    return progress.notes[taskKey] || '';
  }, [progress.notes]);

  const getOverallProgress = useCallback(() => {
    const totalDone = Object.values(progress.completedTasks).reduce((sum, arr) => sum + arr.length, 0);
    const totalTasks = 148;
    return { totalDone, totalTasks, pct: Math.round((totalDone / totalTasks) * 100) };
  }, [progress.completedTasks]);

  return (
    <StoreContext.Provider
      value={{
        progress,
        toggleTask,
        isTaskDone,
        getSprintProgress,
        setCurrentSprint,
        assignTask,
        unassignTask,
        getTaskAssignee,
        setTaskNote,
        getTaskNote,
        getOverallProgress,
        isSyncing,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
