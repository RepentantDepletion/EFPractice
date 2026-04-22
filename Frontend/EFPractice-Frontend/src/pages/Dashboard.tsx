import TaskView from '../features/tasks/components/TaskView.tsx'
import TaskEditForm from '../features/tasks/components/TaskEditForm.tsx'
import Notifications from '../shared/components/Notifications.tsx'
import {
    DASHBOARD_NAV_LINKS,
    TASK_SORT_OPTIONS,
    type TaskSortMode,
} from '../features/dashboard/Dashboard.constants.tsx'
import { useDashboardPage } from '../features/dashboard/DashboardController.tsx'

import '../styles/App.css'
import '../styles/DashboardPage.css'

function Dashboard() {
    const dashboard = useDashboardPage()

    return (
        <div className="dashboard-layout">
            <Notifications notifications={dashboard.notifications} onDismiss={dashboard.dismissNotification} position='top-right' />
            <aside className="dashboard-sidebar">
                <div className="dashboard-header">
                    <div className="dashboard-header-row">
                        <h1>Task Manager</h1>
                        <button className="logout-button" onClick={() => void dashboard.handleLogout()} type="button">
                            Logout
                        </button>
                    </div>
                    <input
                        className="sidebar-search"
                        type="text"
                        placeholder="Search tasks and lists"
                        value={dashboard.searchQuery}
                        onChange={(event) => dashboard.setSearchQuery(event.target.value)}
                    />
                </div>

                <main className={dashboard.showTaskDetails ? "task-details-panel is-visible" : "task-details-panel is-hidden"}>
                    <div key={dashboard.detailsTransitionKey} className="task-details-content">
                    {dashboard.selectedLoading ? (
                        <p>Loading task details…</p>
                    ) : dashboard.isCreatingTask && dashboard.newTaskData ? (
                        <>
                            <div className="task-details-header">
                                <button className="close-button" onClick={dashboard.handleCancelAddTask}>
                                    Close
                                </button>
                            </div>

                            <h2>Create New Task</h2>
                            <TaskEditForm formData={dashboard.newTaskData} setFormData={dashboard.setNewTaskData} listOptions={dashboard.lists} recurrenceOptions={dashboard.recurrenceType} />

                            <div className="button-row">
                                <button onClick={dashboard.handleSaveNewTask}>Create</button>
                                <button className="cancel-button" onClick={dashboard.handleCancelAddTask}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : dashboard.selectedTask ? (
                        <>
                            <div className="task-details-header">
                                <button className="close-button" onClick={dashboard.handleCloseTaskDetails}>
                                    Close
                                </button>
                            </div>

                            {dashboard.isEditing && dashboard.formData ? (
                                <TaskEditForm formData={dashboard.formData} setFormData={dashboard.setFormData} listOptions={dashboard.lists} recurrenceOptions={dashboard.recurrenceType} />
                            ) : (
                                <TaskView task={dashboard.selectedTask} lists={dashboard.lists} />
                            )}


                            <div className="button-row">
                                <button onClick={dashboard.handleEdit}>
                                    {dashboard.isEditing ? 'Save' : 'Edit'}
                                </button>
                                {dashboard.isEditing && (
                                    <button onClick={() => dashboard.setIsEditing(false)}>
                                        Cancel
                                    </button>
                                )}
                                {!dashboard.isEditing && (
                                    <button className="delete-button" onClick={() => void dashboard.handleDeleteSelectedTask()}>
                                        Delete
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <p>Select a task from the list to view its details here.</p>
                    )}

                    {dashboard.error && <p className="error-message">{dashboard.error}</p>}
                    </div>
                </main>
            </aside>

            <div className="dashboard-main">
                <section className="navigation-panel">
                    <h2>Navigation Panel</h2>
                    <ul>
                        {DASHBOARD_NAV_LINKS.map((item) => (
                            <button key={item.path} className='navigation-buttons' onClick={() => dashboard.navigate(item.path)}>
                                {item.label}
                            </button>
                        ))}
                    </ul>

                    <div className="task-container">
                        <div className="task-list">
                            <div className="task-list-header-row">
                                <h3>Tasks</h3>
                                <div className='task-list-actions'>
                                    <label htmlFor='dashboard-sort-task-select' className='sort-task-label'>Sort:</label>
                                    <select
                                        id='dashboard-sort-task-select'
                                        className='sort-task-select'
                                        value={dashboard.sortMode}
                                        onChange={(event) => dashboard.setSortMode(event.target.value as TaskSortMode)}
                                    >
                                        {TASK_SORT_OPTIONS.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    <button className='add-task-button' onClick={dashboard.handleAddTaskClick}>Add Task</button>
                                </div>
                            </div>
                            {dashboard.loading ? (
                                <p>Loading tasks…</p>
                            ) : dashboard.filteredTasks.length === 0 ? (
                                <p>No tasks available. Please add some tasks.</p>
                            ) : (
                                <ul className="task-list">
                                    {dashboard.visibleTasks.map((task) => {
                                        const taskListId = task.list;
                                        const listName = taskListId === null
                                            ? 'No List'
                                            : dashboard.lists.find(list => list.id === parseInt(taskListId, 10))?.title || 'Unknown List';
                                        const isTaskOverdue = !task.done && new Date(task.deadline).getTime() < Date.now();
                                        const taskStateClassName = isTaskOverdue
                                            ? 'task-card-overdue'
                                            : task.done
                                                ? 'task-card-completed'
                                                : 'task-card-pending';
                                        return (
                                            <li key={task.id}>
                                                <button
                                                    className={`task-card ${taskStateClassName}`}
                                                    onDoubleClick={() => dashboard.handleTaskCardDoubleClick(task.id)}
                                                    onClick={() => dashboard.handleTaskCardClick(task.id)}
                                                    draggable
                                                    onDragStart={(event) => dashboard.handleTaskDragStart(event, task.id)}
                                                    onDragEnd={dashboard.handleTaskDragEnd}
                                                >
                                                    <div>{task.title}</div>
                                                    <div style={{ fontSize: '0.85em', opacity: 0.7 }}>{listName}</div>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className='list-container'>
                        <div className='list-header-row'>
                            <h3>Lists</h3>
                            <button className='add-list-button' onClick={dashboard.handleAddListClick}>New List</button>
                        </div>

                        {dashboard.isCreatingList && (
                            <div className='list-create-row'>
                                <input
                                    className='editable-input'
                                    type='text'
                                    placeholder='List name'
                                    value={dashboard.newListTitle}
                                    onChange={(event) => dashboard.setNewListTitle(event.target.value)}
                                />
                                <button onClick={dashboard.handleSaveNewList}>Create</button>
                                <button className='cancel-button' onClick={dashboard.handleCancelAddList}>Cancel</button>
                            </div>
                        )}

                        <div className='list-record'>
                            {dashboard.filteredLists.length === 0 ? (
                                <p>No lists available. Please add some lists.</p>
                            ) : (
                                <ul className='list-record'>
                                    {dashboard.filteredLists.map((list) => {
                                        const tasksInList = dashboard.tasks.filter((task) => task.list === String(list.id));
                                        const taskCount = tasksInList.length;
                                        const allTasksCompleted = taskCount > 0 && tasksInList.every((task) => task.done);
                                        const hasOverdueTask = tasksInList.some(
                                            (task) => !task.done && new Date(task.deadline).getTime() < Date.now()
                                        );
                                        const listStateClassName = hasOverdueTask
                                            ? 'list-card-overdue'
                                            : allTasksCompleted
                                                ? 'list-card-completed'
                                                : 'list-card-pending';
                                        return (
                                            <li key={list.id}>
                                                <button
                                                    className={`task-card ${listStateClassName} ${dashboard.dropTargetListId === list.id ? 'drop-target' : ''}`}
                                                    onDoubleClick={() => dashboard.handleListCardDoubleClick(list.id)}
                                                    onClick={() => dashboard.handleListCardClick(list.id)}
                                                    onDragOver={(event) => dashboard.handleListDragOver(event, list.id)}
                                                    onDragLeave={dashboard.handleListDragLeave}
                                                    onDrop={(event) => void dashboard.handleTaskDropOnList(event, list.id)}
                                                >
                                                    <div>{list.title}</div>
                                                    <div style={{ fontSize: '0.85em', opacity: 0.7 }}>{taskCount} {taskCount === 1 ? 'task' : 'tasks'}</div>
                                                </button>
                                            </li>
                                        );
                                    })}
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