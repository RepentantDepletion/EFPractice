import TaskView from '../features/tasks/components/TaskView';
import TaskEditForm from '../features/tasks/components/TaskEditForm';
import Notifications from '../shared/components/Notifications';
import '../styles/App.css';
import '../styles/TaskPage.css';
import '../styles/ListPage.css';
import { useListPage } from '../features/list/ListController';
import { LIST_TASK_SORT_OPTIONS, type ListTaskSortMode } from '../features/list/list.constants';

function ListPage() {
    const List = useListPage();
    const { tasks, sortedTasks } = List;

    if (List.loading) {
        return <div id="list-page"><p>Loading list tasks…</p></div>;
    }

    if (List.error) {
        return <div id="list-page"><p className="error-message">{List.error}</p></div>;
    }

    return (
        <div id='list-page'>
            <Notifications notifications={List.notifications} onDismiss={List.dismissNotification} position='top-right' />
            <button className='back-button' onClick={() => List.navigate('/home')}>Back to Dashboard</button>
            <h1>{List.listTitle || `List ${List.id}`}</h1>
            <div className='list-page-actions'>
                <label htmlFor='sort-task-select' className='sort-task-label'>Sort:</label>
                <select
                    id='sort-task-select'
                    className='sort-task-select'
                    value={List.sortMode}
                    onChange={(event) => List.setSortMode(event.target.value as ListTaskSortMode)}
                >
                    {LIST_TASK_SORT_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <button className='add-task-button' onClick={List.handleAddTaskClick}>Add Task</button>
                <button className='delete-list-button' onClick={List.handleDeleteListClick}>Delete List</button>
            </div>

            <section className='list-progress-section'>
                <div className='list-progress-header'>
                    <span>Progress</span>
                    <span>{List.completionPercentage}% ({List.completedTasks}/{List.totalTasks})</span>
                </div>
                <div className='list-progress-track' role='progressbar' aria-valuenow={List.completionPercentage} aria-valuemin={0} aria-valuemax={100}>
                    <div className='list-progress-fill' style={{ width: `${List.completionPercentage}%` }} />
                </div>
            </section>

            {List.isCreatingTask && List.newTaskData && (
                <section className='task-detail-card'>
                    <h2>Create New Task</h2>
                    <TaskEditForm formData={List.newTaskData} setFormData={List.setNewTaskData} listOptions={List.lists} recurrenceOptions={List.recurrenceOptions} />
                    <div className='list-card-button-row'>
                        <button onClick={List.handleSaveNewTask}>Create</button>
                        <button className='cancel-button' onClick={List.handleCancelAddTask}>Cancel</button>
                    </div>
                </section>
            )}

            {tasks.length === 0 ? (
                <p>No tasks found in this list.</p>
            ) : (
                <div className='list-task-details'>
                    {sortedTasks.map((task) => (
                        <section key={task.id} className='task-detail-card'>
                            {List.editingTaskId === task.id && List.formData ? (
                                <>
                                    <TaskEditForm formData={List.formData} setFormData={List.setFormData} listOptions={List.lists} recurrenceOptions={List.recurrenceOptions} />
                                    <div className='list-card-button-row'>
                                        <button onClick={List.handleSaveEdit}>Save</button>
                                        <button className='cancel-button' onClick={List.handleCancelEdit}>Cancel</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <TaskView
                                        task={task}
                                        lists={[{ id: Number(List.id), title: List.listTitle || `List ${List.id}` }]}
                                    />
                                    <div className='list-card-button-row'>
                                        <button className='edit-card-button' onClick={() => List.handleEditClick(task)}>
                                            Edit
                                        </button>
                                        <button className='delete-card-button' onClick={() => void List.handleDeleteTask(task.id)}>
                                            Delete
                                        </button>
                                        <button className='delete-from-list-button' onClick={() => void List.handleDeleteFromList(task.id)}>
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
