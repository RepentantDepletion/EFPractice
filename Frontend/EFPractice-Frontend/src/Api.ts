const BASE_URL = 'http://localhost:5278/api';


type task = {
  id: number;
  title: string;
  description: string;
  status: string;
};


export async function fetchTasks() {
    const response = await fetch(`${BASE_URL}/UserTasks/GetAll`);
    return response.json();
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
        body: JSON.stringify(task),
    });
    return response.json();
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
    return response.json();
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

export async function updateTaskList(id: number, name: string) {
    const response = await fetch(`${BASE_URL}/TaskLists/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
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