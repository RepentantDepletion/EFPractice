export type Task = {
  id: number;
  title: string;
  list: number | null;
  description: string;
  done: boolean;
  priority: number;
  deadline: Date;
};
