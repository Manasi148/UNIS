import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function ProtectedRoute({ allowedRoles, allowPending = false }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Verifying institutional session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If student is pending approval, restrict them strictly to /pending-approval
  if (user?.role === 'STUDENT' && user?.approvalStatus === 'PENDING' && !allowPending) {
    if (location.pathname !== '/pending-approval') {
      return <Navigate to="/pending-approval" replace />;
    }
  }

  // If student is already approved and visits /pending-approval, redirect to dashboard
  if (user?.approvalStatus === 'APPROVED' && location.pathname === '/pending-approval') {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
