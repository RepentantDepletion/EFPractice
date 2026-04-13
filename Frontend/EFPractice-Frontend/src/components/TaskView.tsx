import type { Task } from "../types/Task";

type Props = {
    task: Task;
    lists: { id: number; title: string }[];
    onDelete?: () => void;
};

const TaskView = ({ task, lists, onDelete }: Props) => {
    const listName = task.list === null
        ? 'No List'
        : lists.find(list => list.id === parseInt(task.list, 10))?.title || task.list;

    return (
        <>
            <h2>{task.title}</h2>
            <h2>{listName}</h2>
            <p>{task.description}</p>
            <h2>Priority: {task.priority}</h2>
            <h2>Deadline: {new Date(task.deadline).toLocaleDateString()}</h2>
            <h2>Status</h2>
            <p>{task.done ? "Completed" : "Not completed"}</p>
            {onDelete && (
                <div className="button-row">
                    <button className="delete-button" onClick={onDelete}>
                        Delete
                    </button>
                </div>
            )}
        </>
    );
};

export default TaskView;
