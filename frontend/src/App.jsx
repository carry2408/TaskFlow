import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, PublicOnlyRoute } from './routes/ProtectedRoute';

import { AppLayout } from './components/layout/AppLayout';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { IssuesPage } from './pages/IssuesPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { KanbanBoardPage } from './pages/KanbanBoardPage';
import { SprintsPage } from './pages/SprintsPage';
import { TeamsPage } from './pages/TeamsPage';
import { LabelsPage } from './pages/LabelsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { UsersPage } from './pages/UsersPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="issues" element={<IssuesPage />} />
              <Route path="issues/:id" element={<IssueDetailPage />} />
              <Route path="board" element={<KanbanBoardPage />} />
              <Route path="sprints" element={<SprintsPage />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="labels" element={<LabelsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
