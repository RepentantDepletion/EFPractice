import { useEffect, useRef, useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    completeTask,
    completeTaskList,
    createTask,
    createTaskList,
    deleteTask,
    fetchTaskById,
    fetchTaskLists,
    fetchTasks,
    logout,
    updateTask,
} from '../../shared/api/Api.ts';
import type { NotificationItem, NotificationVariant } from '../../shared/components/Notifications.tsx';
import type { List } from '../../shared/types/List.ts';
import type { Task } from '../../shared/types/Task.ts';
import {
    LIST_CARD_CLICK_DELAY_MS,
    RECURRENCE_OPTIONS,
    TASK_CARD_CLICK_DELAY_MS,
    type TaskSortMode,
} from './Dashboard.constants.tsx';

type TaskListsResponse = {
    lists: List[];
};

const shownTasksCount = (width: number, height: number) => {
    const widthCapacity = width < 600 ? 2 : width < 1024 ? 4 : 8;
    const heightMultiplier = height < 700 ? 1 : height < 900 ? 2 : 3;

    return widthCapacity * heightMultiplier;
};

const normalizeTask = (task: Task): Task => ({
    ...task,
    deadline: new Date(task.deadline),
});

export function useDashboardPage() {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [lists, setLists] = useState<List[]>([]);
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
    const [sortMode, setSortMode] = useState<TaskSortMode>('Default');
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [viewportSize, setViewportSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [detailsTransitionKey, setDetailsTransitionKey] = useState(0);

    const dragPreviewRef = useRef<HTMLElement | null>(null);
    const taskClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const listClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const recurrenceType = [...RECURRENCE_OPTIONS];

    const dismissNotification = (id: string) => {
        setNotifications((current) => current.filter((notification) => notification.id !== id));
    };

    const showNotification = (message: string, variant: NotificationVariant, title?: string) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setNotifications((current) => [
            ...current,
            {
                id,
                message,
                variant,
                title,
            },
        ]);
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

    const clearListClickTimeout = () => {
        if (listClickTimeoutRef.current !== null) {
            clearTimeout(listClickTimeoutRef.current);
            listClickTimeoutRef.current = null;
        }
    };

    const showTaskDetailsWithTransition = () => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setShowTaskDetails(true);
            });
        });
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

    const refreshLists = async () => {
        try {
            const refreshedLists = (await fetchTaskLists()) as TaskListsResponse;
            setLists(refreshedLists.lists);
        } catch {
            setError('Failed to refresh lists');
        }
    };

    const handleSelectTask = async (id: number) => {
        setShowTaskDetails(false);
        setSelectedLoading(true);
        setError(null);

        try {
            const task = await fetchTaskById(id);
            setSelectedTask(normalizeTask(task));
            setFormData(null);
            setIsEditing(false);
            setDetailsTransitionKey((current) => current + 1);
        } catch {
            setError('Failed to load task details');
        } finally {
            setSelectedLoading(false);
            showTaskDetailsWithTransition();
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
            void refreshTask(formData.id);
        } catch {
            showNotification('Failed to save task.', 'error', 'Save failed');
        }
    };

    const handleDeleteSelectedTask = async () => {
        if (!selectedTask) return;

        try {
            await deleteTask(selectedTask.id);
            void refreshTasks();
            setSelectedTask(null);
            setFormData(null);
            setIsEditing(false);
            showNotification('Task deleted.', 'success', 'Deleted');
        } catch {
            showNotification('Failed to delete task.', 'error', 'Delete failed');
        }
    };

    const handleTaskDragStart = (event: DragEvent<HTMLButtonElement>, taskId: number) => {
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

    const handleListDragOver = (event: DragEvent<HTMLButtonElement>, listId: number) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';

        if (draggedTaskId !== null) {
            setDropTargetListId(listId);
        }
    };

    const handleListDragLeave = () => {
        setDropTargetListId(null);
    };

    const handleTaskDropOnList = async (event: DragEvent<HTMLButtonElement>, listId: number) => {
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
            void refreshTask(taskToMove.id);

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
        setShowTaskDetails(false);
        setDetailsTransitionKey((current) => current + 1);
        showTaskDetailsWithTransition();
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
            void refreshTasks();
            setIsCreatingTask(false);
            setNewTaskData(null);
            showNotification('Task created.', 'success', 'Created');
        } catch {
            showNotification('Failed to create task.', 'error', 'Create failed');
        }
    };

    const handleAddListClick = () => {
        setIsCreatingList(true);
        setNewListTitle('');
    };

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate('/', { replace: true });
        }
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
            void refreshLists();
            setIsCreatingList(false);
            setNewListTitle('');
            showNotification('List created.', 'success', 'Created');
        } catch {
            showNotification('Failed to create list.', 'error', 'Create failed');
        }
    };

    const handleCloseTaskDetails = () => {
        setShowTaskDetails(false);
        setSelectedTask(null);
        setFormData(null);
        setIsEditing(false);
    };

    const handleCompleteTask = async (taskId: number) => {
        const taskToComplete = tasks.find((task) => task.id === taskId);
        if (!taskToComplete) {
            setError('Task not found');
            return;
        }

        if (taskToComplete.done) {
            try {
                await updateTask(taskId, { ...taskToComplete, done: false });
                void refreshTask(taskId);
            } catch {
                setError('Failed to update task');
            }
            return;
        }

        try {
            await completeTask(taskId);
            void refreshTask(taskId);
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

    const handleCompleteList = async (listId: number) => {
        try {
            const tasksInList = tasks.filter((task) => task.list === String(listId));

            if (tasksInList.length === 0) {
                return;
            }

            const allCompleted = tasksInList.every((task) => task.done);

            if (allCompleted) {
                await Promise.all(
                    tasksInList.map((task) =>
                        updateTask(task.id, {
                            ...task,
                            done: false,
                        })
                    )
                );
            } else {
                await completeTaskList(listId);
            }

            await refreshTasks();
        } catch {
            setError('Failed to complete list');
        }
    };

    const handleListCardClick = (listId: number) => {
        clearListClickTimeout();
        listClickTimeoutRef.current = setTimeout(() => {
            navigate(`/lists/${listId}`);
            listClickTimeoutRef.current = null;
        }, LIST_CARD_CLICK_DELAY_MS);
    };

    const handleListCardDoubleClick = (listId: number) => {
        clearListClickTimeout();
        void handleCompleteList(listId);
    };

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const data = await fetchTasks();
                setTasks(data.map(normalizeTask));
            } catch {
                setError('Failed to load tasks');
            } finally {
                setLoading(false);
            }
        };

        void loadTasks();
    }, []);

    useEffect(() => {
        const loadLists = async () => {
            try {
                const data = (await fetchTaskLists()) as TaskListsResponse;
                setLists(data.lists);
            } catch {
                setError('Failed to load lists');
            }
        };

        void loadLists();
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

    useEffect(() => {
        return () => {
            cleanupDragPreview();
            clearTaskClickTimeout();
            clearListClickTimeout();
        };
    }, []);

    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filteredTasks =
        normalizedQuery.length === 0
            ? tasks
            : tasks.filter((task) => {
                  const taskListId = task.list;
                  const listName =
                      taskListId === null
                          ? 'no list'
                          : lists.find((list) => list.id === parseInt(taskListId, 10))?.title?.toLowerCase() ?? 'unknown list';

                  return (
                      task.title.toLowerCase().includes(normalizedQuery) ||
                      task.description.toLowerCase().includes(normalizedQuery) ||
                      listName.includes(normalizedQuery)
                  );
              });

    const filteredLists =
        normalizedQuery.length === 0
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

    return {
        detailsTransitionKey,
        dismissNotification,
        dropTargetListId,
        error,
        filteredLists,
        filteredTasks,
        formData,
        handleAddListClick,
        handleAddTaskClick,
        handleCancelAddList,
        handleCancelAddTask,
        handleCloseTaskDetails,
        handleDeleteSelectedTask,
        handleEdit,
        handleListCardClick,
        handleListCardDoubleClick,
        handleListDragLeave,
        handleListDragOver,
        handleLogout,
        handleSaveNewList,
        handleSaveNewTask,
        handleTaskCardClick,
        handleTaskCardDoubleClick,
        handleTaskDragEnd,
        handleTaskDragStart,
        handleTaskDropOnList,
        isCreatingList,
        isCreatingTask,
        isEditing,
        lists,
        loading,
        navigate,
        newListTitle,
        newTaskData,
        notifications,
        recurrenceType,
        searchQuery,
        selectedLoading,
        selectedTask,
        setFormData,
        setIsEditing,
        setNewListTitle,
        setNewTaskData,
        setSearchQuery,
        setSelectedTask,
        setShowTaskDetails,
        setSortMode,
        showTaskDetails,
        sortMode,
        tasks,
        visibleTasks,
    };
}