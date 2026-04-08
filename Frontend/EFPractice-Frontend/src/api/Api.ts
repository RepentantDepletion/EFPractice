import type { Task } from '../types/Task';

const BASE_URL = 'http://localhost:5278/api';

type RawTaskResponse = Record<string, unknown>;

type CreateTaskRequest = Omit<Task, 'id'>;

const parseDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  return new Date('');
};

const normalizeTask = (rawTask: RawTaskResponse): Task => ({
  id: Number(rawTask['id']),
  title: String(rawTask['title']),
  list: String(rawTask['listId']),
  description: String(rawTask['description']),
  priority: Number(rawTask['priority'] ?? 0),
  done: Boolean(rawTask['Done']),
  deadline: parseDate(rawTask['deadline']),
});

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${BASE_URL}/UserTasks/GetAll`);
  const responseData = await response.json();
  return responseData.map(normalizeTask);
}
export async function createTask(taskData: CreateTaskRequest): Promise<Task> {
  const response = await fetch(`${BASE_URL}/UserTasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Title: taskData.title,
      Description: taskData.description,
      Priority: taskData.priority,
      Done: taskData.done,
      Deadline: taskData.deadline,
      ListId: Number(taskData.list),
    }),
  });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Create failed ${response.status}: ${text}`);
    }

    const data = await response.json();
    return normalizeTask(data);
}

export async function updateTask(id: number, task: Task) {
  const response = await fetch(`${BASE_URL}/UserTasks/UpdateDetail/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Title: task.title,
      Description: task.description,
      Priority: task.priority,
      Done: task.done,
      Deadline: task.deadline,
      ListId: Number(task.list),
    }),
  });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Update failed ${response.status}: ${text}`);
    }

    return response;
}

export async function deleteTask(id: number) {
    await fetch(`${BASE_URL}/UserTasks/${id}`, {
        method: 'DELETE',
    });
}

export async function fetchTaskById(id: number) {
    console.log(`Fetching task with ID: ${id}`);
    const response = await fetch(`${BASE_URL}/UserTasks/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch task');
    }
    const data = await response.json();
    return normalizeTask(data);
}

export async function fetchTaskLists() {
    const response = await fetch(`${BASE_URL}/TaskLists`);
    return response.json();
}

export async function createTaskList(name: string) {
    const response = await fetch(`${BASE_URL}/TaskLists`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    });
    return response.json();
}

export async function updateTaskList(
    id: number,
    name?: string,
    items?: Array<{
        ID: number;
        Title?: string;
        Description?: string;
        Priority?: number;
        Done?: boolean;
        Deadline?: Date | null;
        ListID?: number;
    }>
) {
    const response = await fetch(`${BASE_URL}/TaskLists/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id,
            ...(name && { title: name }),
            ...(items && { items }),
        }),
    });
    return response.json();
}

export async function deleteTaskList(id: number) {
    await fetch(`${BASE_URL}/TaskLists/${id}`, {
        method: 'DELETE',
    });
}

export async function fetchTaskListById(id: number) {
    const response = await fetch(`${BASE_URL}/TaskLists/${id}`);
    return response.json();
}