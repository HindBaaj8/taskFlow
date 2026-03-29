import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <main className="flex-1 ml-64 p-8 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);

export default Layout;
