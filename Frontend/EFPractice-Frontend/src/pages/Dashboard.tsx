import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTasks, fetchTaskLists, fetchTaskById, updateTask, deleteTask } from '../api/Api.ts'
import type { Task } from '../types/Task.ts'
import TaskView from '../components/TaskView.tsx'
import TaskEditForm from '../components/TaskEditForm.tsx'
import deleteIcon from '../assets/delete-icon.jpg'

import '../styles/App.css'
import '../styles/Dashboard.css'
import { fr } from 'date-fns/locale'

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

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="dashboard-header">
                    <h1>Task Manager</h1>
                </div>

                <main className="task-details-panel">
                    {selectedLoading ? (
                        <p>Loading task details…</p>
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
                                <TaskEditForm formData={formData} setFormData={setFormData} />
                            ) : (
                                <TaskView task={selectedTask} lists={lists} />
                            )}


                            <div className="button-row">
                                <button className="delete-button" onClick={async () => {
                                    if (!selectedTask) return;
                                    if (window.confirm('Are you sure you want to delete this task?')) {
                                        try {
                                            await deleteTask(selectedTask.id);
                                            setSelectedTask(null);
                                            setFormData(null);
                                            setIsEditing(false);
                                        } catch {
                                            alert('Failed to delete task');
                                        }
                                    }
                                }}>
                                    <img src={deleteIcon} alt="Delete" />
                                </button>
                                <button onClick={handleEdit}>
                                    {isEditing ? 'Save' : 'Edit'}
                                </button>
                                {isEditing && (
                                    <button onClick={() => setIsEditing(false)}>
                                        Cancel
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
                            <h3>Tasks</h3>
                            {loading ? (
                                <p>Loading tasks…</p>
                            ) : tasks.length === 0 ? (
                                <p>No tasks available. Please add some tasks.</p>
                            ) : (
                                <ul className="task-list">
                                    {tasks.map((task) => (
                                        <li key={task.id}>
                                            <button
                                                className='task-card'
                                                onClick={() => handleSelectTask(task.id)}
                                            >
                                                {task.title}
                                            </button>
                                        </li>
                                    ))}
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
                                            <button className="task-card" onClick={() => navigate(`/lists/${list.id}`)}>
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