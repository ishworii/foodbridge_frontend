import { CssBaseline } from '@mui/material';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import ProtectedRoute from './components/ProtectedRoute';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DonationDetailPage from './pages/DonationDetailPage';
import DonationFormPage from './pages/DonationFormPage';
import DonationsPage from './pages/DonationsPage';
import EditProfilePage from './pages/EditProfilePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Protected routes */}
            <Route path="/donations" element={
              <ProtectedRoute>
                <DonationsPage />
              </ProtectedRoute>
            } />
            <Route path="/donations/create" element={
              <ProtectedRoute>
                <DonationFormPage />
              </ProtectedRoute>
            } />
            <Route path="/donations/:id" element={
              <ProtectedRoute>
                <DonationDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/donations/edit/:id" element={
              <ProtectedRoute>
                <DonationFormPage />
              </ProtectedRoute>
            } />
            <Route path="/profile/:userId" element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } />
            
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;