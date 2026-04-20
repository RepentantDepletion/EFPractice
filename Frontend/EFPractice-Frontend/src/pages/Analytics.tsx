import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Pie } from 'react-chartjs-2';
import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import '../styles/Analytics.css';
import type { Task } from '../types/Task';
import { fetchTaskLists, fetchTasks } from '../api/Api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type AnalyticsMetric = 'Priority' | 'Deadlines' | 'Completed' | 'Due';
type ListAnalyticsMetric = 'Completed By List' | 'Total By List' | 'Overdue By List';

type TaskList = {
    id: number;
    title: string;
};

type ChartMetricData = {
    labels: string[];
    datasetLabel: string;
    values: number[];
};

const toISODate = (value: Date): string => {
    if (Number.isNaN(value.getTime())) return 'No deadline';
    return value.toISOString().slice(0, 10);
};

const getTaskListId = (task: Task): number | null => {
    if (task.list === null || task.list === '') return null;
    const parsed = Number(task.list);
    return Number.isFinite(parsed) ? parsed : null;
};

const normalizeTaskList = (raw: Record<string, unknown>): TaskList => ({
    id: Number(raw['id'] ?? raw['ID'] ?? 0),
    title: String(raw['title'] ?? raw['name'] ?? raw['Title'] ?? raw['Name'] ?? 'Untitled List'),
});

const extractTaskLists = (raw: unknown): TaskList[] => {
    if (Array.isArray(raw)) {
        return raw
            .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
            .map(normalizeTaskList)
            .filter((item) => Number.isFinite(item.id) && item.id > 0);
    }

    if (typeof raw === 'object' && raw !== null && Array.isArray((raw as { lists?: unknown }).lists)) {
        return (raw as { lists: unknown[] }).lists
            .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
            .map(normalizeTaskList)
            .filter((item) => Number.isFinite(item.id) && item.id > 0);
    }

    return [];
};

const buildMetricData = (tasks: Task[], metric: AnalyticsMetric): ChartMetricData => {
    if (metric === 'Priority') {
        const counts = new Map<number, number>([
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
        ]);

        tasks.forEach((task) => {
            counts.set(task.priority, (counts.get(task.priority) ?? 0) + 1);
        });

        const labels = Array.from(counts.keys()).map((priority) => `${priority}`);
        const values = Array.from(counts.values());
        return { labels, datasetLabel: 'Tasks by Priority', values };
    }

    if (metric === 'Deadlines') {
        const counts = new Map<string, number>();

        tasks.forEach((task) => {
            const key = toISODate(new Date(task.deadline));
            counts.set(key, (counts.get(key) ?? 0) + 1);
        });

        const sortedLabels = Array.from(counts.keys()).sort((a, b) => a.localeCompare(b));
        const values = sortedLabels.map((label) => counts.get(label) ?? 0);
        return { labels: sortedLabels, datasetLabel: 'Tasks by Deadline Date', values };
    }

    if (metric === 'Completed') {
        const completed = tasks.filter((task) => task.done).length;
        const notCompleted = tasks.length - completed;
        return {
            labels: ['Completed', 'Not Completed'],
            datasetLabel: 'Completion Status',
            values: [completed, notCompleted],
        };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let overdue = 0;
    let dueToday = 0;
    let upcoming = 0;

    tasks.forEach((task) => {
        if (task.done) return;
        const taskDate = new Date(task.deadline);
        if (Number.isNaN(taskDate.getTime())) return;

        const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
        if (taskDay.getTime() < today.getTime()) overdue += 1;
        else if (taskDay.getTime() === today.getTime()) dueToday += 1;
        else upcoming += 1;
    });

    return {
        labels: ['Overdue', 'Due Today', 'Upcoming'],
        datasetLabel: 'Open Tasks by Due State',
        values: [overdue, dueToday, upcoming],
    };
};

const buildListMetricData = (tasks: Task[], lists: TaskList[], metric: ListAnalyticsMetric): ChartMetricData => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const labels = lists.map((list) => list.title);

    const values = lists.map((list) => {
        if (metric === 'Completed By List') {
            return tasks.filter((task) => getTaskListId(task) === list.id && task.done).length;
        }

        if (metric === 'Total By List') {
            return tasks.filter((task) => getTaskListId(task) === list.id).length;
        }

        return tasks.filter((task) => {
            if (getTaskListId(task) !== list.id || task.done) return false;
            const deadline = new Date(task.deadline);
            if (Number.isNaN(deadline.getTime())) return false;
            const taskDay = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
            return taskDay.getTime() < today.getTime();
        }).length;
    });

    const datasetLabel = metric === 'Completed By List'
        ? 'Completed Tasks in Each List'
        : metric === 'Total By List'
            ? 'Total Tasks in Each List'
            : 'Overdue Tasks in Each List';

    return {
        labels,
        datasetLabel,
        values,
    };
};

function Analytics() {
    const [taskData, setTaskData] = useState<Task[]>([]);
    const [listData, setListData] = useState<TaskList[]>([]);
    const [selectedMetric, setSelectedMetric] = useState<AnalyticsMetric>('Priority');
    const [selectedListMetric, setSelectedListMetric] = useState<ListAnalyticsMetric>('Total By List');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const [tasks, listsResponse] = await Promise.all([fetchTasks(), fetchTaskLists()]);
            setTaskData(tasks);
            setListData(extractTaskLists(listsResponse));
        };

        fetchData();
    }, []);

    const options: AnalyticsMetric[] = ['Priority', 'Deadlines', 'Completed', 'Due'];
    const listOptions: ListAnalyticsMetric[] = ['Completed By List', 'Total By List', 'Overdue By List'];

    const metricData = useMemo(() => buildMetricData(taskData, selectedMetric), [taskData, selectedMetric]);

    const chartData = useMemo(() => ({
        labels: metricData.labels,
        datasets: [
            {
                label: metricData.datasetLabel,
                data: metricData.values,
                borderColor: '#2874a6',
                backgroundColor: 'rgba(40, 116, 166, 0.18)',
                fill: true,
                tension: 0.25,
            },
        ],
    }), [metricData]);

    const pieChartData = useMemo(() => ({
        labels: metricData.labels,
        datasets: [
            {
                label: metricData.datasetLabel,
                data: metricData.values,
                backgroundColor: ['#2e86c1', '#85c1e9', '#7fb3d5', '#d6eaf8'],
                borderColor: '#ffffff',
                borderWidth: 1,
            },
        ],
    }), [metricData]);

    const lineChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
    }), []);

    const pieChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
        },
    }), []);

    const listMetricData = useMemo(
        () => buildListMetricData(taskData, listData, selectedListMetric),
        [taskData, listData, selectedListMetric]
    );

    const listChartData = useMemo(() => ({
        labels: listMetricData.labels,
        datasets: [
            {
                label: listMetricData.datasetLabel,
                data: listMetricData.values,
                borderColor: '#1e8449',
                backgroundColor: 'rgba(30, 132, 73, 0.20)',
                fill: true,
                tension: 0.25,
            },
        ],
    }), [listMetricData]);

    return (
        <div id="analytics-page">
            <button className='back-button' onClick={() => navigate('/home')}>Back to Dashboard</button>
            <h1 className='analytics-header'>Analytics</h1>
            <div className='analytics-panels-container'>
                <div className='analytics-panel'>
                    <div className='analytics-panel-content'>
                        <h2>Task Details</h2>
                        <select
                            className='analytics-dropdown'
                            value={selectedMetric}
                            onChange={(event) => setSelectedMetric(event.target.value as AnalyticsMetric)}
                        >
                            {options.map((metric) => (
                                <option key={metric} value={metric}>
                                    {metric}
                                </option>
                            ))}
                        </select>
                        <div className='analytics-chart-container'>
                            {selectedMetric === 'Completed' ? (
                                <Pie data={pieChartData} options={pieChartOptions} />
                            ) : (
                                <Line data={chartData} options={lineChartOptions} />
                            )}
                        </div>
                    </div>
                </div>

                <div className='analytics-panel'>
                    <div className='analytics-panel-content'>
                        <h2>List Details</h2>
                        <select
                            className='analytics-dropdown'
                            value={selectedListMetric}
                            onChange={(event) => setSelectedListMetric(event.target.value as ListAnalyticsMetric)}
                        >
                            {listOptions.map((metric) => (
                                <option key={metric} value={metric}>
                                    {metric}
                                </option>
                            ))}
                        </select>
                        <div className='analytics-chart-container'>
                            <Line data={listChartData} options={lineChartOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;