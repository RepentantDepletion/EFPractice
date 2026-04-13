import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ListPage from './pages/ListPage';
import SettingsPage from './pages/SettingsPage';

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/lists/:id" element={<ListPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}

export default Router;