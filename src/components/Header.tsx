import {
  Add,
  AdminPanelSettings,
  Brightness4,
  Brightness7,
  ExitToApp,
  Home,
  List,
  Person,
  Restaurant
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  List as MuiList,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import { generateAvatarProps } from '../utils/avatarUtils';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:960px)');
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/');
  };

  const getRoleColor = (role: string) => {
    return role === 'donor' ? 'primary' : 'secondary';
  };

  const getRoleIcon = (role: string) => {
    return role === 'donor' ? <Restaurant /> : <Person />;
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { path: '/', label: 'Home', icon: <Home /> },
    { path: '/donations', label: 'Donations', icon: <List /> },
    ...(user?.role === 'donor' ? [{ path: '/donations/create', label: 'Create', icon: <Add /> }] : []),
    ...(user?.is_superuser ? [{ path: '/admin', label: 'Admin', icon: <AdminPanelSettings /> }] : []),
  ];

  const renderNavigationItems = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {navigationItems.map((item) => (
        <Button
          key={item.path}
          startIcon={item.icon}
          onClick={() => navigate(item.path)}
          sx={{
            color: 'white',
            textTransform: 'none',
            fontWeight: isActiveRoute(item.path) ? 600 : 400,
            backgroundColor: isActiveRoute(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
            px: 2,
            py: 1,
            borderRadius: 2,
          }}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );

  const renderMobileMenu = () => (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{
        sx: {
          width: 280,
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            component="img"
            src="/logo.svg"
            alt="FoodBridge Logo"
            sx={{
              height: 32,
              width: 'auto',
              mr: 1,
              color: 'white',
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            FoodBridge
          </Typography>
        </Box>
        
        <MuiList>
          {navigationItems.map((item) => (
            <ListItem
              key={item.path}
              component="div"
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              sx={{
                backgroundColor: isActiveRoute(item.path) ? 'action.selected' : 'transparent',
                borderRadius: 1,
                mb: 0.5,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActiveRoute(item.path) ? 'primary.main' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: isActiveRoute(item.path) ? 600 : 400,
                  },
                }}
              />
            </ListItem>
          ))}
        </MuiList>

        {user && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar
                  {...generateAvatarProps(user.username)}
                  sx={{
                    width: 40,
                    height: 40,
                  }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user.username}
                  </Typography>
                  <Chip
                    icon={getRoleIcon(user.role)}
                    label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    color={getRoleColor(user.role)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Person />}
                onClick={() => {
                  navigate(`/profile/${user.id}`);
                  setMobileMenuOpen(false);
                }}
                sx={{ mb: 1 }}
              >
                View Profile
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<ExitToApp />}
                onClick={handleLogout}
                sx={{ mt: 1 }}
              >
                Logout
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo and Brand */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              },
            }}
            onClick={() => navigate('/')}
          >
            <Box
              component="img"
              src="/logo.svg"
              alt="FoodBridge Logo"
              sx={{
                height: 40,
                width: 'auto',
                mr: 1,
                color: 'white',
              }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              FoodBridge
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && user && renderNavigationItems()}

          {/* Right Side Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Theme Toggle */}
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton
                onClick={toggleTheme}
                sx={{ color: 'white' }}
              >
                {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
              </IconButton>
            </Tooltip>

            {user ? (
              <>
                {/* Desktop User Info */}
                {!isMobile && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      color={getRoleColor(user.role)}
                      variant="outlined"
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                        '& .MuiChip-icon': {
                          color: 'white',
                        },
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                      {user.username}
                    </Typography>
                  </Box>
                )}

                {/* User Menu */}
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={isMobile ? () => setMobileMenuOpen(true) : handleMenu}
                  sx={{ color: 'white' }}
                >
                  <Avatar
                    {...generateAvatarProps(user.username)}
                    sx={{
                      width: 32,
                      height: 32,
                      border: '2px solid rgba(255,255,255,0.3)',
                    }}
                  />
                </IconButton>
                
                {/* Desktop Menu */}
                {!isMobile && (
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 200,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        borderRadius: 2,
                      },
                    }}
                  >
                    <MenuItem onClick={() => { handleClose(); navigate(`/profile/${user.id}`); }}>
                      <Person sx={{ mr: 2 }} />
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ExitToApp sx={{ mr: 2 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                )}
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/register')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* Mobile Menu */}
      {renderMobileMenu()}
    </AppBar>
  );
};

export default Header; 