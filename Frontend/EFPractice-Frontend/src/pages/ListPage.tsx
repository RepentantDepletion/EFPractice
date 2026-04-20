import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTaskListById, fetchTasks, updateTask, createTask, deleteTask, fetchTaskLists, deleteTaskList } from '../api/Api';
import type { Task } from '../types/Task';
import TaskView from '../components/TaskView';
import TaskEditForm from '../components/TaskEditForm';
import Notifications, { type NotificationItem, type NotificationVariant } from '../components/Notifications';
import '../styles/App.css';
import '../styles/Dashboard.css';
import '../styles/TaskPage.css';
import '../styles/ListPage.css';

type TaskSortMode = 'Default' | 'Title' | 'Priority' | 'Deadline' | 'Overdue' | 'Completed';

function ListPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [listTitle, setListTitle] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Task | null>(null);
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [newTaskData, setNewTaskData] = useState<Task | null>(null);
    const [lists, setLists] = useState<Array<{ id: number; title: string }>>([]);
    const [sortMode, setSortMode] = useState<TaskSortMode>('Default');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [recurrenceType] = useState([
        { value: 0, label: 'None' },
        { value: 1, label: 'Daily' },
        { value: 2, label: 'Weekly' },
        { value: 3, label: 'Monthly' },
        { value: 4, label: 'Yearly' },
        { value: 5, label: 'Custom' }
    ]);

    const showNotification = (message: string, variant: NotificationVariant, title?: string) => {
        const notificationId = `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setNotifications((current) => [{ id: notificationId, message, variant, title }, ...current]);
    };

    const dismissNotification = (notificationId: string) => {
        setNotifications((current) => current.filter((notification) => notification.id !== notificationId));
    };

    const loadList = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);

        try {
            const [allTasks, listData] = await Promise.all([
                fetchTasks(),
                fetchTaskListById(Number(id)),
            ]);

            setTasks(allTasks.filter((task: Task) => task.list !== null && Number(task.list) === Number(id)));
            setListTitle(listData?.name ?? listData?.title ?? `List ${id}`);
        } catch {
            setError('Failed to load list details or tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadList();
    }, [id]);

    useEffect(() => {
        async function loadLists() {
            try {
                const data = await fetchTaskLists();
                setLists(data.lists ?? []);
            } catch {
                setError('Failed to load lists');
            }
        }

        loadLists();
    }, []);

    const handleEditClick = (task: Task) => {
        setEditingTaskId(task.id);
        setFormData({ ...task });
        setError(null);
    };

    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setFormData(null);
    };

    const handleSaveEdit = async () => {
        if (!formData) return;

        try {
            await updateTask(formData.id, formData);
            setEditingTaskId(null);
            setFormData(null);
            await loadList();
        } catch {
            setError('Failed to save task');
        }
    };

    const handleAddTaskClick = () => {
        const newTask: Task = {
            id: 0,
            title: '',
            list: id || '',
            description: '',
            priority: 0,
            done: false,
            deadline: new Date(),
            recurrence: 0,
        };
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
            setIsCreatingTask(false);
            setNewTaskData(null);
            await loadList();
            showNotification('Task created.', 'success', 'Created');
        } catch {
            showNotification('Failed to create task.', 'error', 'Create failed');
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        try {
            await deleteTask(taskId);
            await loadList();
            showNotification('Task deleted.', 'success', 'Deleted');
        } catch {
            showNotification('Failed to delete task.', 'error', 'Delete failed');
        }
    };

    const handleDeleteFromList = async (taskId: number) => {
        try {
            const taskToUpdate = tasks.find((task) => task.id === taskId);
            if (!taskToUpdate) throw new Error('Task not found');
            await updateTask(taskId, { ...taskToUpdate, list: '' });
            await loadList();
            showNotification('Task removed from list.', 'success', 'Updated');
        } catch {
            showNotification('Failed to remove task from list.', 'error', 'Update failed');
        }
    };

    const handleDeleteListClick = async () => {
        try {
            await deleteTaskList(Number(id));
            showNotification('List deleted.', 'success', 'Deleted');
            navigate('/home');
        } catch {
            showNotification('Failed to delete list.', 'error', 'Delete failed');
        }
    };

    const sortedTasks = [...tasks].sort((firstTask, secondTask) => {
        const firstDeadline = new Date(firstTask.deadline).getTime();
        const secondDeadline = new Date(secondTask.deadline).getTime();
        const now = Date.now();

        if (sortMode === 'Title') {
            return firstTask.title.localeCompare(secondTask.title);
        }

        if (sortMode === 'Priority') {
            return secondTask.priority - firstTask.priority;
        }

        if (sortMode === 'Deadline') {
            return firstDeadline - secondDeadline;
        }

        if (sortMode === 'Overdue') {
            const firstOverdue = !firstTask.done && firstDeadline < now;
            const secondOverdue = !secondTask.done && secondDeadline < now;

            if (firstOverdue !== secondOverdue) {
                return firstOverdue ? -1 : 1;
            }

            return firstDeadline - secondDeadline;
        }

        if (sortMode === 'Completed') {
            if (firstTask.done !== secondTask.done) {
                return firstTask.done ? -1 : 1;
            }

            return firstDeadline - secondDeadline;
        }

        return 0;
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.done).length;
    const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    if (loading) {
        return <div id="list-page"><p>Loading list tasks…</p></div>;
    }

    if (error) {
        return <div id="list-page"><p className="error-message">{error}</p></div>;
    }

    return (
        <div id='list-page'>
            <Notifications notifications={notifications} onDismiss={dismissNotification} position='top-right' />
            <button className='back-button' onClick={() => navigate('/home')}>Back to Dashboard</button>
            <h1>{listTitle || `List ${id}`}</h1>
            <div className='list-page-actions'>
                <label htmlFor='sort-task-select' className='sort-task-label'>Sort:</label>
                <select
                    id='sort-task-select'
                    className='sort-task-select'
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as TaskSortMode)}
                >
                    <option value='Default'>Default</option>
                    <option value='Title'>Title</option>
                    <option value='Priority'>Priority</option>
                    <option value='Deadline'>Deadline</option>
                    <option value='Overdue'>Overdue</option>
                    <option value='Completed'>Completed</option>
                </select>
                <button className='add-task-button' onClick={handleAddTaskClick}>Add Task</button>
                <button className='delete-list-button' onClick={handleDeleteListClick}>Delete List</button>
            </div>

            <section className='list-progress-section'>
                <div className='list-progress-header'>
                    <span>Progress</span>
                    <span>{completionPercentage}% ({completedTasks}/{totalTasks})</span>
                </div>
                <div className='list-progress-track' role='progressbar' aria-valuenow={completionPercentage} aria-valuemin={0} aria-valuemax={100}>
                    <div className='list-progress-fill' style={{ width: `${completionPercentage}%` }} />
                </div>
            </section>

            {isCreatingTask && newTaskData && (
                <section className='task-detail-card'>
                    <h2>Create New Task</h2>
                    <TaskEditForm formData={newTaskData} setFormData={setNewTaskData} listOptions={lists} recurrenceOptions={recurrenceType} />
                    <div className='list-card-button-row'>
                        <button onClick={handleSaveNewTask}>Create</button>
                        <button className='cancel-button' onClick={handleCancelAddTask}>Cancel</button>
                    </div>
                </section>
            )}

            {tasks.length === 0 ? (
                <p>No tasks found in this list.</p>
            ) : (
                <div className='list-task-details'>
                    {sortedTasks.map((task) => (
                        <section key={task.id} className='task-detail-card'>
                            {editingTaskId === task.id && formData ? (
                                <>
                                    <TaskEditForm formData={formData} setFormData={setFormData} listOptions={lists} recurrenceOptions={recurrenceType} />
                                    <div className='list-card-button-row'>
                                        <button onClick={handleSaveEdit}>Save</button>
                                        <button className='cancel-button' onClick={handleCancelEdit}>Cancel</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <TaskView
                                        task={task}
                                        lists={[{ id: Number(id), title: listTitle || `List ${id}` }]}
                                    />
                                    <div className='list-card-button-row'>
                                        <button className='edit-card-button' onClick={() => handleEditClick(task)}>
                                            Edit
                                        </button>
                                        <button className='delete-card-button' onClick={() => void handleDeleteTask(task.id)}>
                                            Delete
                                        </button>
                                        <button className='delete-from-list-button' onClick={() => void handleDeleteFromList(task.id)}>
                                            Delete from List
                                        </button>
                                    </div>
                                </>
                            )}
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ListPage;
