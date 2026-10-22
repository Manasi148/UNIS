import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StudentDashboard } from './StudentDashboard';
import { DepartmentHeadDashboard } from './DepartmentHeadDashboard';
import { AdminDashboard } from './AdminDashboard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function DashboardRouter() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" message="Loading your institutional dashboard..." />
      </div>
    );
  }

  // Pending student guard
  if (role === 'STUDENT' && user?.approvalStatus === 'PENDING') {
    return <Navigate to="/pending-approval" replace />;
  }

  switch (role) {
    case 'STUDENT':
      return <StudentDashboard />;
    case 'DEPARTMENT_HEAD':
      return <DepartmentHeadDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <StudentDashboard />;
  }
}
