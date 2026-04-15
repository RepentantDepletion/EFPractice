import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ListPage from './pages/ListPage';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/Analytics';
import Login from './pages/Login';

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Dashboard />} />
      <Route path="/lists/:id" element={<ListPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
    </Routes>
  );
}

export default Router;