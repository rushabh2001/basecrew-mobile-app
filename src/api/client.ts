import { API_BASE_URL } from '../config';
import type {
  ClockGeoPayload,
  ClockSession,
  MobileUser,
  NotificationItem,
  OrgUser,
  ProjectItem,
  ReminderItem,
  TaskItem,
  TeamClockRow,
  WorklogUser,
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

let tokenGetter: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;

/** AuthProvider registers the live token so requests always use the latest session. */
export function setApiTokenGetter(getter: () => string | null) {
  tokenGetter = getter;
}

/** Called on 401 so the app can clear a stale session and return to login. */
export function setApiUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

function resolveToken(explicit?: string | null): string | null {
  const raw = (explicit ?? tokenGetter?.() ?? '').trim();
  return raw || null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const token = resolveToken(options.token);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
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
    if (res.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    const rawError = typeof data?.error === 'string' ? data.error : '';
    const looksLikeHtml =
      rawError.startsWith('<!') || rawError.toLowerCase().includes('<html');
    let message = looksLikeHtml ? '' : rawError;
    if (!message) {
      if (res.status === 404) {
        message =
          'API endpoint not found. Deploy the latest BaseCrew web app (push routes), or point this build at a local server that has them.';
      } else {
        message = `Request failed (${res.status})`;
      }
    }
    throw new ApiError(message, res.status, data?.code);
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

export function fetchClock(token?: string | null) {
  return request<ClockSession | null>('/api/clock', { token });
}

export function postClock(
  token: string | null | undefined,
  action: 'clock-in' | 'clock-out' | 'lunch-start' | 'lunch-end',
  geo?: ClockGeoPayload | null,
) {
  return request<ClockSession>('/api/clock', {
    method: 'POST',
    token,
    body: { action, ...(geo ? { geo } : {}) },
  });
}

export function fetchDashboard(token?: string | null) {
  return request<any>('/api/dashboard', { token });
}

export function fetchTasks(token?: string | null, query = '') {
  return request<TaskItem[]>(`/api/tasks${query}`, { token });
}

export type TaskWriteBody = {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  projectId?: string | null;
  dueDate?: string | null;
  estimatedHours?: number | null;
  progress?: number;
  tags?: string[];
  assignedTo?: string | null;
  assigneeIds?: string[];
};

export function createTask(token: string | null | undefined, body: TaskWriteBody & { title: string }) {
  return request<TaskItem>('/api/tasks', { method: 'POST', token, body });
}

export function updateTask(token: string | null | undefined, id: string, body: TaskWriteBody) {
  return request<TaskItem>(`/api/tasks/${id}`, { method: 'PATCH', token, body });
}

export function deleteTask(token: string | null | undefined, id: string) {
  return request<{ success?: boolean }>(`/api/tasks/${id}`, { method: 'DELETE', token });
}

export function clearCompletedAndHold(token?: string | null) {
  return request<{ archived: number; clearedProjects: number }>(
    '/api/tasks/archive-completed',
    { method: 'POST', token },
  );
}

export function fetchProjects(token?: string | null) {
  return request<ProjectItem[]>('/api/projects', { token });
}

export type ProjectWriteBody = {
  name: string;
  description?: string | null;
  status?: string;
  priority?: string;
  type?: string;
  parentId?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  memberIds?: string[];
};

export function createProject(token: string | null | undefined, body: ProjectWriteBody) {
  return request<ProjectItem>('/api/projects', { method: 'POST', token, body });
}

export function updateProject(
  token: string | null | undefined,
  id: string,
  body: Partial<ProjectWriteBody>,
) {
  return request<ProjectItem>(`/api/projects/${id}`, { method: 'PATCH', token, body });
}

export function fetchUsers(token?: string | null, activeOnly = true) {
  return request<OrgUser[]>(`/api/users${activeOnly ? '?active=true' : ''}`, { token });
}

export function fetchNotifications(token?: string | null) {
  return request<NotificationItem[]>('/api/notifications', { token });
}

export function markNotificationsRead(token?: string | null) {
  return request('/api/notifications', {
    method: 'PATCH',
    token,
    body: { readAll: true },
  });
}

export function markNotificationRead(token: string | null | undefined, id: string) {
  return request('/api/notifications', {
    method: 'PATCH',
    token,
    body: { id },
  });
}

export function fetchReminders(token?: string | null, all = false) {
  return request<ReminderItem[]>(`/api/reminders${all ? '?all=true' : ''}`, { token });
}

export function createReminder(
  token: string | null | undefined,
  body: {
    title: string;
    remindAt: string;
    type: 'custom' | 'task' | 'project';
    message?: string;
    emailNotify?: boolean;
    pushNotify?: boolean;
  },
) {
  return request<ReminderItem>('/api/reminders', { method: 'POST', token, body });
}

export function completeReminder(token: string | null | undefined, id: string, isDone = true) {
  return request<ReminderItem>('/api/reminders', {
    method: 'PATCH',
    token,
    body: { id, isDone },
  });
}

export function updateReminder(
  token: string | null | undefined,
  id: string,
  body: { title?: string; message?: string | null; remindAt?: string; isDone?: boolean },
) {
  return request<ReminderItem>(`/api/reminders/${id}`, { method: 'PATCH', token, body });
}

export function deleteReminder(token: string | null | undefined, id: string) {
  return request<{ success: boolean }>(`/api/reminders/${id}`, { method: 'DELETE', token });
}

export function fetchMyProfile(token?: string | null) {
  return request<{
    id: string;
    pushNotificationEnabled?: boolean;
    pushReminderEnabled?: boolean;
    reminderEmailEnabled?: boolean;
    notificationEmailEnabled?: boolean;
  }>('/api/mobile/me', { token });
}

export function updateMyProfile(
  token: string | null | undefined,
  body: {
    pushNotificationEnabled?: boolean;
    pushReminderEnabled?: boolean;
  },
) {
  return request('/api/mobile/me', { method: 'PATCH', token, body });
}

export function registerPushDevice(
  token: string | null | undefined,
  body: { token: string; platform: 'ios' | 'android'; appVersion?: string },
) {
  return request<{ ok: boolean }>('/api/mobile/push/register', {
    method: 'POST',
    token,
    body,
  });
}

export function unregisterPushDevice(
  token: string | null | undefined,
  fcmToken?: string,
) {
  return request<{ ok: boolean }>('/api/mobile/push/register', {
    method: 'DELETE',
    token,
    body: fcmToken ? { token: fcmToken } : {},
  });
}

export function fetchTeamClock(token?: string | null, date?: string) {
  const q = date ? `?date=${date}` : '';
  return request<{ date: string; rows: TeamClockRow[] }>(`/api/clock/team${q}`, { token });
}

export function fetchDailyWorklog(token?: string | null, date?: string) {
  const q = date ? `?date=${date}` : '';
  return request<{ date: string; users: WorklogUser[] }>(
    `/api/reports/daily-worklog${q}`,
    { token },
  );
}

export function fetchMyTimeEntries(token?: string | null, limit = 40) {
  return request<any[]>(`/api/time-entries?limit=${limit}`, { token });
}
