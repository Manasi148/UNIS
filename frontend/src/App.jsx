import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Layouts
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Auth & Common Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DevResetPasswordPage } from './pages/auth/DevResetPasswordPage';
import { ProfilePage } from './pages/common/ProfilePage';
import { UnauthorizedPage } from './pages/common/UnauthorizedPage';
import { NotFoundPage } from './pages/common/NotFoundPage';

// Feature Pages
import { DashboardRouter } from './pages/dashboard/DashboardRouter';
import { TicketListPage } from './pages/tickets/TicketListPage';
import { TicketCreateWizardPage } from './pages/tickets/TicketCreateWizardPage';
import { TicketDetailPage } from './pages/tickets/TicketDetailPage';
import { LostFoundListPage } from './pages/lostfound/LostFoundListPage';
import { LostFoundCreatePage } from './pages/lostfound/LostFoundCreatePage';
import { LostFoundDetailPage } from './pages/lostfound/LostFoundDetailPage';
import { AnnouncementsPage } from './pages/announcements/AnnouncementsPage';
import { HotspotsPage } from './pages/hotspots/HotspotsPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { StudentManagementPage } from './pages/admin/StudentManagementPage';
import { DepartmentManagementPage } from './pages/admin/DepartmentManagementPage';
import { LocationManagementPage } from './pages/admin/LocationManagementPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { PendingApprovalPage } from './pages/auth/PendingApprovalPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dev-reset-password" element={<DevResetPasswordPage />} />
              </Route>

              {/* Dedicated Pending Approval Route for Registered Students */}
              <Route element={<ProtectedRoute allowPending={true} />}>
                <Route path="/pending-approval" element={<PendingApprovalPage />} />
              </Route>

              {/* Protected Application Routes (Approved Users Only) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardRouter />} />
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* Tickets */}
                  <Route path="/tickets" element={<TicketListPage />} />
                  <Route path="/tickets/new" element={<TicketCreateWizardPage />} />
                  <Route path="/tickets/:id" element={<TicketDetailPage />} />

                  {/* Lost & Found */}
                  <Route path="/lost-found" element={<LostFoundListPage />} />
                  <Route path="/lost-found/new" element={<LostFoundCreatePage />} />
                  <Route path="/lost-found/:id" element={<LostFoundDetailPage />} />

                  {/* Announcements */}
                  <Route path="/announcements" element={<AnnouncementsPage />} />

                  {/* Student Management / Approvals (Admin & Department Head) */}
                  <Route
                    path="/students"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'DEPARTMENT_HEAD']} />
                    }
                  >
                    <Route index element={<StudentManagementPage />} />
                  </Route>

                  {/* Hotspots (Admin & Department Head) */}
                  <Route
                    path="/hotspots"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'DEPARTMENT_HEAD']} />
                    }
                  >
                    <Route index element={<HotspotsPage />} />
                  </Route>

                  {/* Admin Protected Routes */}
                  <Route
                    element={<ProtectedRoute allowedRoles={['ADMIN']} />}
                  >
                    <Route path="/admin/users" element={<UserManagementPage />} />
                    <Route path="/admin/departments" element={<DepartmentManagementPage />} />
                    <Route path="/admin/locations" element={<LocationManagementPage />} />
                    <Route path="/admin/audit" element={<AuditLogsPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Error and Fallback Routes */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
