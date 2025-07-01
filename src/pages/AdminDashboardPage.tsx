import {
    Delete,
    Edit,
    People,
    Restaurant,
    TrendingUp,
    Visibility
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import donationService from '../api/donationService';
import DonationCard from '../components/DonationCard';
import Layout from '../components/Layout';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsResponse, donationsResponse] = await Promise.all([
        donationService.getAdminStats(),
        donationService.getAllDonations()
      ]);
      setStats(statsResponse);
      setDonations(donationsResponse);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
      setError('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDonation = async () => {
    if (!selectedDonation) return;
    
    try {
      await donationService.deleteDonation(selectedDonation.id);
      setDonations(donations.filter(d => d.id !== selectedDonation.id));
      setDeleteDialogOpen(false);
      setSelectedDonation(null);
    } catch (error) {
      console.error('Failed to delete donation', error);
      setError('Failed to delete donation');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <Alert severity="warning">No data available</Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage donations, view statistics, and monitor platform activity
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{ minWidth: 250, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <People sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Total Users</Typography>
            </Box>
            <Typography variant="h4" sx={{ mb: 1 }}>{stats.total_users}</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip label={`${stats.donor_users} Donors`} size="small" color="primary" />
              <Chip label={`${stats.receiver_users} Receivers`} size="small" color="secondary" />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 250, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Restaurant sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">Total Donations</Typography>
            </Box>
            <Typography variant="h4" sx={{ mb: 1 }}>{stats.total_donations}</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip label={`${stats.available_donations} Available`} size="small" color="success" />
              <Chip label={`${stats.claimed_donations} Claimed`} size="small" color="default" />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 250, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">Claim Rate</Typography>
            </Box>
            <Typography variant="h4" sx={{ mb: 1 }}>{stats.claim_rate?.toFixed(1) || 0}%</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Recent Donations Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent Donations
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Donor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recent_donations_list?.map((donation: any) => (
                  <TableRow key={donation.id}>
                    <TableCell>{donation.title}</TableCell>
                    <TableCell>{donation.donor_name || `User ${donation.donor}`}</TableCell>
                    <TableCell>
                      <Chip 
                        label={donation.is_claimed ? 'Claimed' : 'Available'} 
                        color={donation.is_claimed ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(donation.created_at)}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/donations/${donation.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/donations/edit/${donation.id}`)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => {
                          setSelectedDonation(donation);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* All Donations Grid */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Manage All Donations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            View, edit, and delete donations across the platform
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {donations.map((donation) => (
              <Box key={donation.id} sx={{ minWidth: 300, flex: '1 1 300px' }}>
                <DonationCard
                  donation={donation}
                  onClaim={() => {}} // No claim action in admin view
                  onEdit={() => navigate(`/donations/edit/${donation.id}`)}
                  onDelete={() => {
                    setSelectedDonation(donation);
                    setDeleteDialogOpen(true);
                  }}
                  showAdminActions={true}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Donation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedDonation?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteDonation} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminDashboardPage;