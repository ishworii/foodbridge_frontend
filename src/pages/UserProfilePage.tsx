import {
    ArrowBack,
    Category,
    Edit,
    TrendingUp
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import DonationCard from '../components/DonationCard';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import type { Donation, User } from '../types';
import { generateAvatarProps } from '../utils/avatarUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const isOwnProfile = currentUser?.id.toString() === userId;

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserDonations();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get(`/users/${userId}/`);
      setUser(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load user profile');
      console.error(err);
    }
  };

  const fetchUserDonations = async () => {
    try {
      const response = await axiosInstance.get(`/users/${userId}/donations/`);
      setUserDonations(response.data);
    } catch (err: any) {
      console.error('Failed to load user donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDonationStats = () => {
    const total = userDonations.length;
    const available = userDonations.filter(d => !d.is_claimed).length;
    const claimed = userDonations.filter(d => d.is_claimed).length;
    const claimRate = total > 0 ? (claimed / total) * 100 : 0;

    return { total, available, claimed, claimRate };
  };

  const getFoodTypeStats = () => {
    const foodTypes: { [key: string]: number } = {};
    userDonations.forEach(donation => {
      const type = donation.food_type || 'other';
      foodTypes[type] = (foodTypes[type] || 0) + 1;
    });
    return foodTypes;
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            Error Loading Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/donations')}>
            Back to Donations
          </Button>
        </Box>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            User Not Found
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/donations')}>
            Back to Donations
          </Button>
        </Box>
      </Layout>
    );
  }

  const stats = getDonationStats();
  const foodTypeStats = getFoodTypeStats();

  return (
    <Layout>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/donations')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flex: 1 }}>
          {isOwnProfile ? 'My Profile' : `${user.username}'s Profile`}
        </Typography>
        {isOwnProfile && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Profile Info */}
        <Box sx={{ flex: { md: '0 0 400px' } }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                {...generateAvatarProps(user.username)}
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                }}
              />
              <Typography variant="h5" sx={{ mb: 1 }}>
                {user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {user.email}
              </Typography>
              <Chip
                label={user.role === 'donor' ? 'Donor' : 'Receiver'}
                color={user.role === 'donor' ? 'primary' : 'secondary'}
                variant="filled"
              />
              <Box sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Member since:</strong> {formatDate(user.date_joined)}
                </Typography>
                {user.last_login && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Last active:</strong> {formatDate(user.last_login)}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp />
                Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Donations:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Available:</Typography>
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    {stats.available}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Claimed:</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    {stats.claimed}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Claim Rate:</Typography>
                  <Typography variant="body2" color="primary.main" fontWeight="bold">
                    {stats.claimRate.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Food Type Distribution */}
          {Object.keys(foodTypeStats).length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Category />
                  Food Types
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(foodTypeStats).map(([type, count]) => (
                    <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {type}:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="profile tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Donations" />
              <Tab label="Activity" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {userDonations.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                  {userDonations.map((donation) => (
                    <Box key={donation.id}>
                      <DonationCard
                        donation={donation}
                        onClaim={() => {}} // No claim action on profile
                        onEdit={() => navigate(`/donations/edit/${donation.id}`)}
                        onDelete={() => {}} // Handle delete separately
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    No donations yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isOwnProfile 
                      ? "You haven't created any donations yet."
                      : "This user hasn't created any donations yet."
                    }
                  </Typography>
                  {isOwnProfile && (
                    <Button
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/donations/create')}
                    >
                      Create Your First Donation
                    </Button>
                  )}
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Activity Feed
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recent activity will be displayed here.
                </Typography>
              </Box>
            </TabPanel>
          </Paper>
        </Box>
      </Box>
    </Layout>
  );
};

export default UserProfilePage; 