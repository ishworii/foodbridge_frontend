import { Category, Close, LocationOn, Person, TrendingUp } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, IconButton, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import donationService, { type DonationStatistics } from '../api/donationService';
import type { Donation } from '../types';

interface DonationsMapLeafletProps {
  donations: Donation[];
  userLocation: { lat: number; lng: number } | null;
  onClaim: (donationId: number) => void;
  onEdit: (donationId: number) => void;
  onDelete: (donation: Donation) => void;
}

interface DonationCluster {
  center: [number, number];
  donations: Donation[];
  bounds: [[number, number], [number, number]];
  stats: {
    total: number;
    available: number;
    claimed: number;
    foodTypes: { [key: string]: number };
  };
}

const DonationsMapLeaflet: React.FC<DonationsMapLeafletProps> = ({
  donations,
  userLocation,
  onClaim,
  onEdit,
  onDelete,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerClusterGroup = useRef<any>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<DonationCluster | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(10);
  const [statistics, setStatistics] = useState<DonationStatistics | null>(null);
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null);

  // Create clusters based on zoom level and geographic proximity
  const createClusters = (donations: Donation[], zoom: number): DonationCluster[] => {
    if (donations.length === 0) return [];

    const validDonations = donations.filter(d => d.latitude && d.longitude);
    if (validDonations.length === 0) return [];

    // At high zoom levels (15+), show individual markers
    if (zoom >= 15) {
      return validDonations.map(donation => ({
        center: [donation.latitude!, donation.longitude!] as [number, number],
        donations: [donation],
        bounds: [[donation.latitude!, donation.longitude!], [donation.latitude!, donation.longitude!]] as [[number, number], [number, number]],
        stats: {
          total: 1,
          available: donation.is_claimed ? 0 : 1,
          claimed: donation.is_claimed ? 1 : 0,
          foodTypes: { [donation.food_type || 'other']: 1 }
        }
      }));
    }

    // At medium zoom levels (10-14), cluster by grid
    if (zoom >= 10) {
      const gridSize = 0.01; // Roughly 1km grid
      const clusters = new Map<string, DonationCluster>();

      validDonations.forEach(donation => {
        const gridX = Math.floor(donation.latitude! / gridSize);
        const gridY = Math.floor(donation.longitude! / gridSize);
        const key = `${gridX},${gridY}`;

        if (!clusters.has(key)) {
          clusters.set(key, {
            center: [0, 0] as [number, number],
            donations: [],
            bounds: [[Infinity, Infinity], [-Infinity, -Infinity]] as [[number, number], [number, number]],
            stats: { total: 0, available: 0, claimed: 0, foodTypes: {} }
          });
        }

        const cluster = clusters.get(key)!;
        cluster.donations.push(donation);
        
        // Update bounds
        cluster.bounds[0][0] = Math.min(cluster.bounds[0][0], donation.latitude!);
        cluster.bounds[0][1] = Math.min(cluster.bounds[0][1], donation.longitude!);
        cluster.bounds[1][0] = Math.max(cluster.bounds[1][0], donation.latitude!);
        cluster.bounds[1][1] = Math.max(cluster.bounds[1][1], donation.longitude!);

        // Update stats
        cluster.stats.total++;
        if (donation.is_claimed) {
          cluster.stats.claimed++;
        } else {
          cluster.stats.available++;
        }
        
        const foodType = donation.food_type || 'other';
        cluster.stats.foodTypes[foodType] = (cluster.stats.foodTypes[foodType] || 0) + 1;
      });

      // Calculate centers for each cluster
      clusters.forEach(cluster => {
        const totalLat = cluster.donations.reduce((sum, d) => sum + d.latitude!, 0);
        const totalLng = cluster.donations.reduce((sum, d) => sum + d.longitude!, 0);
        cluster.center = [totalLat / cluster.donations.length, totalLng / cluster.donations.length];
      });

      return Array.from(clusters.values());
    }

    // At low zoom levels (< 10), cluster by larger grid
    const gridSize = 0.05; // Roughly 5km grid
    const clusters = new Map<string, DonationCluster>();

    validDonations.forEach(donation => {
      const gridX = Math.floor(donation.latitude! / gridSize);
      const gridY = Math.floor(donation.longitude! / gridSize);
      const key = `${gridX},${gridY}`;

      if (!clusters.has(key)) {
        clusters.set(key, {
          center: [0, 0] as [number, number],
          donations: [],
          bounds: [[Infinity, Infinity], [-Infinity, -Infinity]] as [[number, number], [number, number]],
          stats: { total: 0, available: 0, claimed: 0, foodTypes: {} }
        });
      }

      const cluster = clusters.get(key)!;
      cluster.donations.push(donation);
      
      // Update bounds
      cluster.bounds[0][0] = Math.min(cluster.bounds[0][0], donation.latitude!);
      cluster.bounds[0][1] = Math.min(cluster.bounds[0][1], donation.longitude!);
      cluster.bounds[1][0] = Math.max(cluster.bounds[1][0], donation.latitude!);
      cluster.bounds[1][1] = Math.max(cluster.bounds[1][1], donation.longitude!);

      // Update stats
      cluster.stats.total++;
      if (donation.is_claimed) {
        cluster.stats.claimed++;
      } else {
        cluster.stats.available++;
      }
      
      const foodType = donation.food_type || 'other';
      cluster.stats.foodTypes[foodType] = (cluster.stats.foodTypes[foodType] || 0) + 1;
    });

    // Calculate centers for each cluster
    clusters.forEach(cluster => {
      const totalLat = cluster.donations.reduce((sum, d) => sum + d.latitude!, 0);
      const totalLng = cluster.donations.reduce((sum, d) => sum + d.longitude!, 0);
      cluster.center = [totalLat / cluster.donations.length, totalLng / cluster.donations.length];
    });

    return Array.from(clusters.values());
  };

  // Fetch statistics from backend
  const fetchStatistics = async (zoom: number, bounds?: [[number, number], [number, number]]) => {
    try {
      const filters: any = { zoom };
      
      if (bounds) {
        filters.lat_min = bounds[0][0];
        filters.lat_max = bounds[1][0];
        filters.lng_min = bounds[0][1];
        filters.lng_max = bounds[1][1];
      }

      const stats = await donationService.getStatistics(filters);
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        console.log('Initializing Leaflet map...');
        
        // Dynamically import Leaflet to avoid SSR issues
        const L = await import('leaflet');
        console.log('Leaflet imported successfully');

        // Set up Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
          console.log('Leaflet CSS loaded');
        }

        // Add custom CSS for better cluster styling
        if (!document.querySelector('style[data-custom-cluster]')) {
          const customClusterCSS = document.createElement('style');
          customClusterCSS.setAttribute('data-custom-cluster', 'true');
          customClusterCSS.textContent = `
            .donation-cluster {
              background-clip: padding-box;
              border-radius: 20px;
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              cursor: pointer;
              transition: all 0.3s ease;
            }
            .donation-cluster:hover {
              transform: scale(1.1);
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            }
            .donation-cluster-small {
              background-color: rgba(76, 175, 80, 0.8);
            }
            .donation-cluster-medium {
              background-color: rgba(255, 152, 0, 0.8);
            }
            .donation-cluster-large {
              background-color: rgba(244, 67, 54, 0.8);
            }
            .donation-cluster div {
              width: 40px;
              height: 40px;
              text-align: center;
              border-radius: 20px;
              font: 14px "Helvetica Neue", Arial, Helvetica, sans-serif;
              color: white;
              font-weight: bold;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              line-height: 1;
            }
            .donation-cluster .cluster-count {
              font-size: 16px;
              font-weight: bold;
            }
            .donation-cluster .cluster-available {
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
          `;
          document.head.appendChild(customClusterCSS);
          console.log('Custom cluster CSS loaded');
        }

        // Determine center
        let center: [number, number] = [42.3601, -71.0589]; // Boston default
        
        if (userLocation) {
          center = [userLocation.lat, userLocation.lng];
        } else if (donations.length > 0) {
          const firstDonation = donations.find(d => d.latitude && d.longitude);
          if (firstDonation) {
            center = [firstDonation.latitude!, firstDonation.longitude!];
          }
        }

        console.log('Map center:', center);

        // Initialize map
        mapInstance.current = L.map(mapRef.current!, {
          center,
          zoom: userLocation ? 12 : 10,
          zoomControl: true,
          attributionControl: true,
        });

        console.log('Map initialized');

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapInstance.current);

        console.log('Tile layer added');

        // Initialize layer group for clusters
        markerClusterGroup.current = L.layerGroup();

        // Add user location marker if available
        if (userLocation) {
          const userIcon = L.divIcon({
            html: '<div style="background-color: #4285F4; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            className: 'user-location-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
            .addTo(mapInstance.current)
            .bindTooltip('Your Location', { permanent: false });
          
          console.log('User location marker added');
        }

        // Function to update markers based on zoom level
        const updateMarkers = async () => {
          // Clear existing markers
          markerClusterGroup.current.clearLayers();
          
          const zoom = mapInstance.current.getZoom();
          setCurrentZoom(zoom);
          
          // Get current map bounds
          const bounds = mapInstance.current.getBounds();
          const mapBoundsArray: [[number, number], [number, number]] = [
            [bounds.getSouth(), bounds.getWest()],
            [bounds.getNorth(), bounds.getEast()]
          ];
          setMapBounds(mapBoundsArray);
          
          // Fetch statistics from backend
          await fetchStatistics(zoom, mapBoundsArray);
          
          const clusters = createClusters(donations, zoom);
          console.log(`Created ${clusters.length} clusters at zoom level ${zoom}`);

          clusters.forEach(cluster => {
            if (cluster.donations.length === 1) {
              // Single donation marker
              const donation = cluster.donations[0];
              const isClaimed = donation.is_claimed;
              const color = isClaimed ? '#9E9E9E' : '#4CAF50';
              const size = isClaimed ? 8 : 12;

              const markerIcon = L.divIcon({
                html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                className: 'donation-marker',
                iconSize: [size, size],
                iconAnchor: [size/2, size/2],
              });

              const marker = L.marker(cluster.center, { icon: markerIcon });
              
              // Add click listener
              marker.on('click', () => {
                setSelectedDonation(donation);
                setSelectedCluster(null);
              });

              // Add tooltip
              marker.bindTooltip(donation.title, { permanent: false });

              markerClusterGroup.current.addLayer(marker);
            } else {
              // Cluster marker
              const stats = cluster.stats;
              let className = 'donation-cluster-';
              let size = 'medium';
              
              if (stats.total < 5) {
                className += 'small';
                size = 'small';
              } else if (stats.total < 15) {
                className += 'medium';
                size = 'medium';
              } else {
                className += 'large';
                size = 'large';
              }

              const markerIcon = L.divIcon({
                html: `
                  <div>
                    <div class="cluster-count">${stats.total}</div>
                    <div class="cluster-available">${stats.available} avail</div>
                  </div>
                `,
                className: `donation-cluster ${className}`,
                iconSize: L.point(50, 50)
              });

              const marker = L.marker(cluster.center, { icon: markerIcon });
              
              // Add click listener
              marker.on('click', () => {
                setSelectedCluster(cluster);
                setSelectedDonation(null);
              });

              // Add tooltip with stats
              const tooltipContent = `
                <div style="text-align: center;">
                  <strong>${stats.total} Donations</strong><br>
                  ${stats.available} Available<br>
                  ${stats.claimed} Claimed<br>
                  <small>Click to view details</small>
                </div>
              `;
              marker.bindTooltip(tooltipContent, { permanent: false });

              markerClusterGroup.current.addLayer(marker);
            }
          });

          // Add cluster group to map
          mapInstance.current.addLayer(markerClusterGroup.current);
        };

        // Initial marker update
        updateMarkers();

        // Listen for zoom and move changes
        mapInstance.current.on('zoomend', updateMarkers);
        mapInstance.current.on('moveend', updateMarkers);

        setIsLoading(false);
        console.log('Map initialization complete');
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map: ' + (err as Error).message);
        setIsLoading(false);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, [donations, userLocation]);

  const getFoodTypeIcon = (foodType: string) => {
    switch (foodType?.toLowerCase()) {
      case 'fruits': return '🍎';
      case 'vegetables': return '🥬';
      case 'grains': return '🌾';
      case 'dairy': return '🥛';
      case 'meat': return '🥩';
      case 'baked goods': return '🥖';
      case 'canned goods': return '🥫';
      case 'frozen foods': return '🧊';
      case 'beverages': return '🥤';
      case 'snacks': return '🍿';
      default: return '🍽️';
    }
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
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'left' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            Debug Info:
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Donations: {donations.length}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            User Location: {userLocation ? 'Available' : 'Not available'}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Map Ref: {mapRef.current ? 'Available' : 'Not available'}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '600px' }}>
      {/* Map Container */}
      <Box sx={{ position: 'relative', height: '100%' }}>
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f0f0',
            border: '2px dashed #ccc',
            position: 'relative',
          }}
        />
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              p: 2,
              borderRadius: 1,
              zIndex: 10,
            }}
          >
            <Typography variant="h6">Loading map...</Typography>
            <Typography variant="caption" color="text.secondary">
              Please wait while the map initializes
            </Typography>
          </Box>
        )}
      </Box>

      {/* Statistics Panel */}
      {statistics && (
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 1,
            boxShadow: 2,
            zIndex: 2,
            minWidth: 200,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Map Statistics
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Total: {statistics.summary.total}
            </Typography>
            <Typography variant="caption" color="success.main">
              Available: {statistics.summary.available}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Claimed: {statistics.summary.claimed}
            </Typography>
            <Typography variant="caption" color="primary.main">
              Claim Rate: {statistics.summary.claim_rate.toFixed(1)}%
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

      {/* Selected Cluster Card */}
      {selectedCluster && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            zIndex: 2,
          }}
        >
          <Card sx={{ maxWidth: 500, mx: 'auto' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp />
                    Donation Cluster
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedCluster.donations.length} donations in this area
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setSelectedCluster(null)}
                  sx={{ ml: 1 }}
                >
                  <Close />
                </IconButton>
              </Box>

              {/* Cluster Statistics */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip
                  label={`${selectedCluster.stats.total} Total`}
                  color="primary"
                  size="small"
                />
                <Chip
                  label={`${selectedCluster.stats.available} Available`}
                  color="success"
                  size="small"
                />
                <Chip
                  label={`${selectedCluster.stats.claimed} Claimed`}
                  color="default"
                  size="small"
                />
              </Box>

              {/* Food Type Breakdown */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Food Types:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {Object.entries(selectedCluster.stats.foodTypes).map(([foodType, count]) => (
                  <Chip
                    key={foodType}
                    icon={<span>{getFoodTypeIcon(foodType)}</span>}
                    label={`${foodType} (${count})`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>

              {/* Individual Donations */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Donations in this area:
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {selectedCluster.donations.map((donation) => (
                  <Box
                    key={donation.id}
                    sx={{
                      p: 1,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => {
                      setSelectedDonation(donation);
                      setSelectedCluster(null);
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {donation.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {donation.food_type} • {donation.is_claimed ? 'Claimed' : 'Available'}
                    </Typography>
                  </Box>
                ))}
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
          minWidth: 200,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Map Legend
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
          <Typography variant="caption">Available Donations</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
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
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: '#4285F4',
                mr: 1,
              }}
            />
            <Typography variant="caption">Your Location</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              bgcolor: '#4CAF50',
              mr: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            5
          </Box>
          <Typography variant="caption">Small Cluster (2-4)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              bgcolor: '#FF9800',
              mr: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            12
          </Box>
          <Typography variant="caption">Medium Cluster (5-14)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              bgcolor: '#F44336',
              mr: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            25
          </Box>
          <Typography variant="caption">Large Cluster (15+)</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Zoom in to see individual donations
        </Typography>
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
          zIndex: 2,
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