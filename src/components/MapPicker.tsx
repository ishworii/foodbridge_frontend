import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

interface MapPickerProps {
  onLocationSelect: (address: string, coordinates: { lat: number; lng: number }) => void;
  initialCenter?: { lat: number; lng: number };
  apiKey: string;
}

const MapPicker: React.FC<MapPickerProps> = ({
  onLocationSelect,
  initialCenter = { lat: 42.3601, lng: -71.0589 }, // Boston default
  apiKey,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const marker = useRef<any>(null);
  const geocoder = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    coordinates: { lat: number; lng: number };
  } | null>(null);

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;

    const initMap = () => {
      try {
        // Initialize the map
        if (!mapRef.current) return;
        
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: 13,
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

        // Initialize geocoder
        geocoder.current = new window.google.maps.Geocoder();

        // Add click listener to map
        mapInstance.current.addListener('click', (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          const coordinates = { lat, lng };

          // Update marker position
          if (marker.current) {
            marker.current.setPosition(event.latLng);
          } else {
            // Create new marker
            marker.current = new window.google.maps.Marker({
              position: event.latLng,
              map: mapInstance.current,
              draggable: true,
              animation: window.google.maps.Animation.DROP,
            });

            // Add drag listener to marker
            marker.current.addListener('dragend', (dragEvent: any) => {
              const dragLat = dragEvent.latLng.lat();
              const dragLng = dragEvent.latLng.lng();
              reverseGeocode({ lat: dragLat, lng: dragLng });
            });
          }

          // Reverse geocode the clicked location
          reverseGeocode(coordinates);
        });

        // Try to get current location and center map
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              mapInstance.current.setCenter(currentLocation);
              mapInstance.current.setZoom(15);
            },
            (error) => {
              console.log('Could not get current location:', error);
              // Keep default center
            }
          );
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
        setIsLoading(false);
      }
    };

    const reverseGeocode = (coordinates: { lat: number; lng: number }) => {
      if (!geocoder.current) return;

      geocoder.current.geocode(
        { location: coordinates },
        (results: any[], status: any) => {
          if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
            const address = results[0].formatted_address;
            setSelectedLocation({ address, coordinates });
          } else {
            // Fallback address with coordinates
            const address = `Location (${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)})`;
            setSelectedLocation({ address, coordinates });
          }
        }
      );
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        setError('Failed to load Google Maps');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    }
  }, [apiKey, initialCenter]);

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.address, selectedLocation.coordinates);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Center map on current location
          mapInstance.current.setCenter(coordinates);
          mapInstance.current.setZoom(15);

          // Update marker
          if (marker.current) {
            marker.current.setPosition(coordinates);
          } else {
            marker.current = new window.google.maps.Marker({
              position: coordinates,
              map: mapInstance.current,
              draggable: true,
              animation: window.google.maps.Animation.DROP,
            });
          }

          // Reverse geocode
          if (geocoder.current) {
            geocoder.current.geocode(
              { location: coordinates },
              (results: any[], status: any) => {
                if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
                  const address = results[0].formatted_address;
                  setSelectedLocation({ address, coordinates });
                } else {
                  const address = `Current Location (${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)})`;
                  setSelectedLocation({ address, coordinates });
                }
                setIsLoading(false);
              }
            );
          } else {
            const address = `Current Location (${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)})`;
            setSelectedLocation({ address, coordinates });
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          setError('Could not get current location');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Instructions */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Select Location on Map
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click anywhere on the map to select a location, or use your current location.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleUseCurrentLocation}
            disabled={isLoading}
          >
            Use Current Location
          </Button>
          
          {selectedLocation && (
            <Button
              variant="contained"
              size="small"
              onClick={handleConfirmLocation}
              disabled={isLoading}
            >
              Confirm Location
            </Button>
          )}
        </Box>
      </Box>

      {/* Map Container */}
      <Box sx={{ flex: 1, position: 'relative' }}>
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
            <CircularProgress />
          </Box>
        )}
        
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '400px',
          }}
        />
      </Box>

      {/* Selected Location Display */}
      {selectedLocation && (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Selected Location:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedLocation.address}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Coordinates: {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MapPicker; 