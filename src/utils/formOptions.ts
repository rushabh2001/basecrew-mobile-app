/** Shared option lists mirrored from the desktop task / project forms. */

export const TASK_STATUSES = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'review', label: 'Review' },
  { value: 'hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
] as const;

export const TASK_PRIORITIES = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;

export const PROJECT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'in-review', label: 'In review' },
  { value: 'on-hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
] as const;

export const PROJECT_PRIORITIES = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;

export const PROJECT_TYPES = [
  { value: 'cms', label: 'CMS Website' },
  { value: 'custom-website', label: 'Custom Website' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'other', label: 'Other' },
] as const;

export function toDateOnlyIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function shiftDateOnly(iso: string, deltaDays: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return toDateOnlyIso(d);
}

export function formatDateOnlyLabel(iso: string) {
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
