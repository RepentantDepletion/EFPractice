import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchTaskById, updateTask, deleteTask, fetchTaskLists } from "../api/Api";
import type { Task } from "../types/Task";
import TaskView from "../components/TaskView";
import TaskEditForm from "../components/TaskEditForm";
import { useNavigate } from "react-router-dom";
import './TaskPage.css';  // Add this import

const TaskPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [task, setTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState<Task | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lists, setLists] = useState<Array<{ id: number; title: string }>>([]);
    const [recurrenceType] = useState([
        { value: 0, label: 'None' },
        { value: 1, label: 'Daily' },
        { value: 2, label: 'Weekly' },
        { value: 3, label: 'Monthly' },
        { value: 4, label: 'Yearly' },
        { value: 5, label: 'Custom' }
    ]);

    useEffect(() => {
        async function loadTask() {
            if (!id) return;

            try {
                const data = await fetchTaskById(Number(id));
                setTask(data);
            } catch {
                setError("Failed to load task");
            } finally {
                setLoading(false);
            }
        }

        loadTask();
    }, [id]);

    useEffect(() => {
        async function loadLists() {
            try {
                const data = await fetchTaskLists();
                setLists(data.lists ?? []);
            } catch {
                setError("Failed to load lists");
            }
        }

        loadLists();
    }, []);

    const handleEdit = async () => {
        if (!task) return;

        if (!isEditing) {
            // ✅ ENTER edit mode
            setFormData({ ...task });
            setIsEditing(true);
            return;
        }

        // ✅ SAVE
        if (!formData) return;

        try {
            await updateTask(formData.id, formData);
            setTask(formData);
            setIsEditing(false);
        } catch {
            alert("Failed to save task");
        }
    };

    const handleDelete = async () => {
        if (!task) return;

        try {
            await deleteTask(task.id);
            navigate('/');
        } catch {
            alert("Failed to delete task");
        }
    };

    if (loading) return <p>Loading…</p>;
    if (error) return <p>{error}</p>;
    if (!task) return <p>No task found</p>;

    return (
        <div id="task-page">
            <header className="taskpage-header">
                <h1>Task Manager</h1>
            </header>

            <div id="task-details">
                <button className="back-button" onClick={() => navigate('/') }>
                    Back
                </button>
                {isEditing && formData ? (
                    <TaskEditForm
                        formData={formData}
                        setFormData={setFormData}
                        listOptions={lists}
                        recurrenceOptions={recurrenceType}
                    />
                ) : (
                    <TaskView task={task} lists={lists} onDelete={handleDelete} />
                )}
            </div>


            <div className="button-row">  {/* Add this wrapper for button row styles */}
                <button className="button-row" onClick={handleEdit}>
                    {isEditing ? "Save" : "Edit"}
                </button>

                {isEditing && (
                    <button onClick={() => setIsEditing(false)}>
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

export default TaskPage;