import { CssBaseline } from '@mui/material';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import ProtectedRoute from './components/ProtectedRoute';
import DonationFormPage from './pages/DonationFormPage';
import DonationsPage from './pages/DonationPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

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
            <Route path="/donations/edit/:id" element={
              <ProtectedRoute>
                <DonationFormPage />
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