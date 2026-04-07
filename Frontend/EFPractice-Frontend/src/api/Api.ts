const BASE_URL = 'http://localhost:5278/api';


type ServerTask = {
  ID?: number;
  Id?: number;
  id?: number;
  Title?: string;
  title?: string;
  ListID?: number;
  ListId?: number;
  listID?: number;
  listId?: number;
  Description?: string;
  description?: string;
  Priority?: number;
  priority?: number;
  Done?: boolean;
  done?: boolean;
  Deadline?: string | null;
};

type task = {
  id: number;
  title: string;
  list: string;
  description: string;
  priority: number;
  done: boolean;
  deadline: Date;
};

const normalizeTask = (task: ServerTask): task => ({
  id: task.ID ?? task.Id ?? task.id ?? 0,
  title: task.Title ?? task.title ?? '',
  list: String(task.ListID ?? task.ListId ?? task.listID ?? task.listId ?? ''),
  description: task.Description ?? task.description ?? '',
  priority: task.Priority ?? task.priority ?? 0,
  done: task.Done ?? task.done ?? false,
  deadline: task.Deadline ? new Date(task.Deadline) : new Date(),
});

export async function fetchTasks(): Promise<task[]> {
    const response = await fetch(`${BASE_URL}/UserTasks/GetAll`);
    const data = await response.json();
    return data.map(normalizeTask);
}
export async function createTask(task: task) {
    const response = await fetch(`${BASE_URL}/UserTasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    });
    return response.json();
}

export async function updateTask(id: number, task: task) {
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
        Deadline?: string | null;
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