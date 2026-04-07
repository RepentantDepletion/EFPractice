import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTaskListById, fetchTasks, updateTask } from '../api/Api';
import type { Task } from '../types/Task';
import TaskView from '../components/TaskView';
import TaskEditForm from '../components/TaskEditForm';
import '../styles/App.css';
import '../styles/Dashboard.css';
import '../styles/TaskPage.css';
import '../styles/ListPage.css';

function ListPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [listTitle, setListTitle] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Task | null>(null);

    useEffect(() => {
        async function loadList() {
            if (!id) return;
            setLoading(true);
            setError(null);

            try {
                const [allTasks, listData] = await Promise.all([
                    fetchTasks(),
                    fetchTaskListById(Number(id)),
                ]);

                setTasks(allTasks.filter((task: Task) => Number(task.list) === Number(id)));
                setListTitle(listData?.name ?? listData?.title ?? `List ${id}`);
            } catch {
                setError('Failed to load list details or tasks');
            } finally {
                setLoading(false);
            }
        }

        loadList();
    }, [id]);

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
            setTasks((current) =>
                current.map((task) => (task.id === formData.id ? { ...formData } : task))
            );
            setEditingTaskId(null);
            setFormData(null);
        } catch {
            setError('Failed to save task');
        }
    };

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

            {tasks.length === 0 ? (
                <p>No tasks found in this list.</p>
            ) : (
                <div className='list-task-details'>
                    {tasks.map((task) => (
                        <section key={task.id} className='task-detail-card'>
                            {editingTaskId === task.id && formData ? (
                                <>
                                    <TaskEditForm formData={formData} setFormData={setFormData} />
                                    <div className='list-card-button-row'>
                                        <button onClick={handleSaveEdit}>Save</button>
                                        <button className='cancel-button' onClick={handleCancelEdit}>Cancel</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <TaskView task={task} lists={[{ id: Number(id), title: listTitle || `List ${id}` }]} />
                                    <div className='list-card-button-row'>
                                        <button className='edit-card-button' onClick={() => handleEditClick(task)}>
                                            Edit
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