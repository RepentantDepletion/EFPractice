import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTaskListById, fetchTasks, updateTask, createTask, deleteTask, fetchTaskLists } from '../api/Api';
import type { Task } from '../types/Task';
import TaskView from '../components/TaskView';
import TaskEditForm from '../components/TaskEditForm';
import '../styles/App.css';
import '../styles/Dashboard.css';
import '../styles/TaskPage.css';
import '../styles/ListPage.css';

type TaskSortMode = 'Default' | 'Title' | 'Priority' | 'Deadline';

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
        } catch {
            setError('Failed to create task');
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        try {
            await deleteTask(taskId);
            await loadList();
        } catch {
            setError('Failed to delete task');
        }
    };

    const handleDeleteFromList = async (taskId: number) => {
        try {
            const taskToUpdate = tasks.find((task) => task.id === taskId);
            if (!taskToUpdate) throw new Error('Task not found');
            await updateTask(taskId, { ...taskToUpdate, list: '' });
            await loadList();
        } catch {
            setError('Failed to remove task from list');
        }
    };

    const handleSortTasksClick = () => {
        setSortMode((currentMode) => {
            if (currentMode === 'Default') return 'Title';
            if (currentMode === 'Title') return 'Priority';
            if (currentMode === 'Priority') return 'Deadline';
            return 'Default';
        });
    };

    const sortedTasks = [...tasks].sort((firstTask, secondTask) => {
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
            <button className='back-button' onClick={() => navigate('/')}>Back to Dashboard</button>
            <h1>{listTitle || `List ${id}`}</h1>
            <div className='list-page-actions'>
                <button className='sort-task-button' onClick={handleSortTasksClick}>Sort: {sortMode}</button>
                <button className='add-task-button' onClick={handleAddTaskClick}>Add Task</button>
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
                    <TaskEditForm formData={newTaskData} setFormData={setNewTaskData} listOptions={lists} />
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
                                    <TaskEditForm formData={formData} setFormData={setFormData} listOptions={lists} />
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
