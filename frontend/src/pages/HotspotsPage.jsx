import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, MapPin, Layers, Truck, MapIcon, Clock } from 'lucide-react';
import { useCivicPulseData } from '../hooks/useCivicPulseData';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to handle flying to selected marker
const MapUpdater = ({ selectedHotspot }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedHotspot) {
      const coords = parseCoordinates(selectedHotspot.location);
      if (coords) {
        // Zoom and pan to the selected hotspot
        map.flyTo([coords.lat, coords.lon], 11, { duration: 1.5 });
      }
    }
  }, [selectedHotspot, map]);
  return null;
};

const parseCoordinates = (coordStr) => {
  const parts = coordStr.match(/(-?\d+\.?\d*)/g);
  if (parts && parts.length >= 2) {
    return { lat: parseFloat(parts[0]), lon: parseFloat(parts[1]) };
  }
  return null;
};

// Map component using react-leaflet
const IndiaMap = ({ hotspots, selectedHotspot, onMarkerClick }) => {
  const mapRef = useRef(null);

  const handleReset = () => {
    if (mapRef.current) {
      // Bounds of India roughly
      mapRef.current.flyToBounds([
        [8.4, 68.7], // SW
        [35.0, 97.2] // NE
      ], { duration: 1.5 });
    }
  };

  const getColorByUrgency = (severity) => {
    if (severity === 'Critical') return '#f43f5e';
    if (severity === 'High') return '#f97316';
    if (severity === 'Medium') return '#eab308';
    return '#10b981';
  };

  const createCustomIcon = (hotspot, isSelected) => {
    const color = getColorByUrgency(hotspot.severity);
    const pulseClass = isSelected ? 'animate-pulse' : '';
    const scale = isSelected ? 'scale-125' : 'scale-100';
    
    const htmlString = `
      <div class="relative flex items-center justify-center transition-transform duration-300 ${scale}">
        <div class="absolute w-12 h-12 rounded-full opacity-30 ${pulseClass}" style="background-color: ${color}; filter: blur(4px);"></div>
        <div class="absolute w-8 h-8 rounded-full border-2 border-white z-10 flex items-center justify-center shadow-lg" style="background-color: ${color};">
          <span class="text-white font-bold text-xs">${hotspot.complaint_count}</span>
        </div>
      </div>
    `;

    return new L.DivIcon({
      className: 'bg-transparent border-none',
      html: htmlString,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
  };

  // Keep a reference to whether it's initial load to not zoom immediately if we don't want to to, 
  // but selecting first hotspot on load is standard.

  return (
    <div className="w-full h-full rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-blue-900/20 to-slate-900/20 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3 z-[1000] relative">
        <h3 className="text-lg font-black text-white flex items-center">
          <MapIcon className="mr-2 text-indigo-400" size={24} />
          Complete India Map
        </h3>
        <button
          onClick={handleReset}
          className="text-xs px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded hover:bg-indigo-500/30 font-bold cursor-pointer transition-colors"
        >
          Reset View
        </button>
      </div>
      
      {/* react-leaflet map container */}
      <div className="flex-1 rounded-xl border border-blue-500/20 overflow-hidden relative z-0 relative z-0">
        <MapContainer 
          center={[22.5, 80.0]} 
          zoom={4.5} 
          scrollWheelZoom={true} 
          className="w-full h-full"
          maxBounds={[[6.5, 68], [38, 98]]}
          ref={mapRef}
          attributionControl={false}
          style={{ background: '#0a0a1a' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          <MapUpdater selectedHotspot={selectedHotspot} />

          {hotspots.map((hotspot) => {
            const coords = parseCoordinates(hotspot.location);
            if (!coords) return null;
            const isSelected = selectedHotspot?.cluster_id === hotspot.cluster_id;

            return (
              <Marker 
                key={hotspot.cluster_id} 
                position={[coords.lat, coords.lon]}
                icon={createCustomIcon(hotspot, isSelected)}
                eventHandlers={{
                  click: () => onMarkerClick(hotspot),
                }}
              >
              </Marker>
            );
          })}
        </MapContainer>
        
        {/* Legend Overlay */}
        <div className="absolute top-4 right-4 bg-slate-900/90 border border-white/10 p-3 rounded-xl z-[1000] shadow-2xl backdrop-blur-sm pointer-events-none">
          <h4 className="text-white text-xs font-black mb-2 uppercase tracking-wider text-slate-400">Severity Level</h4>
          <div className="space-y-2">
            {[
              { label: 'Critical', color: '#f43f5e' },
              { label: 'High', color: '#f97316' },
              { label: 'Medium', color: '#eab308' },
              { label: 'Low', color: '#10b981' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}></div>
                <span className="text-white text-xs font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center pointer-events-none">Click on any incident in the feed to zoom to that location on the map</p>
    </div>
  );
};

// Live Feed component - FULL HEIGHT SCROLLABLE
const LiveFeedPanel = ({ hotspots, selectedHotspot, onFeedItemClick, onDispatch }) => {
  const [expandedFeed, setExpandedFeed] = useState(null);
  const [dispatchedItems, setDispatchedItems] = useState(new Set());

  const handleDispatch = (hotspotId, e) => {
    e.stopPropagation();
    setDispatchedItems(prev => new Set([...prev, hotspotId]));
    onDispatch(hotspotId);
    setTimeout(() => {
      setDispatchedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(hotspotId);
        return newSet;
      });
    }, 3000);
  };

  const getUrgencyBadgeStyle = (severity) => {
    if (severity === 'Critical') 
      return { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', dot: 'bg-rose-500' };
    if (severity === 'High') 
      return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' };
    if (severity === 'Medium') 
      return { bg: 'bg-amber-400/10', border: 'border-amber-400/30', text: 'text-amber-400', dot: 'bg-amber-400' };
    return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' };
  };

  return (
    <div className="w-full h-full flex flex-col gap-0 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="px-5 py-4 flex-shrink-0 border-b border-white/10">
        <h3 className="text-lg font-black text-white flex items-center">
          <Clock className="mr-2 text-indigo-400" size={20} />
          Live Incident Feed
        </h3>
      </div>

      {/* Scrollable feed area */}
      <div className="flex-1 overflow-y-auto space-y-3 px-5 py-4 custom-scrollbar">
        {hotspots.map((hotspot) => {
          const styles = getUrgencyBadgeStyle(hotspot.severity);
          const isSelected = selectedHotspot?.cluster_id === hotspot.cluster_id;
          const isDispatched = dispatchedItems.has(hotspot.cluster_id);

            return (
              <div
                key={hotspot.cluster_id}
                onClick={() => onFeedItemClick(hotspot)}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden relative group flex-shrink-0 ${
                  isSelected
                    ? `border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]`
                    : `border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8`
                }`}
              >
                {isSelected && <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/20 blur-2xl rounded-full pointer-events-none" />}

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-8 rounded-full ${styles.dot}`}></div>
                      <div>
                        <h4 className="font-black text-white text-sm leading-tight">{hotspot.cluster_id}</h4>
                        <p className="text-xs text-slate-400 font-semibold">{hotspot.category}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${styles.bg} ${styles.border} ${styles.text} whitespace-nowrap`}>
                      {hotspot.severity}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 mb-3 line-clamp-2 leading-relaxed">
                    "{hotspot.representative_text}"
                  </p>

                  {/* Info row */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-slate-400 flex items-center flex-wrap gap-1">
                      <MapPin size={12} />
                      {hotspot.ward}
                    </span>
                    <span className="font-bold text-white">{hotspot.complaint_count} reports</span>
                  </div>

                  {/* Dispatch button */}
                  <button
                    onClick={(e) => handleDispatch(hotspot.cluster_id, e)}
                    disabled={isDispatched}
                    className={`w-full py-2 px-3 rounded-lg font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                      isDispatched
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                        : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30 hover:border-indigo-500/50'
                    }`}
                  >
                    <Truck size={13} />
                    {isDispatched ? '✓ Dispatched!' : 'Dispatch Unit'}
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export const HotspotsPage = () => {
  const { analytics } = useCivicPulseData();
  const hotspots = analytics?.hotspots || [];
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!selectedHotspot && hotspots.length > 0) {
      setSelectedHotspot(hotspots[0]);
    }
  }, [hotspots, selectedHotspot]);

  const handleDispatch = (hotspotId) => {
    const hotspot = hotspots.find(h => h.cluster_id === hotspotId);
    if (!hotspot) return;
    setToastMessage(`🚗 Ground unit dispatched to ${hotspot.cluster_id} - ${hotspot.ward}!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #080818 0%, #0d0d25 60%, #12122e 100%)' }}>
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col h-screen p-6 gap-6">
        
        {/* Header */}
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight flex items-center mb-2">
            AI Pulse Map <Layers className="ml-4 text-indigo-400/50" size={32} />
          </h2>
          <p className="text-slate-400 font-medium text-lg">
            PySpark DBSCAN grouped incidents requiring holistic ground intervention.
          </p>
        </div>

        {/* Main content: 50-50 Split */}
        <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
          
          {/* Left: Map */}
          <div className="min-h-0">
            <IndiaMap
              hotspots={hotspots}
              selectedHotspot={selectedHotspot}
              onMarkerClick={setSelectedHotspot}
            />
          </div>

          {/* Right: Live Feed */}
          <div className="min-h-0">
            <LiveFeedPanel
              hotspots={hotspots}
              selectedHotspot={selectedHotspot}
              onFeedItemClick={setSelectedHotspot}
              onDispatch={handleDispatch}
            />
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 px-6 py-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-xl font-bold shadow-2xl animate-in slide-in-from-bottom-5 duration-300 z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default HotspotsPage;
