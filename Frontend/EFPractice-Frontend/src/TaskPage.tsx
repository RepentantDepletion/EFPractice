import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTaskById } from './Api.ts'; // adjust path if needed
import './App.css'
import './Dashboard.css'
import './TaskPage.css'
import { useNavigate } from 'react-router-dom'

type task = {
    id: number;
    title: string;
    description: string;
    priority: number;
    done: boolean;
    deadline: Date;
};

function TaskPage() {
    const navigate = useNavigate()

    const { id } = useParams<{ id: string }>();

    const [task, setTask] = useState<task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        async function loadTask() {
            if (!id) {
                setError('Invalid task ID');
                setLoading(false);
                return;
            }

            const taskId = Number(id);
            if (Number.isNaN(taskId)) {
                setError('Task ID must be a number');
                setLoading(false);
                return;
            }

            try {
                const data = await fetchTaskById(taskId);
                setTask(data);
            } catch {
                setError('Failed to load task');
            } finally {
                setLoading(false);
            }
        }

        loadTask();
    }, [id]);


    if (loading) {
        return <p>Loading task...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!task) {
        return <p>No task found.</p>;
    }

    return (
        <>
            <div id="task-page">
                <h1 id="header">Task Details</h1>
                <button id="back-button" onClick={() => navigate('/')}>Back to Dashboard</button>

                <div id="task-details">
                    <h2>{task.title}</h2>
                    <h2>Task Description</h2>
                    <p>{task.description}</p>
                    <h2>Task Priority</h2>
                    <p>{task.priority}</p>
                    <h2>Task Status</h2>
                    <p>{task.done.toString()}</p>
                    <h2>Task Due Date</h2>
                    <p>{task.deadline.toString()}</p>
                </div>
            </div>
        </>
    )
}

export default TaskPage