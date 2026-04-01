import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import TaskPage from './TaskPage';

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tasks/:id" element={<TaskPage />} />
    </Routes>
  );
}

export default Router;