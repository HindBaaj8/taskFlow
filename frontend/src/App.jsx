import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { getMe } from './features/auth/authSlice';

import Layout        from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage    from './pages/TasksPage';
import ChatPage     from './pages/ChatPage';
import ReportsPage  from './pages/ReportsPage';
import UsersPage    from './pages/UsersPage';

const App = () => {
  const dispatch        = useDispatch();
  const { token, user } = useSelector((s) => s.auth);

  // Restore session on reload
  useEffect(() => {
    if (token && !user) dispatch(getMe());
  }, [token, user, dispatch]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: '14px', borderRadius: '10px' },
          success: { iconTheme: { primary: '#4f46e5', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes inside Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard"   element={<DashboardPage />} />
          <Route path="/projects"    element={<ProjectsPage />} />
          <Route path="/tasks"       element={<TasksPage />} />
          <Route path="/chat"        element={<ChatPage />} />
          <Route path="/reports"     element={<ReportsPage />} />

          {/* Admin only */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
