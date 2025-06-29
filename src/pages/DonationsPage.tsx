import {
    Add as AddIcon,
    ExpandMore,
    FilterList as FilterIcon,
    ViewList as ListIcon,
    LocationOn as LocationIcon,
    Map as MapIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Chip,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Slider,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import donationService from '../api/donationService';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import DonationCard from '../components/DonationCard';
import DonationsMapLeaflet from '../components/DonationsMapLeaflet';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import SuccessNotification from '../components/SuccessNotification';
import { useAuth } from '../context/AuthContext';
import type { Donation } from '../types';

const DonationsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'claimed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDonation, setDeletingDonation] = useState<Donation | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Enhanced filters
  const [distanceFilter, setDistanceFilter] = useState<number>(10); // miles
  const [foodTypeFilter, setFoodTypeFilter] = useState<string>('all');
  const [expiryFilter, setExpiryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { user } = useAuth();

  // Food type options
  const foodTypes = [
    'all',
    'fruits',
    'vegetables',
    'grains',
    'dairy',
    'meat',
    'baked goods',
    'canned goods',
    'frozen foods',
    'beverages',
    'snacks',
    'other'
  ];

  // Expiry options
  const expiryOptions = [
    { value: 'all', label: 'All' },
    { value: 'today', label: 'Expires Today' },
    { value: 'tomorrow', label: 'Expires Tomorrow' },
    { value: 'week', label: 'Expires This Week' },
    { value: 'month', label: 'Expires This Month' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'expiry', label: 'Expires Soon' },
    { value: 'distance', label: 'Nearest' },
    { value: 'title', label: 'Title A-Z' },
  ];

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await donationService.getDonations();
      const sortedData = data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setDonations(sortedData);
      setError('');
    } catch (err) {
      setError('Failed to fetch donations. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Could not get location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleClaim = async (donationId: number) => {
    setError('');
    try {
      await donationService.claimDonation(donationId);
      await fetchDonations();
      setSuccessMessage('Donation claimed successfully!');
      setSuccessOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to claim donation.");
      console.error(err);
    }
  };

  const handleEdit = (donationId: number) => {
    navigate(`/donations/edit/${donationId}`);
  };

  const handleDelete = (donation: Donation) => {
    setDeletingDonation(donation);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingDonation) return;
    
    setDeleteLoading(true);
    setError('');
    try {
      await donationService.deleteDonation(deletingDonation.id);
      await fetchDonations();
      setSuccessMessage('Donation deleted successfully!');
      setSuccessOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete donation.");
      console.error(err);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setDeletingDonation(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingDonation(null);
  };

  const handleCreateDonation = () => {
    navigate('/donations/create');
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Check if donation matches expiry filter
  const checkExpiryFilter = (donation: Donation): boolean => {
    if (!donation.expiry_date || expiryFilter === 'all') return true;
    
    const expiryDate = new Date(donation.expiry_date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    switch (expiryFilter) {
      case 'today':
        return expiryDate.toDateString() === today.toDateString();
      case 'tomorrow':
        return expiryDate.toDateString() === tomorrow.toDateString();
      case 'week':
        return expiryDate <= nextWeek && expiryDate >= today;
      case 'month':
        return expiryDate <= nextMonth && expiryDate >= today;
      default:
        return true;
    }
  };

  // Filter and sort donations
  const filteredAndSortedDonations = donations
    .filter(donation => {
      const matchesSearch = 
        donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'available' && !donation.is_claimed) ||
        (statusFilter === 'claimed' && donation.is_claimed);
      
      const matchesFoodType = 
        foodTypeFilter === 'all' || 
        donation.food_type?.toLowerCase() === foodTypeFilter.toLowerCase();
      
      const matchesExpiry = checkExpiryFilter(donation);
      
      // Distance filter (if user location is available)
      let matchesDistance = true;
      if (userLocation && donation.latitude && donation.longitude) {
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          donation.latitude, donation.longitude
        );
        matchesDistance = distance <= distanceFilter;
      }
      
      return matchesSearch && matchesStatus && matchesFoodType && matchesExpiry && matchesDistance;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'expiry':
          if (!a.expiry_date || !b.expiry_date) return 0;
          return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
        case 'distance':
          if (!userLocation) return 0;
          const distA = a.latitude && a.longitude ? 
            calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude) : Infinity;
          const distB = b.latitude && b.longitude ? 
            calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude) : Infinity;
          return distA - distB;
        case 'title':
          return a.title.localeCompare(b.title);
        default: // newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const availableCount = donations.filter(d => !d.is_claimed).length;
  const claimedCount = donations.filter(d => d.is_claimed).length;

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading donations..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <SuccessNotification
        open={successOpen}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />
      
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Donation"
        message={`Are you sure you want to delete "${deletingDonation?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        loading={deleteLoading}
      />

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            Food Donations
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="list">
                <ListIcon />
              </ToggleButton>
              <ToggleButton value="map">
                <MapIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Tooltip title="Refresh donations">
              <IconButton onClick={fetchDonations} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            {user?.role === 'donor' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateDonation}
                sx={{ fontWeight: 600 }}
              >
                Create Donation
              </Button>
            )}
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label={`${availableCount} Available`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${claimedCount} Claimed`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`${filteredAndSortedDonations.length} Showing`}
            color="info"
            variant="outlined"
          />
          {userLocation && (
            <Chip
              icon={<LocationIcon />}
              label="Location Enabled"
              color="secondary"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Enhanced Filters Section */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography 
              variant="h6" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: theme.palette.text.primary,
              }}
            >
              <FilterIcon />
              Filters & Search
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Search and Basic Filters */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Search donations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    minWidth: 300, 
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.background.paper,
                    },
                  }}
                />
                
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <MenuItem value="all">All Donations</MenuItem>
                    <MenuItem value="available">Available Only</MenuItem>
                    <MenuItem value="claimed">Claimed Only</MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Food Type</InputLabel>
                  <Select
                    value={foodTypeFilter}
                    label="Food Type"
                    onChange={(e) => setFoodTypeFilter(e.target.value)}
                  >
                    {foodTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Expiry</InputLabel>
                  <Select
                    value={expiryFilter}
                    label="Expiry"
                    onChange={(e) => setExpiryFilter(e.target.value)}
                  >
                    {expiryOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {sortOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Distance Filter */}
              {userLocation && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Distance: {distanceFilter} miles
                  </Typography>
                  <Slider
                    value={distanceFilter}
                    onChange={(e, value) => setDistanceFilter(value as number)}
                    min={1}
                    max={50}
                    marks={[
                      { value: 1, label: '1 mi' },
                      { value: 10, label: '10 mi' },
                      { value: 25, label: '25 mi' },
                      { value: 50, label: '50 mi' },
                    ]}
                    valueLabelDisplay="auto"
                    sx={{ maxWidth: 400 }}
                  />
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Content - Map or List View */}
      {viewMode === 'map' ? (
        <DonationsMapLeaflet 
          donations={filteredAndSortedDonations}
          userLocation={userLocation}
          onClaim={handleClaim}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        /* List View */
        filteredAndSortedDonations.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {filteredAndSortedDonations.map((donation) => (
              <Box key={donation.id}>
                <DonationCard
                  donation={donation}
                  onClaim={handleClaim}
                  onEdit={handleEdit}
                  onDelete={() => handleDelete(donation)}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              color: 'text.secondary',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              No donations found
            </Typography>
            <Typography variant="body2">
              Try adjusting your filters or create a new donation.
            </Typography>
          </Box>
        )
      )}
    </Layout>
  );
};

export default DonationsPage; 