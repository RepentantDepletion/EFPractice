import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Task } from '../../shared/types/Task';
import type { NotificationItem, NotificationVariant } from '../../shared/components/Notifications';
import { createTask, deleteTask, deleteTaskList, fetchTaskListById, fetchTaskLists, fetchTasks, updateTask } from '../../shared/api/Api';
import { LIST_RECURRENCE_OPTIONS, type ListTaskSortMode } from './list.constants';

export function useListPage() {

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
    const [sortMode, setSortMode] = useState<ListTaskSortMode>('Default');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const recurrenceOptions = LIST_RECURRENCE_OPTIONS;

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

    const totalTasks = useMemo(() => tasks.length, [tasks]);
    const completedTasks = useMemo(() => tasks.filter((task) => task.done).length, [tasks]);
    const completionPercentage = useMemo(
        () => (totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)),
        [completedTasks, totalTasks]
    );

    return {
        id,
        navigate,
        tasks,
        setTasks,
        listTitle,
        setListTitle,
        loading,
        setLoading,
        error,
        setError,
        editingTaskId,
        setEditingTaskId,
        formData,
        setFormData,
        isCreatingTask,
        setIsCreatingTask,
        newTaskData,
        setNewTaskData,
        lists,
        setLists,
        sortMode,
        setSortMode,
        notifications,
        setNotifications,
        recurrenceOptions,
        totalTasks,
        completedTasks,
        completionPercentage,
        showNotification,
        dismissNotification,
        handleEditClick,
        handleCancelEdit,
        handleSaveEdit,
        handleAddTaskClick,
        handleCancelAddTask,
        handleSaveNewTask,
        handleDeleteTask,
        handleDeleteFromList,
        handleDeleteListClick,
        sortedTasks,

    }
}