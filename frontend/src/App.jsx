import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Grievances from './pages/Grievances';
import { DashboardPage as Analytics } from './pages/DashboardPage';
import { HotspotsPage as PulseMap } from './pages/HotspotsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="grievances" element={<Grievances />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="map" element={<PulseMap />} />
          <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-semibold">Settings</h1><p className="mt-4 text-gray-500">To be implemented...</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
