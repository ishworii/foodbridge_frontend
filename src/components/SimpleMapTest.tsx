import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SimpleMapTest: React.FC = () => {
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    console.log('SimpleMapTest component mounted');
    return () => {
      console.log('SimpleMapTest component unmounted');
    };
  }, []);

  if (mapError) {
    return (
      <div style={{ 
        height: '400px', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Map Error</h3>
          <p>{mapError}</p>
          <button onClick={() => setMapError(null)}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '400px', 
      width: '100%',
      border: '1px solid #ddd',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      <MapContainer 
        center={[42.3601, -71.0589]} 
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => console.log('Map is ready!')}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[42.3601, -71.0589]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default SimpleMapTest; 