import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTasks, fetchTaskLists, fetchTaskById, updateTask, deleteTask, createTask } from '../api/Api.ts'
import type { Task } from '../types/Task.ts'
import TaskView from '../components/TaskView.tsx'
import TaskEditForm from '../components/TaskEditForm.tsx'

import '../styles/App.css'
import '../styles/Dashboard.css'

type list = {
    id: number;
    title: string;
}

function Dashboard() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [lists, setLists] = useState<list[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState<Task | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedLoading, setSelectedLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
    const [dropTargetListId, setDropTargetListId] = useState<number | null>(null);
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [newTaskData, setNewTaskData] = useState<Task | null>(null);

    const normalizeTask = (task: any): Task => ({
        ...task,
        deadline: new Date(task.deadline),
    });

    useEffect(() => {
        async function loadTasks() {
            try {
                const data = await fetchTasks();
                setTasks(data.map(normalizeTask));
            } catch {
                setError('Failed to load tasks');
            } finally {
                setLoading(false);
            }
        }

        loadTasks();
    }, []);

    useEffect(() => {
        async function loadLists() {
            try {
                const data = await fetchTaskLists();
                setLists(data.lists);
            } catch {
                setError('Failed to load lists');
            }
        }

        loadLists();
    }, []);

    const handleSelectTask = async (id: number) => {
        setSelectedLoading(true);
        setError(null);

        try {
            const task = await fetchTaskById(id);
            setSelectedTask(normalizeTask(task));
            setFormData(null);
            setIsEditing(false);
        } catch {
            setError('Failed to load task details');
        } finally {
            setSelectedLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!selectedTask) return;

        if (!isEditing) {
            setFormData({ ...selectedTask });
            setIsEditing(true);
            return;
        }

        if (!formData) return;

        try {
            await updateTask(formData.id, formData);
            setSelectedTask(formData);
            setIsEditing(false);
        } catch {
            alert('Failed to save task');
        }
    };

    const handleDeleteSelectedTask = async () => {
        if (!selectedTask) return;

        try {
            await deleteTask(selectedTask.id);
            setTasks((current) => current.filter((task) => task.id !== selectedTask.id));
            setSelectedTask(null);
            setFormData(null);
            setIsEditing(false);
        } catch {
            setError('Failed to delete task');
        }
    };

    const handleTaskDragStart = (event: React.DragEvent<HTMLButtonElement>, taskId: number) => {
        event.dataTransfer.setData('text/plain', String(taskId));
        event.dataTransfer.effectAllowed = 'move';

        const clone = event.currentTarget.cloneNode(true) as HTMLElement;
        clone.className += ' drag-preview';
        document.body.appendChild(clone);

        event.dataTransfer.setDragImage(clone, clone.offsetWidth / 2, clone.offsetHeight / 2);
        setDraggedTaskId(taskId);
    };

    const handleTaskDragEnd = () => {
        setDraggedTaskId(null);
        setDropTargetListId(null);
    };

    const handleListDragOver = (event: React.DragEvent<HTMLButtonElement>, listId: number) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';

        if (draggedTaskId !== null) {
            setDropTargetListId(listId);
        }
    };

    const handleListDragLeave = () => {
        setDropTargetListId(null);
    };

    const handleTaskDropOnList = async (event: React.DragEvent<HTMLButtonElement>, listId: number) => {
        event.preventDefault();

        const droppedTaskId = Number(event.dataTransfer.getData('text/plain') || draggedTaskId);
        if (!Number.isFinite(droppedTaskId)) {
            setDropTargetListId(null);
            return;
        }

        const taskToMove = tasks.find((task) => task.id === droppedTaskId);
        if (!taskToMove) {
            setDropTargetListId(null);
            return;
        }

        if (taskToMove.list === String(listId)) {
            setDropTargetListId(null);
            return;
        }

        const updatedTask: Task = {
            ...taskToMove,
            list: String(listId),
        };

        try {
            await updateTask(taskToMove.id, updatedTask);
            setTasks((current) => current.map((task) => (task.id === updatedTask.id ? updatedTask : task)));

            if (selectedTask?.id === updatedTask.id) {
                setSelectedTask(updatedTask);
                if (formData?.id === updatedTask.id) {
                    setFormData(updatedTask);
                }
            }
        } catch {
            setError('Failed to move task to list');
        } finally {
            setDropTargetListId(null);
            setDraggedTaskId(null);
        }
    };

    const handleAddTaskClick = () => {
        const newTask: Task = {
            id: 0,
            title: '',
            list: null,
            description: '',
            priority: 0,
            done: false,
            deadline: new Date(),
        };
        setSelectedTask(null);
        setFormData(null);
        setIsEditing(false);
        setIsCreatingTask(true);
        setNewTaskData(newTask);
    };

    const handleCancelAddTask = () => {
        setIsCreatingTask(false);
        setNewTaskData(null);
    };

    const handleSaveNewTask = async () => {
        if (!newTaskData) return;

        try {
            const { id, ...payload } = newTaskData;
            await createTask(payload);
            const refreshedTasks = await fetchTasks();
            setTasks(refreshedTasks.map(normalizeTask));
            setIsCreatingTask(false);
            setNewTaskData(null);
        } catch {
            setError('Failed to create task');
        }
    };

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="dashboard-header">
                    <h1>Task Manager</h1>
                </div>

                <main className="task-details-panel">
                    {selectedLoading ? (
                        <p>Loading task details…</p>
                    ) : isCreatingTask && newTaskData ? (
                        <>
                            <div className="task-details-header">
                                <button className="close-button" onClick={handleCancelAddTask}>
                                    Close
                                </button>
                            </div>

                            <h2>Create New Task</h2>
                            <TaskEditForm formData={newTaskData} setFormData={setNewTaskData} listOptions={lists} />

                            <div className="button-row">
                                <button onClick={handleSaveNewTask}>Create</button>
                                <button className="cancel-button" onClick={handleCancelAddTask}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : selectedTask ? (
                        <>
                            <div className="task-details-header">
                                <button className="close-button" onClick={() => {
                                    setSelectedTask(null);
                                    setFormData(null);
                                    setIsEditing(false);
                                }}>
                                    Close
                                </button>
                            </div>

                            {isEditing && formData ? (
                                <TaskEditForm formData={formData} setFormData={setFormData} listOptions={lists} />
                            ) : (
                                <TaskView task={selectedTask} lists={lists} />
                            )}

                            <div className="button-row">
                                <button onClick={handleEdit}>
                                    {isEditing ? 'Save' : 'Edit'}
                                </button>
                                {isEditing && (
                                    <button onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </button>
                                )}
                                {!isEditing && (
                                    <button className="delete-button" onClick={() => void handleDeleteSelectedTask()}>
                                        Delete
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <p>Select a task from the list to view its details here.</p>
                    )}

                    {error && <p className="error-message">{error}</p>}
                </main>
            </aside>

            <div className="dashboard-main">
                <section className="navigation-panel">
                    <h2>Navigation Panel</h2>
                    <ul>
                        <button className='navigation-buttons' onClick={() => navigate('/')}>Home</button>
                        <button className='navigation-buttons' onClick={() => navigate('/settings')}>Settings</button>
                    </ul>

                    <div className="task-container">
                        <div className="task-list">
                            <div className="task-list-header-row">
                                <h3>Tasks</h3>
                                <button className='add-task-button' onClick={handleAddTaskClick}>Add Task</button>
                            </div>
                            {loading ? (
                                <p>Loading tasks…</p>
                            ) : tasks.length === 0 ? (
                                <p>No tasks available. Please add some tasks.</p>
                            ) : (
                                <ul className="task-list">
                                    {tasks.map((task) => {
                                        const taskListId = task.list;
                                        const listName = taskListId === null
                                            ? 'No List'
                                            : lists.find(list => list.id === parseInt(taskListId, 10))?.title || 'Unknown List';
                                        return (
                                            <li key={task.id}>
                                                <button
                                                    className='task-card'
                                                    onClick={() => handleSelectTask(task.id)}
                                                    draggable
                                                    onDragStart={(event) => handleTaskDragStart(event, task.id)}
                                                    onDragEnd={handleTaskDragEnd}
                                                >
                                                    <div>{task.title}</div>
                                                    <div style={{ fontSize: '0.85em', opacity: 0.7 }}>{listName}</div>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className='list-container'>
                        <div className='list-record'>
                            <h3>Task Lists</h3>
                            {lists.length === 0 ? (
                                <p>No lists available. Please add some lists.</p>
                            ) : (
                                <ul className='list-record'>
                                    {lists.map((list) => (
                                        <li key={list.id}>
                                            <button
                                                className={`task-card ${dropTargetListId === list.id ? 'drop-target' : ''}`}
                                                onClick={() => navigate(`/lists/${list.id}`)}
                                                onDragOver={(event) => handleListDragOver(event, list.id)}
                                                onDragLeave={handleListDragLeave}
                                                onDrop={(event) => void handleTaskDropOnList(event, list.id)}
                                            >
                                                {list.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Dashboard