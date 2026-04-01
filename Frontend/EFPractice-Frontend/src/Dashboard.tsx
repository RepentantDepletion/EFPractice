import { use, useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom'
import { fetchTasks, fetchTaskLists } from './Api.ts'

import './App.css'
import './Dashboard.css'
import './TaskPage.tsx'

type task = {
    id: number;
    title: string;
    description: string;
    priority: number;
    done: string;
};

type list = {
    id: number;
    title: string;
}

function Dashboard() {

    const navigate = useNavigate();
    const [tasks, setTasks] = useState<task[]>([]);
    const [lists, setLists] = useState<list[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTasks() {
            try {
                const data = await fetchTasks();
                setTasks(data);
            } catch {
                setError('Failed to load tasks');
            } finally {
                setLoading(false);
            }
        }

        loadTasks();
    }, []);

    useEffect(() => {
        async function loadLists(){
            try{
                const data = await fetchTaskLists();
                setLists(data);
            } catch{
                setError('Failed to load lists');
            } finally {
                setLoading(false);
            }
        }

        loadLists();
    }, []);

    return (
        <>
            <div className="navigation-panel">
                <h2>Navigation Panel</h2>
                <ul>
                    <button className='navigation-buttons' onClick={() => navigate('/')}>Home</button>
                    <button className='navigation-buttons' onClick={() => navigate('/settings')}>Settings</button>
                </ul>
                <div className="task-container">
                    <div className="task-list">
                        <h3>Tasks</h3>
                        {tasks.length === 0 ? (
                            <p>No tasks available. Please add some tasks.</p>
                        ) : (
                            <ul className="task-list">
                                console.log('lists:', lists, Array.isArray(lists));
                                {tasks.map((task) => (
                                    <li key={task.id}>
                                        <button className='task-card' onClick={() => navigate(`/tasks/${task.id}`)}>
                                            {task.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div>
                    <h3>Task Lists</h3>
                    
                    {lists.length == 0 ? (
                        <p>No lists available. Please add some lists.</p>
                    ) : (
                        <ul>
                            {lists.map((list) =>(
                                <li key={list.id}>
                                    <button onClick={() => navigate(`/lists/${list.id}`)}>
                                        {list.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div >
            <div className="dashboard-header">
                <h1>Task Manager</h1>
            </div>
        </>
    )
}

export default Dashboard