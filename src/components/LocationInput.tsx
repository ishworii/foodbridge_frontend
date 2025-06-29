import { LocationOn, MyLocation } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MapPicker from './MapPicker';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (coordinates: { lat: number; lng: number }) => void;
  label?: string;
  required?: boolean;
  helperText?: string;
  placeholder?: string;
  error?: boolean;
  showMap?: boolean;
}

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
      id={`location-tabpanel-${index}`}
      aria-labelledby={`location-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  onCoordinatesChange,
  label = 'Location',
  required = false,
  helperText,
  placeholder = 'Enter location...',
  error = false,
  showMap = false,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<any[]>([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);

  // Create a ref for a dummy div to attach the PlacesService to
  // This div will not be rendered but is required by the API for attributions.
  const placesServiceAttribution = useRef<HTMLDivElement>(null);

  // Google Maps API Key
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Fallback location data for when Google Maps API is not available
  const fallbackLocations = [
    'Downtown Market, Boston, MA',
    'Central Square, Cambridge, MA',
    'Harvard Square, Cambridge, MA',
    'Porter Square, Cambridge, MA',
    'Davis Square, Somerville, MA',
    'Union Square, Somerville, MA',
    'Assembly Row, Somerville, MA',
    'Faneuil Hall, Boston, MA',
    'Quincy Market, Boston, MA',
    'Boston Common, Boston, MA',
    'Public Garden, Boston, MA',
    'Newbury Street, Boston, MA',
    'Boylston Street, Boston, MA',
    'Beacon Street, Boston, MA',
    'Massachusetts Avenue, Cambridge, MA',
    'Cambridge, MA',
    'Boston, MA',
    'Somerville, MA',
    'Brookline, MA',
    'Medford, MA',
  ];

  // Load Google Maps API
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn('Google Maps API key not configured. Using fallback autocomplete.');
      return;
    }

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsLoaded(true);
        // Defer service initialization until component is mounted
        return;
      }

      // Avoid adding the script tag if it already exists
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleMapsLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [GOOGLE_MAPS_API_KEY]);

  // Initialize services only when the API is loaded and our attribution div exists
  useEffect(() => {
    if (isGoogleMapsLoaded && placesServiceAttribution.current) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(placesServiceAttribution.current);
    }
  }, [isGoogleMapsLoaded]);

  useEffect(() => {
    // When the controlled `value` prop changes from the outside, update the `inputValue`
    setInputValue(value);
  }, [value]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchPlaces = useCallback(async (input: string) => {
    if (!autocompleteService.current || !input.trim()) {
      setPlaces([]);
      return;
    }
    
    const request = {
      input: input,
      componentRestrictions: { country: 'us' },
      // You can add more types if needed
      types: ['establishment', 'geocode'],
    };

    autocompleteService.current.getPlacePredictions(request, (predictions: any[], status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        setPlaces(predictions);
      } else {
        setPlaces([]);
      }
    });
  }, []);

  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
    if (isGoogleMapsLoaded && newInputValue.length > 2) {
      fetchPlaces(newInputValue);
    } else {
      setPlaces([]);
    }
  };
  
  const handlePlaceSelect = useCallback((placeId: string) => {
    if (!placesService.current) {
      console.error("PlacesService not initialized yet.");
      return;
    }

    const request = {
      placeId: placeId,
      fields: ['formatted_address', 'geometry', 'name'],
    };

    placesService.current.getDetails(request, (place: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        const address = place.formatted_address || place.name || '';
        onChange(address); // Update parent state
        
        if (place.geometry?.location) {
          const coordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          onCoordinatesChange?.(coordinates);
        }
        
        setPlaces([]);
        setInputValue(address); // Also update local input value
      }
    });
  }, [onChange, onCoordinatesChange]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coordinates = { lat: latitude, lng: longitude };
          
          onCoordinatesChange?.(coordinates);
          
          // Reverse geocode to get address
          if (placesService.current) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: coordinates }, (results: any, status: any) => {
              if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
                const address = results[0].formatted_address;
                onChange(address);
                setInputValue(address);
              } else {
                const locationString = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
                onChange(locationString);
                setInputValue(locationString);
              }
              setLoading(false);
            });
          } else {
            const locationString = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            onChange(locationString);
            setInputValue(locationString);
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const getPlaceTypeIcon = (types: string[]) => {
    if (types.includes('establishment')) return '🏢';
    if (types.includes('street_address')) return '📍';
    if (types.includes('route')) return '🛣️';
    if (types.includes('locality')) return '🏙️';
    if (types.includes('sublocality')) return '🏘️';
    return '📍';
  };

  const getPlaceTypeLabel = (types: string[]) => {
    if (types.includes('establishment')) return 'Business';
    if (types.includes('street_address')) return 'Address';
    if (types.includes('route')) return 'Street';
    if (types.includes('locality')) return 'City';
    if (types.includes('sublocality')) return 'Neighborhood';
    return 'Location';
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Render the invisible div for the PlacesService attribution */}
      <div ref={placesServiceAttribution} style={{ display: 'none' }} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="location selection tabs">
          <Tab label="Search" />
          <Tab label="Map" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ position: 'relative' }}>
          {isGoogleMapsLoaded ? (
            <Autocomplete
              // The 'value' prop should ideally be the selected option object or null.
              // Since your component's contract is to work with a string `value`,
              // we'll primarily control the component via `inputValue`.
              value={value} // Keep this for display consistency after selection
              onChange={(event, newValue) => {
                // This is called when an option is selected.
                if (newValue && typeof newValue === 'object' && 'place_id' in newValue) {
                  handlePlaceSelect(newValue.place_id);
                } else if (typeof newValue === 'string') {
                  // Handle case where user types and hits Enter (freeSolo)
                  onChange(newValue);
                }
              }}
              inputValue={inputValue}
              onInputChange={handleInputChange}
              options={places}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option.description || '';
              }}
              isOptionEqualToValue={(option, val) => {
                // Compare option description with the string value
                return typeof option === 'object' && option.description === val;
              }}
              loading={loading}
              freeSolo
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              renderInput={(params) => (
                <TextField
                  {...params}
                  // Removed redundant ref={inputRef}
                  label={label}
                  required={required}
                  helperText={helperText}
                  placeholder={placeholder}
                  error={error}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                        <LocationOn sx={{ color: 'text.secondary', mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </Box>
                    ),
                    endAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}
                        {params.InputProps.endAdornment}
                      </Box>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.place_id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {typeof option === 'string' ? option : option.description}
                    </Typography>
                    {typeof option === 'object' && (
                      <Chip
                        label={getPlaceTypeLabel(option.types)}
                        size="small"
                        color="primary"
                        icon={<span>{getPlaceTypeIcon(option.types)}</span>}
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </Box>
              )}
              noOptionsText={
                inputValue.length > 2
                  ? "No places found"
                  : "Start typing to search places..."
              }
            />
          ) : (
            // Fallback Autocomplete
            <Autocomplete
              value={value}
              onChange={(event, newValue) => {
                if (newValue) {
                  onChange(newValue);
                }
              }}
              inputValue={inputValue}
              onInputChange={(e, newInputValue) => setInputValue(newInputValue)}
              options={fallbackLocations}
              getOptionLabel={(option) => option}
              isOptionEqualToValue={(option, value) => option === value}
              freeSolo
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={label}
                  required={required}
                  helperText={helperText}
                  placeholder={placeholder}
                  error={error}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                        <LocationOn sx={{ color: 'text.secondary', mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </Box>
                    ),
                    endAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}
                        {params.InputProps.endAdornment}
                      </Box>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Typography variant="body1">
                    {option}
                  </Typography>
                </Box>
              )}
              noOptionsText="Type to search locations..."
            />
          )}
          
          <Button
            startIcon={<MyLocation />}
            onClick={getCurrentLocation}
            disabled={loading || !isGoogleMapsLoaded}
            variant="outlined"
            size="small"
            sx={{ mt: 1, width: '100%' }}
          >
            {loading ? 'Getting location...' : 'Use Current Location'}
          </Button>

          {!isGoogleMapsLoaded && GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE' && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Loading Google Places...
            </Alert>
          )}

          {(!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.
            </Alert>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ height: '500px' }}>
          {isGoogleMapsLoaded ? (
            <MapPicker
              apiKey={GOOGLE_MAPS_API_KEY}
              onLocationSelect={(address: string, coordinates: { lat: number; lng: number }) => {
                onChange(address);
                onCoordinatesChange?.(coordinates);
                setInputValue(address);
                setTabValue(0); // Switch back to search tab
              }}
            />
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Map Picker Loading...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please wait while Google Maps loads, or use the search tab for now.
              </Typography>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </TabPanel>

      {helperText && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default LocationInput; 