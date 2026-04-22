export type TaskSortMode = 'Default' | 'Title' | 'Priority' | 'Deadline';

export const TASK_CARD_CLICK_DELAY_MS = 240;
export const LIST_CARD_CLICK_DELAY_MS = 240;

export const TASK_SORT_OPTIONS: TaskSortMode[] = ['Default', 'Title', 'Priority', 'Deadline'];

export const DASHBOARD_NAV_LINKS = [
    { label: 'Home', path: '/home' },
    { label: 'Settings', path: '/settings' },
    { label: 'Analytics', path: '/analytics' },
] as const;

export const RECURRENCE_OPTIONS = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Daily' },
    { value: 2, label: 'Weekly' },
    { value: 3, label: 'Monthly' },
    { value: 4, label: 'Yearly' },
    { value: 5, label: 'Custom' },
] as const;