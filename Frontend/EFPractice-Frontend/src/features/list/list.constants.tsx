import { recurrenceLabels, type RecurrencePattern } from '../../shared/types/RecurrencePattern';

export const LIST_TASK_SORT_OPTIONS = [
	'Default',
	'Title',
	'Priority',
	'Deadline',
	'Overdue',
	'Completed',
] as const;

export type ListTaskSortMode = (typeof LIST_TASK_SORT_OPTIONS)[number];

export const LIST_RECURRENCE_OPTIONS: Array<{ value: RecurrencePattern; label: string }> = Object.entries(recurrenceLabels).map(
	([value, label]) => ({
		value: Number(value) as RecurrencePattern,
		label,
	})
);