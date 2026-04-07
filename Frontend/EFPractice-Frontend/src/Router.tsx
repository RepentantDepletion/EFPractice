import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import ListPage from './ListPage';

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/lists/:id" element={<ListPage />} />
    </Routes>
  );
}

export default Router;