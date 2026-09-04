import type { TaskItem } from '../api/types';

export type TaskGroupKey = 'overdue' | 'today' | 'in_progress' | 'hold' | 'upcoming' | 'later' | 'completed';

export type TaskSection = {
  key: TaskGroupKey;
  title: string;
  data: TaskItem[];
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function groupTasks(tasks: TaskItem[]): TaskSection[] {
  const now = new Date();
  const today = startOfDay(now);

  const buckets: Record<TaskGroupKey, TaskItem[]> = {
    overdue: [],
    today: [],
    in_progress: [],
    hold: [],
    upcoming: [],
    later: [],
    completed: [],
  };

  for (const task of tasks) {
    if (task.status === 'completed') {
      buckets.completed.push(task);
      continue;
    }

    if (task.status === 'hold') {
      buckets.hold.push(task);
      continue;
    }

    if (task.status === 'in_progress') {
      buckets.in_progress.push(task);
      continue;
    }

    if (task.dueDate) {
      const due = startOfDay(new Date(task.dueDate));
      if (due < today) {
        buckets.overdue.push(task);
      } else if (isSameDay(due, today)) {
        buckets.today.push(task);
      } else {
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);
        if (diffDays <= 7) buckets.upcoming.push(task);
        else buckets.later.push(task);
      }
      continue;
    }

    buckets.later.push(task);
  }

  const sections: TaskSection[] = [];
  if (buckets.overdue.length) sections.push({ key: 'overdue', title: 'Overdue', data: buckets.overdue });
  if (buckets.today.length) sections.push({ key: 'today', title: 'Today', data: buckets.today });
  if (buckets.in_progress.length) {
    sections.push({ key: 'in_progress', title: 'In progress', data: buckets.in_progress });
  }
  if (buckets.hold.length) sections.push({ key: 'hold', title: 'On hold', data: buckets.hold });
  if (buckets.upcoming.length) sections.push({ key: 'upcoming', title: 'Upcoming', data: buckets.upcoming });
  if (buckets.later.length) sections.push({ key: 'later', title: 'Later', data: buckets.later });
  if (buckets.completed.length) {
    sections.push({ key: 'completed', title: 'Completed', data: buckets.completed });
  }
  return sections;
}

export function todayFocusTasks(tasks: TaskItem[], limit = 5): TaskItem[] {
  const sections = groupTasks(tasks);
  const focus: TaskItem[] = [];
  for (const key of ['overdue', 'today', 'in_progress'] as TaskGroupKey[]) {
    const section = sections.find(s => s.key === key);
    if (section) focus.push(...section.data);
    if (focus.length >= limit) break;
  }
  return focus.slice(0, limit);
}

export function formatDueLabel(dueDate: string | null | undefined): string | null {
  if (!dueDate) return null;
  const due = startOfDay(new Date(dueDate));
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDay(due, today)) return 'Today';
  if (isSameDay(due, tomorrow)) return 'Tomorrow';
  return due.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function greetingForHour(hour = new Date().getHours()): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatTodayLong(): string {
  return new Date().toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
