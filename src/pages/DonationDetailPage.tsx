import {
    ArrowBack,
    Category,
    Delete,
    Edit,
    LocationOn,
    MyLocation,
    Numbers,
    Person,
    Schedule,
    Warning
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
    Typography,
    useTheme
} from '@mui/material';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Layout from '../components/Layout';
import SuccessNotification from '../components/SuccessNotification';
import { useAuth } from '../context/AuthContext';
import type { Donation } from '../types';

// Component to handle map bounds and center
const MapController: React.FC<{ 
    donationLat: number; 
    donationLng: number; 
    userLat?: number; 
    userLng?: number; 
}> = ({ donationLat, donationLng, userLat, userLng }) => {
    const map = useMap();
    
    useEffect(() => {
        if (userLat && userLng) {
            // Fit bounds to include both locations
            const bounds: [[number, number], [number, number]] = [
                [Math.min(donationLat, userLat), Math.min(donationLng, userLng)],
                [Math.max(donationLat, userLat), Math.max(donationLng, userLng)]
            ];
            map.fitBounds(bounds, { padding: [20, 20] });
        } else {
            // Just center on donation location
            map.setView([donationLat, donationLng], 15);
        }
    }, [map, donationLat, donationLng, userLat, userLng]);

    return null;
};

const DonationDetailPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    
    const [donation, setDonation] = useState<Donation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successOpen, setSuccessOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDonation();
        }
        getUserLocation();
    }, [id]);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            setLocationLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setLocationLoading(false);
                },
                (error) => {
                    console.log('Could not get location:', error);
                    setLocationLoading(false);
                }
            );
        }
    };

    const fetchDonation = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/donations/${id}/`);
            setDonation(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load donation details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!donation) return;
        
        try {
            await axiosInstance.post(`/donations/${donation.id}/claim/`);
            setSuccessMessage('Donation claimed successfully!');
            setSuccessOpen(true);
            await fetchDonation(); // Refresh donation data
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to claim donation');
            console.error(err);
        }
    };

    const handleEdit = () => {
        navigate(`/donations/edit/${id}`);
    };

    const handleDelete = () => {
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!donation) return;
        
        setDeleteLoading(true);
        try {
            await axiosInstance.delete(`/donations/${donation.id}/`);
            setSuccessMessage('Donation deleted successfully!');
            setSuccessOpen(true);
            setTimeout(() => {
                navigate('/donations');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete donation');
            console.error(err);
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
        }
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDistance = (distance: number) => {
        if (distance < 1) {
            return `${Math.round(distance * 5280)} ft`;
        }
        return `${distance.toFixed(1)} mi`;
    };

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

    // Custom map icons
    const createDonationIcon = (isClaimed: boolean) => {
        const color = isClaimed ? '#9E9E9E' : '#4CAF50';
        const size = isClaimed ? 20 : 24;
        
        return divIcon({
            html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">🍽️</div>`,
            className: 'donation-marker',
            iconSize: [size, size],
            iconAnchor: [size/2, size/2],
        });
    };

    const createUserLocationIcon = () => {
        return divIcon({
            html: `<div style="background-color: #2196F3; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">📍</div>`,
            className: 'user-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
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
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                        Error Loading Donation
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

    if (!donation) {
        return (
            <Layout>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Donation Not Found
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate('/donations')}>
                        Back to Donations
                    </Button>
                </Box>
            </Layout>
        );
    }

    const isOwner = user?.id === donation.donor_id;
    const canEdit = isOwner && !donation.is_claimed;
    const canDelete = isOwner;

    // Calculate distance if both locations are available
    const distance = userLocation && donation.latitude && donation.longitude 
        ? calculateDistance(userLocation.lat, userLocation.lng, donation.latitude, donation.longitude)
        : null;

    return (
        <Layout>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate('/donations')}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h4" sx={{ flex: 1 }}>
                    {donation.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {!donation.is_claimed && !isOwner && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleClaim}
                        >
                            Claim Donation
                        </Button>
                    )}
                    {canEdit && (
                        <Button
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={handleEdit}
                        >
                            Edit
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Status Alert */}
            {donation.is_claimed && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2">
                        This donation has been claimed
                    </Typography>
                </Alert>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 400px' }, gap: 3 }}>
                {/* Main Content */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Description Card */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Description
                            </Typography>
                            <Box 
                                sx={{ 
                                    color: 'text.secondary',
                                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                                        color: 'text.primary',
                                        fontWeight: 600,
                                        mb: 1,
                                    },
                                    '& p': {
                                        color: 'text.secondary',
                                        mb: 1,
                                        lineHeight: 1.6,
                                    },
                                    '& ul, & ol': {
                                        color: 'text.secondary',
                                        pl: 2,
                                        mb: 1,
                                        lineHeight: 1.6,
                                    },
                                    '& li': {
                                        color: 'text.secondary',
                                        mb: 0.5,
                                    },
                                    '& strong, & b': {
                                        color: 'text.primary',
                                        fontWeight: 600,
                                    },
                                    '& em, & i': {
                                        color: 'text.secondary',
                                        fontStyle: 'italic',
                                    },
                                    '& a': {
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    },
                                    '& blockquote': {
                                        borderLeft: '4px solid',
                                        borderColor: 'primary.main',
                                        pl: 2,
                                        ml: 0,
                                        my: 1,
                                        fontStyle: 'italic',
                                        color: 'text.secondary',
                                    },
                                    '& code': {
                                        backgroundColor: 'action.hover',
                                        px: 0.5,
                                        py: 0.25,
                                        borderRadius: 0.5,
                                        fontFamily: 'monospace',
                                        fontSize: '0.875em',
                                    },
                                    '& pre': {
                                        backgroundColor: 'action.hover',
                                        p: 1,
                                        borderRadius: 1,
                                        overflow: 'auto',
                                        fontFamily: 'monospace',
                                        fontSize: '0.875em',
                                    },
                                }}
                                dangerouslySetInnerHTML={{ __html: donation.description }}
                            />
                        </CardContent>
                    </Card>

                    {/* Image Card */}
                    {donation.image_url && (
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Image
                                </Typography>
                                <Box
                                    component="img"
                                    src={donation.image_url}
                                    alt={donation.title}
                                    sx={{
                                        width: '100%',
                                        maxHeight: 400,
                                        objectFit: 'cover',
                                        borderRadius: 1,
                                    }}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Details Card */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Details
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Numbers />
                                    <Typography variant="body2">
                                        <strong>Quantity:</strong> {donation.quantity}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Category />
                                    <Typography variant="body2">
                                        <strong>Food Type:</strong> {donation.food_type || 'Not specified'}
                                    </Typography>
                                </Box>
                                {donation.expiry_date && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Schedule />
                                        <Typography variant="body2">
                                            <strong>Expires:</strong> {formatDate(donation.expiry_date)}
                                        </Typography>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Person />
                                    <Typography variant="body2">
                                        <strong>Donor:</strong> {donation.donor_name || 'Anonymous'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Schedule />
                                    <Typography variant="body2">
                                        <strong>Created:</strong> {formatDate(donation.created_at)}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Enhanced Location Card */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Location
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <LocationOn />
                                <Typography variant="body1">
                                    {donation.location}
                                </Typography>
                            </Box>

                            {/* Distance Information */}
                            {distance && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <MyLocation />
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Distance from you:</strong> {formatDistance(distance)}
                                    </Typography>
                                </Box>
                            )}

                            {/* Location Status */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                {locationLoading ? (
                                    <CircularProgress size={16} />
                                ) : userLocation ? (
                                    <Chip 
                                        icon={<MyLocation />} 
                                        label="Your location detected" 
                                        color="success" 
                                        size="small" 
                                    />
                                ) : (
                                    <Chip 
                                        icon={<Warning />} 
                                        label="Location access denied" 
                                        color="warning" 
                                        size="small" 
                                    />
                                )}
                            </Box>
                            
                            {/* Enhanced Map */}
                            {donation.latitude && donation.longitude && (
                                <Box sx={{ height: 400, borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
                                    <MapContainer
                                        center={[donation.latitude, donation.longitude]}
                                        zoom={13}
                                        style={{ height: '100%', width: '100%' }}
                                        zoomControl={true}
                                        scrollWheelZoom={true}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        
                                        {/* Donation Marker */}
                                        <Marker
                                            position={[donation.latitude, donation.longitude]}
                                            icon={createDonationIcon(donation.is_claimed)}
                                        >
                                            <Popup>
                                                <div>
                                                    <h3>{donation.title}</h3>
                                                    <p><strong>Location:</strong> {donation.location}</p>
                                                    <p><strong>Status:</strong> {donation.is_claimed ? 'Claimed' : 'Available'}</p>
                                                    {distance && (
                                                        <p><strong>Distance:</strong> {formatDistance(distance)}</p>
                                                    )}
                                                </div>
                                            </Popup>
                                        </Marker>

                                        {/* User Location Marker */}
                                        {userLocation && (
                                            <>
                                                <Marker
                                                    position={[userLocation.lat, userLocation.lng]}
                                                    icon={createUserLocationIcon()}
                                                >
                                                    <Popup>
                                                        <div>
                                                            <h3>Your Location</h3>
                                                            <p><strong>Distance to donation:</strong> {formatDistance(distance!)}</p>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                                
                                                {/* Circle around user location to show accuracy */}
                                                <Circle
                                                    center={[userLocation.lat, userLocation.lng]}
                                                    radius={100}
                                                    pathOptions={{
                                                        color: '#2196F3',
                                                        fillColor: '#2196F3',
                                                        fillOpacity: 0.1,
                                                        weight: 2,
                                                    }}
                                                />
                                            </>
                                        )}

                                        {/* Map Controller for automatic bounds */}
                                        <MapController 
                                            donationLat={donation.latitude}
                                            donationLng={donation.longitude}
                                            userLat={userLocation?.lat}
                                            userLng={userLocation?.lng}
                                        />
                                    </MapContainer>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                {/* Sidebar */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Status Card */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Status
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Chip
                                    label={donation.is_claimed ? 'Claimed' : 'Available'}
                                    color={donation.is_claimed ? 'default' : 'success'}
                                    variant="filled"
                                />
                                {donation.is_claimed && (
                                    <Typography variant="body2" color="text.secondary">
                                        This donation has been claimed and is no longer available.
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Location Info Card */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Location Information
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Address:</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {donation.location}
                                    </Typography>
                                </Box>
                                {distance && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Distance:</Typography>
                                        <Typography variant="body2" color="primary.main" fontWeight="bold">
                                            {formatDistance(distance)}
                                        </Typography>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Coordinates:</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {donation.latitude && donation.longitude 
                                            ? `${donation.latitude.toFixed(4)}, ${donation.longitude.toFixed(4)}`
                                            : 'Not available'
                                        }
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Actions Card */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Actions
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {!donation.is_claimed && !isOwner && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={handleClaim}
                                    >
                                        Claim This Donation
                                    </Button>
                                )}
                                {canEdit && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<Edit />}
                                        fullWidth
                                        onClick={handleEdit}
                                    >
                                        Edit Donation
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        fullWidth
                                        onClick={handleDelete}
                                    >
                                        Delete Donation
                                    </Button>
                                )}
                                <Button
                                    variant="outlined"
                                    startIcon={<ArrowBack />}
                                    fullWidth
                                    onClick={() => navigate('/donations')}
                                >
                                    Back to Donations
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
                <DialogTitle>Delete Donation</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{donation.title}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete} disabled={deleteLoading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={confirmDelete} 
                        color="error" 
                        variant="contained"
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? <CircularProgress size={20} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Notification */}
            <SuccessNotification
                open={successOpen}
                message={successMessage}
                onClose={() => setSuccessOpen(false)}
            />
        </Layout>
    );
};

export default DonationDetailPage; 