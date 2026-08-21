import { API_BASE_URL } from '../config';
import type {
  ClockGeoPayload,
  ClockSession,
  MobileUser,
  NotificationItem,
  TaskItem,
} from './types';

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || 'Invalid response' };
  }

  if (!res.ok) {
    throw new ApiError(
      data?.error || `Request failed (${res.status})`,
      res.status,
      data?.code,
    );
  }
  return data as T;
}

export function login(input: {
  email: string;
  password: string;
  organizationCode: string;
}) {
  return request<{
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: MobileUser;
  }>('/api/mobile/auth/login', { method: 'POST', body: input });
}

export function fetchMe(token: string) {
  return request<{ user?: MobileUser } & MobileUser>('/api/mobile/me', { token });
}

export function fetchClock(token: string) {
  return request<ClockSession | null>('/api/clock', { token });
}

export function postClock(
  token: string,
  action: 'clock-in' | 'clock-out' | 'lunch-start' | 'lunch-end',
  geo?: ClockGeoPayload | null,
) {
  return request<ClockSession>('/api/clock', {
    method: 'POST',
    token,
    body: { action, ...(geo ? { geo } : {}) },
  });
}

export function fetchDashboard(token: string) {
  return request<any>('/api/dashboard', { token });
}

export function fetchTasks(token: string) {
  return request<TaskItem[]>('/api/tasks', { token });
}

export function fetchNotifications(token: string) {
  return request<NotificationItem[]>('/api/notifications', { token });
}

export function markNotificationsRead(token: string) {
  return request('/api/notifications', {
    method: 'PATCH',
    token,
    body: { readAll: true },
  });
}
