import { Category, Close, LocationOn, Person } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, CircularProgress, IconButton, Typography } from '@mui/material';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useCallback, useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import donationService, { type DonationStatistics } from '../api/donationService';
import type { Donation } from '../types';

interface DonationsMapLeafletProps {
  donations: Donation[];
  userLocation: { lat: number; lng: number } | null;
  onClaim: (donationId: number) => void;
  onEdit: (donationId: number) => void;
  onDelete: (donation: Donation) => void;
}

// Component to handle map events and statistics fetching
const MapEventHandler: React.FC<{
  onMapChange: () => void;
  donations: Donation[];
  onMapReady: (map: any) => void;
}> = ({ onMapChange, donations, onMapReady }) => {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  useEffect(() => {
    const handleMapChange = () => {
      onMapChange();
    };

    map.on('zoomend', handleMapChange);
    map.on('moveend', handleMapChange);

    return () => {
      map.off('zoomend', handleMapChange);
      map.off('moveend', handleMapChange);
    };
  }, [map, onMapChange]);

  return null;
};

// Helper for debouncing
const useDebouncedCallback = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  return useCallback((...args: any[]) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// Geocode location addresses to get coordinates
const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const DonationsMapLeaflet: React.FC<DonationsMapLeafletProps> = ({
  donations,
  userLocation,
  onClaim,
  onEdit,
  onDelete,
}) => {
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<DonationStatistics | null>(null);
  const [currentZoom, setCurrentZoom] = useState(10);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // State for processed donations
  const [donationsWithCoords, setDonationsWithCoords] = useState<Donation[]>([]);

  // Update processed donations when donations change
  useEffect(() => {
    const processDonations = async () => {
      const donationsWithCoords = await Promise.all(
        donations.map(async (donation) => {
          if (donation.latitude && donation.longitude) {
            return donation; // Already has coordinates
          }
          
          if (donation.location) {
            const coords = await geocodeLocation(donation.location);
            if (coords) {
              return {
                ...donation,
                latitude: coords.lat,
                longitude: coords.lng
              };
            }
          }
          
          return donation; // Return original if no coordinates found
        })
      );
      
      setDonationsWithCoords(donationsWithCoords);
      console.log('Processed donations with coordinates:', donationsWithCoords.filter((d: Donation) => d.latitude && d.longitude));
    };
    
    processDonations();
  }, [donations]);

  // Fetch statistics from backend
  const fetchAndSetStatistics = async () => {
    if (!mapInstance) return;
    const bounds = mapInstance.getBounds();
    try {
      const stats = await donationService.getStatistics({
        zoom: mapInstance.getZoom(),
        lat_min: bounds.getSouth(),
        lng_min: bounds.getWest(),
        lat_max: bounds.getNorth(),
        lng_max: bounds.getEast(),
      });
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
      // Fallback to local statistics
      const validDonations = donationsWithCoords.filter(d => d.latitude && d.longitude);
      const available = validDonations.filter(d => !d.is_claimed).length;
      const claimed = validDonations.filter(d => d.is_claimed).length;
      const total = validDonations.length;
      const claimRate = total > 0 ? (claimed / total) * 100 : 0;
      
      setStatistics({
        summary: {
          total,
          available,
          claimed,
          claim_rate: claimRate
        },
        food_types: [],
        clusters: [],
        recent_activity: [],
        zoom_level: mapInstance.getZoom()
      });
    }
  };

  // Calculate local statistics for display
  const localStatistics = React.useMemo(() => {
    const validDonations = donationsWithCoords.filter(d => d.latitude && d.longitude);
    const available = validDonations.filter(d => !d.is_claimed).length;
    const claimed = validDonations.filter(d => d.is_claimed).length;
    const total = validDonations.length;
    const claimRate = total > 0 ? (claimed / total) * 100 : 0;
    
    return {
      total,
      available,
      claimed,
      claim_rate: claimRate
    };
  }, [donationsWithCoords]);

  // Debug: Log donation data
  useEffect(() => {
    console.log('Original donations data:', donations);
    console.log('Donations with coordinates:', donationsWithCoords);
    console.log('Valid donations with coordinates:', donationsWithCoords.filter(d => d.latitude && d.longitude));
    console.log('Local statistics:', localStatistics);
  }, [donations, donationsWithCoords, localStatistics]);

  const handleMapChange = useDebouncedCallback(() => {
    if (!mapInstance) return;
    setCurrentZoom(mapInstance.getZoom());
    fetchAndSetStatistics();
  }, 300);

  // Custom icons
  const createDonationIcon = (isClaimed: boolean) => {
    const color = isClaimed ? '#9E9E9E' : '#4CAF50';
    const size = isClaimed ? 16 : 20; // Increased sizes
    
    return divIcon({
      html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;"></div>`,
      className: 'donation-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
    });
  };

  const createUserLocationIcon = () => {
    return divIcon({
      html: '<div style="background-color: #4285F4; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
      className: 'user-location-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const createCustomClusterIcon = (cluster: any) => {
    const count = cluster.getChildCount();
    let className = 'marker-cluster-';
    
    if (count < 5) {
      className += 'small';
    } else if (count < 15) {
      className += 'medium';
    } else {
      className += 'large';
    }

    return divIcon({
      html: `
        <div class="cluster-icon">
          <div class="cluster-count">${count}</div>
        </div>
      `,
      className: `custom-marker-cluster ${className}`,
      iconSize: [50, 50],
      iconAnchor: [25, 25],
    });
  };

  // Determine map center
  const getMapCenter = (): [number, number] => {
    if (userLocation) {
      return [userLocation.lat, userLocation.lng];
    } else if (donations.length > 0) {
      const firstDonation = donations.find(d => d.latitude && d.longitude);
      if (firstDonation) {
        return [firstDonation.latitude!, firstDonation.longitude!];
      }
    }
    return [42.3601, -71.0589]; // Boston default
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

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Map Error
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '600px', width: '100%' }}>
      {/* Add custom CSS for cluster styling */}
      <style>
        {`
          .custom-marker-cluster {
            background-clip: padding-box;
            border-radius: 20px;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .custom-marker-cluster:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          }
          .marker-cluster-small {
            background-color: rgba(76, 175, 80, 0.8);
          }
          .marker-cluster-medium {
            background-color: rgba(255, 152, 0, 0.8);
          }
          .marker-cluster-large {
            background-color: rgba(244, 67, 54, 0.8);
          }
          .cluster-icon {
            height: 40px;
            width: 40px;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-weight: bold;
            color: white;
            font-size: 14px;
            line-height: 1;
          }
          .cluster-count {
            font-size: 16px;
            font-weight: bold;
          }
          .cluster-available {
            font-size: 10px;
            opacity: 0.9;
          }
          .donation-marker {
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .donation-marker:hover {
            transform: scale(1.2);
          }
        `}
      </style>

      <MapContainer 
        center={getMapCenter()} 
        zoom={userLocation ? 12 : 10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventHandler 
          onMapChange={handleMapChange} 
          donations={donations}
          onMapReady={setMapInstance}
        />

        {/* User location marker */}
        {userLocation && (
          <>
            {/* Overlay donation count at user location with negative z-index */}
            <div
              style={{
                position: 'absolute',
                left: `calc(50% - 12px)`, // Centered on marker
                top: `calc(50% - 48px)`, // Adjust as needed for marker size
                zIndex: -1,
                pointerEvents: 'none',
                fontWeight: 700,
                fontSize: 18,
                color: '#4285F4',
                textShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            >
              {donationsWithCoords.filter(d => d.latitude === userLocation.lat && d.longitude === userLocation.lng).length}
            </div>
            <Marker 
              position={[userLocation.lat, userLocation.lng]} 
              icon={createUserLocationIcon()}
            >
              <Popup>Your Location</Popup>
            </Marker>
          </>
        )}

        {/* Donation markers with clustering */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createCustomClusterIcon}
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={true}
          zoomToBoundsOnClick={true}
        >
          {donationsWithCoords
            .filter(donation => donation.latitude && donation.longitude)
            .map((donation) => (
              <Marker
                key={donation.id}
                position={[donation.latitude!, donation.longitude!]}
                icon={createDonationIcon(donation.is_claimed)}
                eventHandlers={{
                  click: () => {
                    setSelectedDonation(donation);
                  },
                }}
              >
                <Popup>
                  <div>
                    <h3>{donation.title}</h3>
                    <p>{donation.description}</p>
                    <p>Food Type: {donation.food_type || 'Unknown'}</p>
                    <p>Status: {donation.is_claimed ? 'Claimed' : 'Available'}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>
      </MapContainer>

      {isLoading && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255, 255, 255, 0.7)', zIndex: 1001 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Statistics Panel */}
      {(statistics || localStatistics.total > 0) && (
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 1,
            boxShadow: 2,
            zIndex: 1001,
            minWidth: 200,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Map Statistics
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Total: {statistics?.summary.total || localStatistics.total}
            </Typography>
            <Typography variant="caption" color="success.main">
              Available: {statistics?.summary.available || localStatistics.available}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Claimed: {statistics?.summary.claimed || localStatistics.claimed}
            </Typography>
            <Typography variant="caption" color="primary.main">
              Claim Rate: {(statistics?.summary.claim_rate || localStatistics.claim_rate).toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      )}

      {/* Selected Donation Card */}
      {selectedDonation && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            zIndex: 1001,
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
                  <Close />
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
          zIndex: 1001,
          minWidth: 150,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Map Legend
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: '#4CAF50',
              mr: 1,
            }}
          />
          <Typography variant="caption">Available Donations</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: '#9E9E9E',
              mr: 1,
            }}
          />
          <Typography variant="caption">Claimed Donations</Typography>
        </Box>
        {userLocation && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: '#4285F4',
                mr: 1,
              }}
            />
            <Typography variant="caption">Your Location</Typography>
          </Box>
        )}
      </Box>

      {/* Zoom Level Indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          bgcolor: 'background.paper',
          p: 1,
          borderRadius: 1,
          boxShadow: 2,
          zIndex: 1001,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Zoom: {currentZoom}
        </Typography>
      </Box>
    </Box>
  );
};

export default DonationsMapLeaflet; 