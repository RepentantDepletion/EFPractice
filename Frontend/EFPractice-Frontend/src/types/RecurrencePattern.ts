export const RecurrencePattern = {
    None: 0,
    Daily: 1,
    Weekly: 2,
    Monthly: 3,
    Yearly: 4,
    Custom: 5
} as const;

export type RecurrencePattern =
    (typeof RecurrencePattern)[keyof typeof RecurrencePattern];

export const recurrenceLabels: Record<RecurrencePattern, string> = {
    [RecurrencePattern.None]: 'None',
    [RecurrencePattern.Daily]: 'Daily',
    [RecurrencePattern.Weekly]: 'Weekly',
    [RecurrencePattern.Monthly]: 'Monthly',
    [RecurrencePattern.Yearly]: 'Yearly',
    [RecurrencePattern.Custom]: 'Custom'
};

export function getRecurrenceLabel(value: Number): RecurrencePattern | string {
    return recurrenceLabels[value as RecurrencePattern] ?? RecurrencePattern.None;
}