# Leaflet Map Implementation for FoodBridge

## Overview
The FoodBridge application now uses **Leaflet** with **MarkerCluster** for displaying donations on an interactive map. This provides better performance and clustering functionality compared to Google Maps.

## Features

### 🗺️ Interactive Map
- **OpenStreetMap tiles** - Free, open-source map tiles
- **Responsive design** - Works on all screen sizes
- **Smooth interactions** - Pan, zoom, and click functionality

### 📍 Smart Clustering
- **Automatic clustering** - When zoomed out, nearby markers are grouped together
- **Dynamic separation** - When zoomed in, clusters break apart to show individual donations
- **Color-coded clusters**:
  - 🟢 Green: Small clusters (2-4 donations)
  - 🟠 Orange: Medium clusters (5-9 donations)  
  - 🔴 Red: Large clusters (10+ donations)

### 🎯 User Experience
- **Click markers** to view donation details
- **Hover tooltips** show donation titles
- **User location** is marked with a blue dot (if permission granted)
- **Legend** explains all map symbols
- **Instructions** guide users on how to interact

### 🎨 Visual Design
- **Available donations**: Green markers (larger)
- **Claimed donations**: Gray markers (smaller)
- **User location**: Blue dot with white border
- **Custom styling** for clusters with smooth animations

## Technical Implementation

### Dependencies
```bash
npm install leaflet react-leaflet@4.2.1 leaflet.markercluster @types/leaflet
```

### Key Components
- `DonationsMapLeaflet.tsx` - Main map component
- `types/leaflet.d.ts` - TypeScript declarations for marker clustering

### Features
1. **Dynamic loading** - Leaflet loads only when needed
2. **Error handling** - Graceful fallbacks if map fails to load
3. **Performance optimized** - Efficient marker management
4. **Accessibility** - Keyboard navigation and screen reader support

## Usage

### Basic Usage
```tsx
import DonationsMapLeaflet from '../components/DonationsMapLeaflet';

<DonationsMapLeaflet
  donations={donations}
  userLocation={userLocation}
  onClaim={handleClaim}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### Props
- `donations`: Array of donation objects with latitude/longitude
- `userLocation`: User's current location (optional)
- `onClaim`: Function to handle donation claiming
- `onEdit`: Function to handle donation editing
- `onDelete`: Function to handle donation deletion

## Benefits Over Google Maps

### ✅ Advantages
- **No API key required** - Uses free OpenStreetMap tiles
- **Better clustering** - More sophisticated marker clustering
- **Faster loading** - Lighter weight than Google Maps
- **More customization** - Full control over styling and behavior
- **Privacy friendly** - No tracking or analytics

### 🔧 Customization
- Easy to modify cluster colors and sizes
- Custom marker icons and tooltips
- Flexible styling with CSS
- Extensible with Leaflet plugins

## Future Enhancements
- [ ] Heat map overlay for donation density
- [ ] Custom map styles (dark mode, satellite)
- [ ] Route planning to donations
- [ ] Real-time updates with WebSocket
- [ ] Offline map support

## Troubleshooting

### Common Issues
1. **Map not loading**: Check internet connection and browser console
2. **Markers not showing**: Verify donation data has valid coordinates
3. **Clustering not working**: Ensure leaflet.markercluster is properly loaded

### Debug Mode
Enable console logging by adding `console.log` statements in the map initialization code.

## Performance Tips
- Limit the number of markers displayed at once
- Use clustering for large datasets
- Implement virtual scrolling for very large lists
- Cache map tiles for offline use 