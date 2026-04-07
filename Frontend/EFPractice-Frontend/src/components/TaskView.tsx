import type { Task } from "../types/Task";

type Props = {
    task: Task;
    lists: { id: number; title: string }[];
};

const TaskView = ({ task, lists }: Props) => {
    const listName = lists.find(list => list.id === parseInt(task.list))?.title || task.list;

    return (
        <>
            <h2>{task.title}</h2>
            <h2>{listName}</h2>
            <p>{task.description}</p>
            <h2>Priority: {task.priority}</h2>
            <h2>Deadline: {new Date(task.deadline).toLocaleDateString()}</h2>
            <h2>Status</h2>
            <p>{task.done ? "Completed" : "Not completed"}</p>
        </>
    );
};

export default TaskView;
