import {
    Brightness4, Brightness7,
    Person,
    Restaurant,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import {
    Alert,
    Box,
    Button,
    Container,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useTheme as useThemeContext } from '../context/ThemeContext';

const RegisterPage: React.FC = () => {
  const { mode, toggleTheme } = useThemeContext();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'receiver',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/auth/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      // Redirect to login page after successful registration
      window.location.href = '/login';
    } catch (err: any) {
      setError(
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.role?.[0] ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      role: event.target.value,
    }));
  };

  const getRoleIcon = (role: string) => {
    return role === 'donor' ? <Restaurant /> : <Person />;
  };

  const getRoleDescription = (role: string) => {
    return role === 'donor' 
      ? 'Share surplus food with your community'
      : 'Find and claim available food donations';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme => theme.palette.background.default, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Theme Toggle Button */}
      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
        <IconButton onClick={toggleTheme} color="inherit">
          {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
        </IconButton>
      </Box>
      <Container maxWidth="sm" sx={{ width: '100%' }}>
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 4,
            background: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid #e0e0e0',
            width: '100%',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src="/logo.svg"
              alt="FoodBridge Logo"
              sx={{
                height: 64,
                width: 'auto',
                mb: 2,
                color: 'primary.main',
              }}
            />
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                color: 'primary.main',
              }}
            >
              Join FoodBridge
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
              }}
            >
              Connect with your community through food sharing
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange('username')}
                helperText="Choose a unique username"
                InputProps={{
                  sx: {
                    backgroundColor: 'background.paper',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
                FormHelperTextProps={{
                  sx: {
                    color: 'text.secondary',
                  },
                }}
              />

              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange('email')}
                helperText="We'll never share your email"
                InputProps={{
                  sx: {
                    backgroundColor: 'background.paper',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
                FormHelperTextProps={{
                  sx: {
                    color: 'text.secondary',
                  },
                }}
              />

              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange('password')}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  ),
                  sx: {
                    backgroundColor: 'background.paper',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
                FormHelperTextProps={{
                  sx: {
                    color: 'text.secondary',
                  },
                }}
                helperText="At least 8 characters"
              />

              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  ),
                  sx: {
                    backgroundColor: 'background.paper',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
                FormHelperTextProps={{
                  sx: {
                    color: 'text.secondary',
                  },
                }}
                helperText="Confirm your password"
              />

              <FormControl fullWidth>
                <InputLabel 
                  sx={{ 
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  }}
                >
                  Role
                </InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={handleRoleChange}
                  sx={{
                    backgroundColor: 'background.paper',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <MenuItem value="receiver">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person />
                      <Box>
                        <Typography variant="body1">Receiver</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Find and claim available food donations
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value="donor">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Restaurant />
                      <Box>
                        <Typography variant="body1">Donor</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Share surplus food with your community
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Role Description */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#e0e0e0',
                  border: '1px solid #e0e0e0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {getRoleIcon(formData.role)}
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main',
                    }}
                  >
                    {formData.role === 'donor' ? 'Donor' : 'Receiver'}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                  }}
                >
                  {getRoleDescription(formData.role)}
                </Typography>
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                mt: 3,
                mb: 3,
                fontWeight: 600,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #ff6b35 0%, #e64a19 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #e64a19 0%, #d84315 100%)',
                },
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1,
                  color: 'text.secondary',
                }}
              >
                Already have an account?
              </Typography>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{
                    fontWeight: 600,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'primary.main',
                      color: 'white',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Link>
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#e0e0e0',
            }}
          >
            Connecting communities through food sharing
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;