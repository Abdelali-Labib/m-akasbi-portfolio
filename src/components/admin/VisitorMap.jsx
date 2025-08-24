"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// A simple mapping from country code to approximate coordinates.
// For a production application, a more robust geocoding solution would be better.
const countryCoordinates = {
  US: [38, -97],    // United States
  FR: [46, 2],      // France
  DE: [51, 10],     // Germany
  GB: [54, -2],     // United Kingdom
  IN: [20, 77],     // India
  CA: [56, -106],   // Canada
  JP: [36, 138],    // Japan
  AU: [-25, 133],   // Australia
  BR: [-14, -51],   // Brazil
  CN: [35, 105],    // China
  ES: [40, -4],     // Spain
  IT: [41, 12],     // Italy
  RU: [61, 99],     // Russia
  MX: [23, -102],   // Mexico
  MA: [31.7917, -7.0926], // Morocco
  DZ: [28.0339, 1.6596],  // Algeria
  TN: [33.8869, 9.5375],  // Tunisia
  EG: [26.0975, 30.0444], // Egypt
  NG: [9.0820, 8.6753],   // Nigeria
  ZA: [-30.5595, 22.9375], // South Africa
  KE: [-0.0236, 37.9062], // Kenya
  // Add more countries as needed
};

const VisitorMap = ({ data }) => {
  
  if (typeof window === 'undefined') {
    return null; // Don't render on the server
  }

  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={2} 
      style={{ height: '100%', width: '100%', backgroundColor: 'transparent', borderRadius: '8px' }}
      scrollWheelZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      />
      {data && data.map((item) => {
        const { countryCode, country, users } = item;
        
        const coordinates = countryCoordinates[countryCode];
        
        if (!coordinates) {
          return null;
        }

        return (
          <CircleMarker
            key={countryCode}
            center={coordinates}
            radius={Math.max(5, Math.min(users / 10, 20))} // Scale radius based on user count
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.7,
              weight: 2,
            }}
          >
            <Popup>
              <div className="font-sans">
                <p className="font-bold text-base">{country}</p>
                <p className="text-sm">{users} visiteurs</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
};

export default VisitorMap;
