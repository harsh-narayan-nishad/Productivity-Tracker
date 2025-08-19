export type SessionBreak = { start: number; end?: number };
export type WorkSession = { id: string; start: number; end?: number; breaks: SessionBreak[] };
export type DayLog = { date: string; sessions: WorkSession[]; workSeconds: number };

export type Task = {
  id: string;
  name: string;
  topic: string;
  estMinutes: number;
  frequencyPerWeek: number;
};

export type CompletedTask = { id: string; taskId: string; date: string };

export type WeekPlan = {
  weekOf: string; // Monday date key
  dailyTarget: number;
  assignments: Record<number, string[]>; // 0..6 => task ids
};

const STORAGE_KEYS = {
  AUTH: "auth",
  DAY_LOGS: "day_logs",
  CURRENT_DAY_STATE: "current_day_state",
  TASKS: "tasks",
  COMPLETED: "completed_tasks",
  WEEK_PLANS: "week_plans",
} as const;

export function dateKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function startOfMonday(d: Date = new Date()): Date {
  const day = new Date(d);
  const diff = (day.getDay() + 6) % 7; // 0=Sun => 6
  day.setHours(0, 0, 0, 0);
  day.setDate(day.getDate() - diff);
  return day;
}

export function weekKey(d: Date = new Date()): string {
  return dateKey(startOfMonday(d));
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Auth
export type AuthState = { email: string } | null;
export function getAuth(): AuthState {
  return readJSON<AuthState>(STORAGE_KEYS.AUTH, null);
}
export function setAuth(a: AuthState) {
  if (a) writeJSON(STORAGE_KEYS.AUTH, a);
  else localStorage.removeItem(STORAGE_KEYS.AUTH);
}

// Day logs
export function getDayLogs(): Record<string, DayLog> {
  return readJSON<Record<string, DayLog>>(STORAGE_KEYS.DAY_LOGS, {});
}
export function saveDayLog(log: DayLog) {
  const all = getDayLogs();
  all[log.date] = log;
  writeJSON(STORAGE_KEYS.DAY_LOGS, all);
}

export function addSessionToDay(date: string, session: WorkSession, workSecondsDelta: number) {
  const all = getDayLogs();
  const existing = all[date] || { date, sessions: [], workSeconds: 0 };
  const updated: DayLog = {
    ...existing,
    sessions: [...existing.sessions.filter((s) => s.id !== session.id), session],
    workSeconds: Math.max(0, (existing.workSeconds || 0) + workSecondsDelta),
  };
  all[date] = updated;
  writeJSON(STORAGE_KEYS.DAY_LOGS, all);
}

// Tasks
export function getTasks(): Task[] {
  return readJSON<Task[]>(STORAGE_KEYS.TASKS, []);
}
export function saveTasks(tasks: Task[]) {
  writeJSON(STORAGE_KEYS.TASKS, tasks);
}

// Completed tasks
export function getCompleted(): CompletedTask[] {
  return readJSON<CompletedTask[]>(STORAGE_KEYS.COMPLETED, []);
}
export function addCompleted(taskId: string, date: string) {
  const arr = getCompleted();
  arr.push({ id: crypto.randomUUID(), taskId, date });
  writeJSON(STORAGE_KEYS.COMPLETED, arr);
}

// Week plans
export function getWeekPlan(week: string): WeekPlan | null {
  const plans = readJSON<Record<string, WeekPlan>>(STORAGE_KEYS.WEEK_PLANS, {});
  return plans[week] || null;
}
export function saveWeekPlan(plan: WeekPlan) {
  const plans = readJSON<Record<string, WeekPlan>>(STORAGE_KEYS.WEEK_PLANS, {});
  plans[plan.weekOf] = plan;
  writeJSON(STORAGE_KEYS.WEEK_PLANS, plans);
}
