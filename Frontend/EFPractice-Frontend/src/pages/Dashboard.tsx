import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTasks, fetchTaskLists, fetchTaskById, updateTask, deleteTask, createTask, createTaskList, completeTask, fetchTaskListById } from '../api/Api.ts'
import type { Task } from '../types/Task.ts'
import TaskView from '../components/TaskView.tsx'
import TaskEditForm from '../components/TaskEditForm.tsx'

import '../styles/App.css'
import '../styles/Dashboard.css'

type list = {
    id: number;
    title: string;
}

type TaskSortMode = 'Default' | 'Title' | 'Priority' | 'Deadline';
const TASK_CARD_CLICK_DELAY_MS = 240;

function Dashboard() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [lists, setLists] = useState<list[]>([]);
    const [recurrenceType] = useState([
        { value: 0, label: 'None' },
        { value: 1, label: 'Daily' },
        { value: 2, label: 'Weekly' },
        { value: 3, label: 'Monthly' },
        { value: 4, label: 'Yearly' },
        { value: 5, label: 'Custom' }
    ]);
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
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState<TaskSortMode>('Default');
    const [viewportSize, setViewportSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const dragPreviewRef = useRef<HTMLElement | null>(null);
    const taskClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const shownTasksCount = (width: number, height: number) => {
        const widthCapacity = width < 600 ? 2 : width < 1024 ? 4 : 8;
        const heightMultiplier = height < 700 ? 1 : height < 900 ? 2 : 3;

        return widthCapacity * heightMultiplier;
    };


    const cleanupDragPreview = () => {
        if (dragPreviewRef.current) {
            dragPreviewRef.current.remove();
            dragPreviewRef.current = null;
        }
    };

    const clearTaskClickTimeout = () => {
        if (taskClickTimeoutRef.current !== null) {
            clearTimeout(taskClickTimeoutRef.current);
            taskClickTimeoutRef.current = null;
        }
    };

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
            refreshTask(formData.id);
        } catch {
            alert('Failed to save task');
        }
    };

    const handleDeleteSelectedTask = async () => {
        if (!selectedTask) return;

        try {
            await deleteTask(selectedTask.id);
            refreshTasks();
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

        cleanupDragPreview();

        const clone = event.currentTarget.cloneNode(true) as HTMLElement;
        clone.classList.add('drag-preview');
        clone.style.width = `${event.currentTarget.offsetWidth}px`;
        document.body.appendChild(clone);

        dragPreviewRef.current = clone;

        event.dataTransfer.setDragImage(clone, clone.offsetWidth / 2, clone.offsetHeight / 2);
        setDraggedTaskId(taskId);
    };

    const handleTaskDragEnd = () => {
        setDraggedTaskId(null);
        setDropTargetListId(null);
        cleanupDragPreview();
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
            refreshTask(taskToMove.id);

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
            cleanupDragPreview();
        }
    };

    useEffect(() => {
        return () => {
            cleanupDragPreview();
            clearTaskClickTimeout();
        };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setViewportSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleAddTaskClick = () => {
        const newTask: Task = {
            id: 0,
            title: '',
            list: null,
            description: '',
            priority: 0,
            done: false,
            deadline: new Date(),
            recurrence: 0,
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
            refreshTasks();
            setIsCreatingTask(false);
            setNewTaskData(null);
        } catch {
            setError('Failed to create task');
        }
    };

    const handleAddListClick = () => {
        setIsCreatingList(true);
        setNewListTitle('');
    };

    const handleCancelAddList = () => {
        setIsCreatingList(false);
        setNewListTitle('');
    };

    const handleSaveNewList = async () => {
        if (!newListTitle.trim()) {
            setError('List name cannot be empty');
            return;
        }

        try {
            await createTaskList(newListTitle.trim());
            refreshLists();
            setIsCreatingList(false);
            setNewListTitle('');
        } catch {
            setError('Failed to create list');
        }
    };

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredTasks = normalizedQuery.length === 0
        ? tasks
        : tasks.filter((task) => {
            const taskListId = task.list;
            const listName = taskListId === null
                ? 'no list'
                : lists.find((list) => list.id === parseInt(taskListId, 10))?.title?.toLowerCase() ?? 'unknown list';

            return (
                task.title.toLowerCase().includes(normalizedQuery) ||
                task.description.toLowerCase().includes(normalizedQuery) ||
                listName.includes(normalizedQuery)
            );
        });

    const filteredLists = normalizedQuery.length === 0
        ? lists
        : lists.filter((list) => list.title.toLowerCase().includes(normalizedQuery));

    const sortedTasks = [...filteredTasks].sort((firstTask, secondTask) => {
        if (sortMode === 'Title') {
            return firstTask.title.localeCompare(secondTask.title);
        }

        if (sortMode === 'Priority') {
            return secondTask.priority - firstTask.priority;
        }

        if (sortMode === 'Deadline') {
            return new Date(firstTask.deadline).getTime() - new Date(secondTask.deadline).getTime();
        }

        return 0;
    });

    const visibleTasks = sortedTasks.slice(0, shownTasksCount(viewportSize.width, viewportSize.height));

    const handleCompleteTask = async (taskId: number) => {
        const taskToComplete = tasks.find((task) => task.id === taskId);
        if (!taskToComplete) {
            setError('Task not found');
            return;
        }

        if (taskToComplete.done) {
            try {
                await updateTask(taskId, { ...taskToComplete, done: false });
                refreshTask(taskId);
            } catch {
                setError('Failed to update task');
            }
            return;
        }

        try {
            await completeTask(taskId);
            refreshTask(taskId);
            if (selectedTask?.id === taskId) {
                setSelectedTask(null);
            }
        } catch {
            setError('Failed to complete task');
        }
    };

    const handleTaskCardClick = (taskId: number) => {
        clearTaskClickTimeout();
        taskClickTimeoutRef.current = setTimeout(() => {
            void handleSelectTask(taskId);
            taskClickTimeoutRef.current = null;
        }, TASK_CARD_CLICK_DELAY_MS);
    };

    const handleTaskCardDoubleClick = (taskId: number) => {
        clearTaskClickTimeout();
        void handleCompleteTask(taskId);
    };

    const refreshTasks = async () => {
        try {
            const refreshedTasks = await fetchTasks();
            setTasks(refreshedTasks.map(normalizeTask));
        } catch {
            setError('Failed to refresh tasks');
        }
    };

    const refreshTask = async (taskId: number) => {
        try {
            const refreshedTask = await fetchTaskById(taskId);
            setTasks((current) => current.map((task) => (task.id === taskId ? refreshedTask : task)));
            if (selectedTask?.id === taskId) {
                setSelectedTask(refreshedTask);
            }
        } catch {
            setError('Failed to refresh task');
        }
    };


    const refreshList = async (listId: number) => {
        try {
            const refreshedLists = await fetchTaskListById(listId);
            setLists((current) => current.map((list) => (list.id === listId ? refreshedLists : list)));
        } catch {
            setError('Failed to refresh lists');
        }
    };

    const refreshLists = async () => {
        try {
            const refreshedLists = await fetchTaskLists();
            setLists(refreshedLists);
        } catch {
            setError('Failed to refresh lists');
        }
    };


    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="dashboard-header">
                    <h1>Task Manager</h1>
                    <input
                        className="sidebar-search"
                        type="text"
                        placeholder="Search tasks and lists"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
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
                            <TaskEditForm formData={newTaskData} setFormData={setNewTaskData} listOptions={lists} recurrenceOptions={recurrenceType} />

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
                                <TaskEditForm formData={formData} setFormData={setFormData} listOptions={lists} recurrenceOptions={recurrenceType} />
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
                        <button className='navigation-buttons' onClick={() => navigate('/analytics')}>Analytics</button>
                    </ul>

                    <div className="task-container">
                        <div className="task-list">
                            <div className="task-list-header-row">
                                <h3>Tasks</h3>
                                <div className='task-list-actions'>
                                    <label htmlFor='dashboard-sort-task-select' className='sort-task-label'>Sort:</label>
                                    <select
                                        id='dashboard-sort-task-select'
                                        className='sort-task-select'
                                        value={sortMode}
                                        onChange={(event) => setSortMode(event.target.value as TaskSortMode)}
                                    >
                                        <option value='Default'>Default</option>
                                        <option value='Title'>Title</option>
                                        <option value='Priority'>Priority</option>
                                        <option value='Deadline'>Deadline</option>
                                    </select>
                                    <button className='add-task-button' onClick={handleAddTaskClick}>Add Task</button>
                                </div>
                            </div>
                            {loading ? (
                                <p>Loading tasks…</p>
                            ) : filteredTasks.length === 0 ? (
                                <p>No tasks available. Please add some tasks.</p>
                            ) : (
                                <ul className="task-list">
                                    {visibleTasks.map((task) => {
                                        const taskListId = task.list;
                                        const listName = taskListId === null
                                            ? 'No List'
                                            : lists.find(list => list.id === parseInt(taskListId, 10))?.title || 'Unknown List';
                                        return (
                                            <li key={task.id}>
                                                <button
                                                    className='task-card'
                                                    onDoubleClick={() => handleTaskCardDoubleClick(task.id)}
                                                    onClick={() => handleTaskCardClick(task.id)}
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
                        <div className='list-header-row'>
                            <h3>Lists</h3>
                            <button className='add-list-button' onClick={handleAddListClick}>New List</button>
                        </div>

                        {isCreatingList && (
                            <div className='list-create-row'>
                                <input
                                    className='editable-input'
                                    type='text'
                                    placeholder='List name'
                                    value={newListTitle}
                                    onChange={(event) => setNewListTitle(event.target.value)}
                                />
                                <button onClick={handleSaveNewList}>Create</button>
                                <button className='cancel-button' onClick={handleCancelAddList}>Cancel</button>
                            </div>
                        )}

                        <div className='list-record'>
                            {filteredLists.length === 0 ? (
                                <p>No lists available. Please add some lists.</p>
                            ) : (
                                <ul className='list-record'>
                                    {filteredLists.map((list) => {
                                        const taskCount = tasks.filter((task) => task.list === String(list.id)).length;
                                        return (
                                            <li key={list.id}>
                                                <button
                                                    className={`task-card ${dropTargetListId === list.id ? 'drop-target' : ''}`}
                                                    onClick={() => navigate(`/lists/${list.id}`)}
                                                    onDragOver={(event) => handleListDragOver(event, list.id)}
                                                    onDragLeave={handleListDragLeave}
                                                    onDrop={(event) => void handleTaskDropOnList(event, list.id)}
                                                >
                                                    <div>{list.title}</div>
                                                    <div style={{ fontSize: '0.85em', opacity: 0.7 }}>{taskCount} {taskCount === 1 ? 'task' : 'tasks'}</div>
                                                </button>
                                            </li>
                                        );
                                    })}
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