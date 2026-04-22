import type { RecurrencePattern } from "./RecurrencePattern";

export type Task = {
  id: number;
  title: string;
  list: string | null;
  description: string;
  done: boolean;
  priority: number;
  deadline: Date;
  recurrence: RecurrencePattern;
};