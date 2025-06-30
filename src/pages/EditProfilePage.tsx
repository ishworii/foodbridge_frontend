import {
    ArrowBack,
    Save,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Layout from '../components/Layout';
import SuccessNotification from '../components/SuccessNotification';
import { useAuth } from '../context/AuthContext';

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username,
        email: currentUser.email,
      });
    }
  }, [currentUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.put(`/users/${currentUser?.id}/`, formData);
      updateUser(response.data);
      setSuccessMessage('Profile updated successfully!');
      setSuccessOpen(true);
      setTimeout(() => {
        navigate(`/profile/${currentUser?.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Layout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Please log in to edit your profile
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(`/profile/${currentUser.id}`)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flex: 1 }}>
          Edit Profile
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Error Display */}
              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}

              {/* Username Field */}
              <TextField
                label="Username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
                fullWidth
                variant="outlined"
              />

              {/* Email Field */}
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                fullWidth
                variant="outlined"
              />

              {/* Role Display (Read-only) */}
              <TextField
                label="Role"
                value={currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                disabled
                fullWidth
                variant="outlined"
                helperText="Role cannot be changed"
              />

              {/* Submit Button */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/profile/${currentUser.id}`)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Success Notification */}
      <SuccessNotification
        open={successOpen}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />
    </Layout>
  );
};

export default EditProfilePage; 