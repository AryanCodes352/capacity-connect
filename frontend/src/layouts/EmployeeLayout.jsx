/**
 * src/layouts/EmployeeLayout.jsx
 */

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import AIChatModal from '../components/common/AIChatModal';

export default function EmployeeLayout({ title }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={title || 'Employee Portal — Capacity Connect'} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <AIChatModal />
    </div>
  );
}
