export type MobileUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  organizationId: string | null;
};

export type ClockSession = {
  id: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  lunchStart: string | null;
  lunchEnd: string | null;
  notes: string | null;
  clockInLat?: number | null;
  clockInLng?: number | null;
  clockInLabel?: string | null;
  clockInSource?: string | null;
  clockOutLat?: number | null;
  clockOutLng?: number | null;
  clockOutLabel?: string | null;
  clockOutSource?: string | null;
  lunchBreaks?: Array<{ id: string; startAt: string; endAt: string | null }>;
};

export type TaskItem = {
  id: string;
  title: string;
  status: string;
  priority?: string | null;
  dueDate?: string | null;
  archivedAt?: string | null;
  description?: string | null;
  project?: { id: string; name: string } | null;
  totalTrackedSeconds?: number;
};

export type ProjectItem = {
  id: string;
  name: string;
  status?: string | null;
  type?: string | null;
  hasAccess?: boolean;
  progress?: number;
  totalTasks?: number;
  completedTasks?: number;
  _count?: { tasks?: number };
  clearedAt?: string | null;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
};

export type ReminderItem = {
  id: string;
  title: string;
  message: string | null;
  remindAt: string;
  type: string;
  isDone: boolean;
  emailNotify?: boolean;
  taskId?: string | null;
  projectId?: string | null;
};

export type TeamClockRow = {
  userId: string;
  name: string;
  role: string;
  departmentType: string | null;
  clockIn: string | null;
  lunchStart: string | null;
  lunchEnd: string | null;
  lunchCount: number;
  clockOut: string | null;
  clockInLabel?: string | null;
  clockOutLabel?: string | null;
};

export type WorklogUser = {
  userId: string;
  name: string;
  email: string;
  department: string | null;
  totalHours: number;
  totalSeconds: number;
  entries: Array<{
    entryId: string;
    taskTitle: string;
    projectName: string | null;
    hours: number;
    durationSeconds: number;
    running: boolean;
  }>;
};

export type ClockGeoPayload = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  label?: string | null;
  source?: string;
};
