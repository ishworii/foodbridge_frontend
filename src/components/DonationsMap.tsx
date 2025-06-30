import { Category, LocationOn, Person } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, IconButton, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import type { Donation } from '../types';

interface DonationsMapProps {
  donations: Donation[];
  userLocation: { lat: number; lng: number } | null;
  onClaim: (donationId: number) => void;
  onEdit: (donationId: number) => void;
  onDelete: (donation: Donation) => void;
}

const DonationsMap: React.FC<DonationsMapProps> = ({
  donations,
  userLocation,
  onClaim,
  onEdit,
  onDelete,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<Map<number, any>>(new Map());
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Google Maps API Key
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !mapRef.current) return;

    const initMap = () => {
      try {
        // Determine center - use user location if available, otherwise use first donation or default
        let center = { lat: 42.3601, lng: -71.0589 }; // Boston default
        
        if (userLocation) {
          center = userLocation;
        } else if (donations.length > 0) {
          const firstDonation = donations.find(d => d.latitude && d.longitude);
          if (firstDonation) {
            center = { lat: firstDonation.latitude!, lng: firstDonation.longitude! };
          }
        }

        // Initialize the map
        if (!mapRef.current) return;
        
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: userLocation ? 12 : 10,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
          ],
        });

        // Add user location marker if available
        if (userLocation) {
          new window.google.maps.Marker({
            position: userLocation,
            map: mapInstance.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            },
            title: 'Your Location',
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
        setIsLoading(false);
      }
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        setError('Failed to load Google Maps');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    }
  }, [GOOGLE_MAPS_API_KEY, userLocation, donations]);

  // Add markers when donations change
  useEffect(() => {
    if (!mapInstance.current || !window.google) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current.clear();

    // Add new markers
    donations.forEach(donation => {
      if (donation.latitude && donation.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: donation.latitude, lng: donation.longitude },
          map: mapInstance.current,
          title: donation.title,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: donation.is_claimed ? 6 : 10,
            fillColor: donation.is_claimed ? '#9E9E9E' : '#4CAF50',
            fillOpacity: 0.8,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });

        // Add click listener
        marker.addListener('click', () => {
          setSelectedDonation(donation);
        });

        markers.current.set(donation.id, marker);
      }
    });
  }, [donations]);

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

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '600px' }}>
      {/* Map Container */}
      <Box sx={{ position: 'relative', height: '100%' }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1,
            }}
          >
            <Typography variant="h6">Loading map...</Typography>
          </Box>
        )}
        
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </Box>

      {/* Selected Donation Card */}
      {selectedDonation && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            zIndex: 2,
          }}
        >
          <Card sx={{ maxWidth: 400, mx: 'auto' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {selectedDonation.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedDonation.description}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setSelectedDonation(null)}
                  sx={{ ml: 1 }}
                >
                  ×
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip
                  icon={<Category />}
                  label={selectedDonation.food_type || 'Unknown'}
                  size="small"
                  variant="outlined"
                />
                {userLocation && selectedDonation.latitude && selectedDonation.longitude && (
                  <Chip
                    icon={<LocationOn />}
                    label={formatDistance(calculateDistance(
                      userLocation.lat, userLocation.lng,
                      selectedDonation.latitude, selectedDonation.longitude
                    ))}
                    size="small"
                    variant="outlined"
                  />
                )}
                <Chip
                  icon={<Person />}
                  label={selectedDonation.donor_name || 'Anonymous'}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {!selectedDonation.is_claimed ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      onClaim(selectedDonation.id);
                      setSelectedDonation(null);
                    }}
                  >
                    Claim Donation
                  </Button>
                ) : (
                  <Chip
                    label="Already Claimed"
                    color="success"
                    size="small"
                  />
                )}
                
                {/* Edit/Delete buttons for donors */}
                {selectedDonation.donor_id === selectedDonation.user_id && (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        onEdit(selectedDonation.id);
                        setSelectedDonation(null);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => {
                        onDelete(selectedDonation);
                        setSelectedDonation(null);
                      }}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 1,
          boxShadow: 2,
          zIndex: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Legend
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#4CAF50',
              mr: 1,
            }}
          />
          <Typography variant="caption">Available</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#9E9E9E',
              mr: 1,
            }}
          />
          <Typography variant="caption">Claimed</Typography>
        </Box>
        {userLocation && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#4285F4',
                mr: 1,
              }}
            />
            <Typography variant="caption">Your Location</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DonationsMap; 