import { RecurrencePattern } from '../types/RecurrencePattern';
import type { Task } from '../types/Task';
import { format } from 'date-fns';

const BASE_URL = 'http://localhost:5278/api';

type RawTaskResponse = Record<string, unknown>;

type CreateTaskRequest = Omit<Task, 'id'>;

const withCredentials = (init: RequestInit = {}): RequestInit => ({
  ...init,
  credentials: 'include',
});


const parseDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  return new Date('');
};

const parseList = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  return String(value);
};

const normalizeTask = (rawTask: RawTaskResponse): Task => ({
  id: Number(rawTask['id']),
  title: String(rawTask['title']),
  list: parseList(rawTask['ListId'] ?? rawTask['listID'] ?? rawTask['listId']),
  description: String(rawTask['description']),
  priority: Number(rawTask['priority'] ?? 0),
  done: Boolean(rawTask['done']),
  deadline: parseDate(rawTask['deadline']),
  recurrence: Number(rawTask['recurrence'] ?? RecurrencePattern.None) as RecurrencePattern,
});

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${BASE_URL}/UserTasks/GetAll`, withCredentials());
  const responseData = await response.json();
  return responseData.map(normalizeTask);
}
export async function createTask(taskData: CreateTaskRequest): Promise<Task> {
  const response = await fetch(`${BASE_URL}/UserTasks`, withCredentials({
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
      ListId: taskData.list === null || taskData.list === '' ? null : Number(taskData.list),
      Recurrence: Number(taskData.recurrence),
    }),
  }));

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Create failed ${response.status}: ${text}`);
    }

    const data = await response.json();
    return normalizeTask(data);
}

export async function updateTask(id: number, task: Task) {
  const response = await fetch(`${BASE_URL}/UserTasks/UpdateDetail/${id}`, withCredentials({
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Title: task.title,
      Description: task.description,
      Priority: task.priority,
      Done: task.done,
      Deadline: format(task.deadline, 'yyyy-MM-dd'),
      ListId: task.list === null || task.list === '' ? null : Number(task.list),
      Recurrence: Number(task.recurrence),
    }),
  }));

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Update failed ${response.status}: ${text}`);
    }

    return response;
}

export async function deleteTask(id: number) {
  await fetch(`${BASE_URL}/UserTasks/${id}`, withCredentials({
        method: 'DELETE',
  }));
}

export async function fetchTaskById(id: number) {
    console.log(`Fetching task with ID: ${id}`);
    const response = await fetch(`${BASE_URL}/UserTasks/${id}`, withCredentials());
    if (!response.ok) {
        throw new Error('Failed to fetch task');
    }
    const data = await response.json();
    return normalizeTask(data);
}

export async function completeTask(id: number) {
    const response = await fetch(`${BASE_URL}/UserTasks/Complete/${id}`, withCredentials({
        method: 'PUT',
    }));

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Complete failed ${response.status}: ${text}`);
  }

  return;
}


export async function fetchTaskLists() {
    const response = await fetch(`${BASE_URL}/TaskLists`, withCredentials());
    return response.json();
}

export async function createTaskList(name: string) {
  const response = await fetch(`${BASE_URL}/TaskLists`, withCredentials({
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    body: JSON.stringify({ Title: name }),
  }));

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Create list failed ${response.status}: ${text}`);
  }

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
    const response = await fetch(`${BASE_URL}/TaskLists/${id}`, withCredentials({
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id,
            ...(name && { title: name }),
            ...(items && { items }),
        }),
    }));
    return response.json();
}

export async function deleteTaskList(id: number) {
  await fetch(`${BASE_URL}/TaskLists/${id}`, withCredentials({
        method: 'DELETE',
  }));
}

export async function fetchTaskListById(id: number) {
    const response = await fetch(`${BASE_URL}/TaskLists/${id}`, withCredentials());
    return response.json();
}

export async function completeTaskList(id: number) {
    const response = await fetch(`${BASE_URL}/TaskLists/${id}/complete`, withCredentials({
        method: 'POST',
    }));

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Complete list failed ${response.status}: ${text}`);
  }

  return;
}

export async function logout() {
  const response = await fetch(`${BASE_URL}/Users/logout`, withCredentials({
    method: 'POST',
  }));

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Logout failed ${response.status}: ${text}`);
  }
}