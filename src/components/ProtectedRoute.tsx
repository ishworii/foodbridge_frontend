import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

// Define the props for this component. It will accept any valid React component as children.
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Show a loading spinner while the AuthContext is verifying the user's session.
  // This prevents a "flash" of the login page before the user's token is checked.
  if (loading) {
    return <LoadingSpinner message="Checking authentication..." fullScreen />;
  }

  // If loading is finished and there is no user, redirect to the login page.
  // The 'replace' prop prevents the user from navigating back to this page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If loading is finished and a user exists, render the child components (the actual page).
  return <>{children}</>;
};

export default ProtectedRoute;