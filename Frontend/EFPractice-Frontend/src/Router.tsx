import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ListPage from './pages/ListPage';

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/lists/:id" element={<ListPage />} />
    </Routes>
  );
}

export default Router;