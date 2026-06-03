/**
 * Notely API client — thin wrapper around the FastAPI backend.
 * Base URL is read from VITE_API_URL env var (defaults to empty string for relative paths).
 */

const BASE = "";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...init?.headers },
      ...init,
    });
  } catch (error) {
    // Graceful error throw for NetworkError / backend down
    throw new Error("Unable to reach the backend API. Please make sure the server is running.");
  }
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Priority = "high" | "medium" | "low";

export interface Task {
  id: number;
  title: string;
  meta: string | null;
  priority: Priority;
  folder: string | null;
  is_done: boolean;
  due_at: string | null;
  user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  meta?: string;
  priority?: Priority;
  folder?: string;
  is_done?: boolean;
  due_at?: string;
  user_id?: number;
}

export interface TaskUpdate {
  title?: string;
  meta?: string;
  priority?: Priority;
  folder?: string;
  is_done?: boolean;
  due_at?: string;
}

export interface ScheduleEvent {
  id: number;
  time: string;
  title: string;
  room: string | null;
  color: string | null;
  day_of_week: number;
  is_current: boolean;
  is_deadline: boolean;
  user_id: number | null;
  created_at: string;
}

// ─── Tasks API ────────────────────────────────────────────────────────────────

export const tasksApi = {
  list: (params?: { user_id?: number; priority?: string; is_done?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.user_id != null) qs.set("user_id", String(params.user_id));
    if (params?.priority) qs.set("priority", params.priority);
    if (params?.is_done != null) qs.set("is_done", String(params.is_done));
    const query = qs.toString();
    return apiFetch<Task[]>(`/api/tasks${query ? `?${query}` : ""}`);
  },

  get: (id: number) => apiFetch<Task>(`/api/tasks/${id}`),

  create: (data: TaskCreate) =>
    apiFetch<Task>("/api/tasks", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: TaskUpdate) =>
    apiFetch<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: number) => apiFetch<void>(`/api/tasks/${id}`, { method: "DELETE" }),
};

// ─── Schedule API ─────────────────────────────────────────────────────────────

export const scheduleApi = {
  list: (params?: { user_id?: number; day_of_week?: number }) => {
    const qs = new URLSearchParams();
    if (params?.user_id != null) qs.set("user_id", String(params.user_id));
    if (params?.day_of_week != null) qs.set("day_of_week", String(params.day_of_week));
    const query = qs.toString();
    return apiFetch<ScheduleEvent[]>(`/api/schedule${query ? `?${query}` : ""}`);
  },
};

// ─── Users API ────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  display_name: string;
  avatar_url: string | null;
  is_premium: boolean;
  created_at: string;
}

export const usersApi = {
  get: (id: number) => apiFetch<User>(`/api/users/${id}`),
  upgrade: (id: number) =>
    apiFetch<User>(`/api/users/${id}/upgrade`, { method: "POST" }),
};
