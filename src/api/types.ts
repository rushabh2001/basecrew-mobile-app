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
  project?: { id: string; name: string } | null;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
};

export type ClockGeoPayload = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  label?: string | null;
  source?: string;
};
